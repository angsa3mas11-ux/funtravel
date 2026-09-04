"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RequestStatus = "pending" | "accepted" | "declined";

type PartnerRequest = {
  partnerId: string;
  status: RequestStatus;
  respondedAt?: string;
};

type Trip = {
  id: string;
  userId?: string;
  userEmail?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  budget?: string;
  interests?: string;
  travelStyle?: string;
  specialRequest?: string;

  hasFlight?: boolean;
  arrivalFlight?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  departureFlight?: string;
  departureDate?: string;
  departureTime?: string;

  airportPickup?: "funtravel" | "own" | "";

  hotelOption?: "own" | "later" | "";
  hotelName?: string;
  hotelAddress?: string;
  bookingNumber?: string;

  /*
   * Request dari sistem kepada partner.
   * Tidak lagi menggunakan assignment dari Admin.
   */
  driverRequests?: PartnerRequest[];
  guideRequests?: PartnerRequest[];

  /*
   * Partner yang akhirnya menerima trip.
   */
  driverId?: string;
  guideId?: string;

  driverStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Guest picked up"
    | "Completed";

  guideStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Tour started"
    | "Completed";
};

type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: "pending" | "approved" | "rejected";
};

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  experience: string;
  languages: string;
  specialties: string;
  areas: string;
  status: "pending" | "approved" | "rejected";
};

export default function AdminTripsPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "waiting" | "accepted" | "declined" | "completed"
  >("all");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem(
      "funtravel_admin_logged_in"
    );

    if (adminLoggedIn !== "true") {
      router.replace("/partner/admin/login");
      return;
    }

    loadData();
  }, [router]);

  /*
   * Load semua data.
   */
  const loadData = () => {
    try {
      const storedTrips =
        localStorage.getItem("funtravel_trips");

      const storedDrivers =
        localStorage.getItem("funtravel_drivers");

      const storedGuides =
        localStorage.getItem("funtravel_guides");

      const parsedTrips: Trip[] = storedTrips
        ? JSON.parse(storedTrips)
        : [];

      const parsedDrivers: Driver[] = storedDrivers
        ? JSON.parse(storedDrivers)
        : [];

      const parsedGuides: Guide[] = storedGuides
        ? JSON.parse(storedGuides)
        : [];

      setTrips(parsedTrips);

      setDrivers(
        parsedDrivers.filter(
          (driver) => driver.status === "approved"
        )
      );

      setGuides(
        parsedGuides.filter(
          (guide) => guide.status === "approved"
        )
      );
    } catch {
      setError("Unable to load trip monitoring data.");
    }
  };

  /*
   * Cari driver berdasarkan ID.
   */
  const getDriver = (driverId?: string) => {
    if (!driverId) return null;

    return (
      drivers.find(
        (driver) => driver.id === driverId
      ) || null
    );
  };

  /*
   * Cari guide berdasarkan ID.
   */
  const getGuide = (guideId?: string) => {
    if (!guideId) return null;

    return (
      guides.find(
        (guide) => guide.id === guideId
      ) || null
    );
  };

  /*
   * Ambil semua request driver.
   */
  const getDriverRequests = (trip: Trip) => {
    return trip.driverRequests || [];
  };

  /*
   * Ambil semua request guide.
   */
  const getGuideRequests = (trip: Trip) => {
    return trip.guideRequests || [];
  };

  /*
   * Status keseluruhan trip.
   */
  const getTripStatus = (trip: Trip) => {
    const driverRequests =
      getDriverRequests(trip);

    const guideRequests =
      getGuideRequests(trip);

    const driverAccepted =
      Boolean(trip.driverId) &&
      trip.driverStatus === "accepted";

    const guideAccepted =
      Boolean(trip.guideId) &&
      trip.guideStatus === "accepted";

    const driverRequired =
      trip.airportPickup === "funtravel" ||
      driverRequests.length > 0;

    const guideRequired =
      guideRequests.length > 0 ||
      Boolean(trip.guideId);

    const driverDeclined =
      driverRequests.some(
        (request) =>
          request.status === "declined"
      );

    const guideDeclined =
      guideRequests.some(
        (request) =>
          request.status === "declined"
      );

    if (
      driverRequired &&
      guideRequired &&
      driverAccepted &&
      guideAccepted
    ) {
      return "completed_assignment";
    }

    if (
      driverRequired &&
      !driverAccepted &&
      driverRequests.some(
        (request) =>
          request.status === "pending"
      )
    ) {
      return "waiting";
    }

    if (
      guideRequired &&
      !guideAccepted &&
      guideRequests.some(
        (request) =>
          request.status === "pending"
      )
    ) {
      return "waiting";
    }

    if (driverDeclined || guideDeclined) {
      return "declined";
    }

    if (
      driverAccepted ||
      guideAccepted
    ) {
      return "accepted";
    }

    return "waiting";
  };

  /*
   * Filter trip.
   */
  const filteredTrips = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return [...trips]
      .filter((trip) => {
        if (!keyword) return true;

        return (
          trip.userEmail
            ?.toLowerCase()
            .includes(keyword) ||
          trip.destination
            ?.toLowerCase()
            .includes(keyword) ||
          trip.hotelName
            ?.toLowerCase()
            .includes(keyword) ||
          trip.arrivalFlight
            ?.toLowerCase()
            .includes(keyword)
        );
      })
      .filter((trip) => {
        const status =
          getTripStatus(trip);

        if (filter === "waiting") {
          return status === "waiting";
        }

        if (filter === "accepted") {
          return status === "accepted";
        }

        if (filter === "declined") {
          return status === "declined";
        }

        if (filter === "completed") {
          return (
            status ===
            "completed_assignment"
          );
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.startDate || ""
        ).getTime();

        const dateB = new Date(
          b.startDate || ""
        ).getTime();

        return dateA - dateB;
      });
  }, [trips, search, filter]);

  /*
   * Statistik monitoring.
   */
  const stats = useMemo(() => {
    let waiting = 0;
    let accepted = 0;
    let declined = 0;
    let completed = 0;

    trips.forEach((trip) => {
      const status =
        getTripStatus(trip);

      if (status === "waiting") {
        waiting++;
      }

      if (status === "accepted") {
        accepted++;
      }

      if (status === "declined") {
        declined++;
      }

      if (
        status ===
        "completed_assignment"
      ) {
        completed++;
      }
    });

    return {
      total: trips.length,
      waiting,
      accepted,
      declined,
      completed,
    };
  }, [trips]);

  /*
   * Format tanggal.
   */
  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Format waktu response.
   */
  const formatResponseDate = (
    date?: string
  ) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return date;
    }

    return parsed.toLocaleString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
   * Badge status partner.
   */
  const RequestStatusBadge = ({
    status,
  }: {
    status: RequestStatus;
  }) => {
    if (status === "accepted") {
      return (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          ✓ Accepted
        </span>
      );
    }

    if (status === "declined") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
          ✕ Declined
        </span>
      );
    }

    return (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        ⏳ Pending
      </span>
    );
  };

  /*
   * Logout admin.
   */
  const logout = () => {
    localStorage.removeItem(
      "funtravel_admin_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_admin"
    );

    router.push(
      "/partner/admin/login"
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              FunTravel Admin
            </p>

            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              Trip Monitoring
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor driver and guide responses to traveler trip requests.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/admin"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            href="/partner/admin/drivers"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            Drivers
          </Link>

          <Link
            href="/partner/admin/guides"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            Guides
          </Link>

          <Link
            href="/partner/admin/trips"
            className="whitespace-nowrap border-b-2 border-blue-600 px-4 py-3 text-sm font-bold text-blue-600"
          >
            Trip Monitoring
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* MESSAGE */}
        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Total Trips
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Waiting
            </p>

            <p className="mt-2 text-3xl font-black text-amber-700">
              {stats.waiting}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Accepted
            </p>

            <p className="mt-2 text-3xl font-black text-blue-700">
              {stats.accepted}
            </p>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
              Declined
            </p>

            <p className="mt-2 text-3xl font-black text-red-700">
              {stats.declined}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              All Accepted
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-700">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by guest email, destination, hotel, or flight..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {[
                ["all", "All"],
                ["waiting", "Waiting"],
                ["accepted", "Accepted"],
                ["declined", "Declined"],
                ["completed", "All Accepted"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(
                      value as
                        | "all"
                        | "waiting"
                        | "accepted"
                        | "declined"
                        | "completed"
                    )
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                    filter === value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TRIP LIST */}
        <div className="mt-6 space-y-4">
          {filteredTrips.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-5xl">
                🧳
              </div>

              <h2 className="mt-4 text-lg font-black text-slate-900">
                No trips found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Traveler trips will appear here when they create a trip.
              </p>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const driverRequests =
                getDriverRequests(trip);

              const guideRequests =
                getGuideRequests(trip);

              const acceptedDriver =
                getDriver(trip.driverId);

              const acceptedGuide =
                getGuide(trip.guideId);

              const tripStatus =
                getTripStatus(trip);

              const isAllAccepted =
                tripStatus ===
                "completed_assignment";

              return (
                <div
                  key={trip.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* HEADER */}
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                            Lombok Trip
                          </span>

                          {tripStatus ===
                            "waiting" && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                              ⏳ Waiting for Response
                            </span>
                          )}

                          {tripStatus ===
                            "accepted" && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              ✓ Partially Accepted
                            </span>
                          )}

                          {tripStatus ===
                            "declined" && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              ✕ Partner Declined
                            </span>
                          )}

                          {isAllAccepted && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                              ✓ All Required Partners Accepted
                            </span>
                          )}

                          {trip.airportPickup ===
                            "funtravel" && (
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                              Airport Pickup
                            </span>
                          )}
                        </div>

                        <h2 className="mt-3 text-xl font-black text-slate-900">
                          {trip.destination ||
                            "Lombok Trip"}
                        </h2>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          Guest:{" "}
                          {trip.userEmail ||
                            "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTrip(trip)
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </div>

                    {/* BASIC INFO */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Dates
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatDate(
                            trip.startDate
                          )}
                        </p>

                        <p className="text-xs text-slate-500">
                          to{" "}
                          {formatDate(
                            trip.endDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Travelers
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {trip.travelers ||
                            "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Arrival
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {trip.arrivalDate
                            ? formatDate(
                                trip.arrivalDate
                              )
                            : "-"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {trip.arrivalTime ||
                            ""}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Hotel
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-800">
                          {trip.hotelName ||
                            "Not selected"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PARTNER ACTIVITY */}
                  <div className="grid gap-5 p-5 lg:grid-cols-2">
                    {/* DRIVER ACTIVITY */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                            Driver Activity
                          </p>

                          <h3 className="mt-1 text-lg font-black text-slate-900">
                            Trip Driver Request
                          </h3>
                        </div>

                        <span className="text-2xl">
                          🚗
                        </span>
                      </div>

                      {trip.driverId &&
                        acceptedDriver && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                  Accepted By
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-900">
                                  {
                                    acceptedDriver.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    acceptedDriver.vehicleModel
                                  }{" "}
                                  •{" "}
                                  {
                                    acceptedDriver.vehiclePlate
                                  }
                                </p>
                              </div>

                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                Accepted
                              </span>
                            </div>
                          </div>
                        )}

                      {driverRequests.length >
                        0 ? (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Request Activity
                          </p>

                          {driverRequests.map(
                            (request) => {
                              const driver =
                                getDriver(
                                  request.partnerId
                                );

                              return (
                                <div
                                  key={
                                    request.partnerId
                                  }
                                  className="rounded-xl bg-white p-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-slate-800">
                                        {driver?.name ||
                                          "Driver"}
                                      </p>

                                      {driver && (
                                        <p className="mt-1 text-xs text-slate-500">
                                          {
                                            driver.vehicleModel
                                          }{" "}
                                          •{" "}
                                          {
                                            driver.vehiclePlate
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <RequestStatusBadge
                                      status={
                                        request.status
                                      }
                                    />
                                  </div>

                                  {request.respondedAt && (
                                    <p className="mt-2 text-[11px] text-slate-400">
                                      Responded:{" "}
                                      {formatResponseDate(
                                        request.respondedAt
                                      )}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : !trip.driverId ? (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-sm font-bold text-slate-700">
                            No driver response yet.
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            The driver request will appear here when the system sends the trip request to approved drivers.
                          </p>
                        </div>
                      ) : null}

                      {trip.airportPickup !==
                        "funtravel" &&
                        !trip.driverId &&
                        driverRequests.length ===
                          0 && (
                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            Traveler did not request FunTravel airport transportation.
                          </p>
                        )}
                    </div>

                    {/* GUIDE ACTIVITY */}
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                            Guide Activity
                          </p>

                          <h3 className="mt-1 text-lg font-black text-slate-900">
                            Trip Guide Request
                          </h3>
                        </div>

                        <span className="text-2xl">
                          🧭
                        </span>
                      </div>

                      {trip.guideId &&
                        acceptedGuide && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                  Accepted By
                                </p>

                                <p className="mt-1 text-sm font-black text-slate-900">
                                  {
                                    acceptedGuide.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    acceptedGuide.specialties
                                  }
                                </p>
                              </div>

                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                Accepted
                              </span>
                            </div>
                          </div>
                        )}

                      {guideRequests.length >
                      0 ? (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                            Request Activity
                          </p>

                          {guideRequests.map(
                            (request) => {
                              const guide =
                                getGuide(
                                  request.partnerId
                                );

                              return (
                                <div
                                  key={
                                    request.partnerId
                                  }
                                  className="rounded-xl bg-white p-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-black text-slate-800">
                                        {guide?.name ||
                                          "Guide"}
                                      </p>

                                      {guide && (
                                        <p className="mt-1 text-xs text-slate-500">
                                          {
                                            guide.areas
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <RequestStatusBadge
                                      status={
                                        request.status
                                      }
                                    />
                                  </div>

                                  {request.respondedAt && (
                                    <p className="mt-2 text-[11px] text-slate-400">
                                      Responded:{" "}
                                      {formatResponseDate(
                                        request.respondedAt
                                      )}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : !trip.guideId ? (
                        <div className="mt-4 rounded-xl bg-white p-4">
                          <p className="text-sm font-bold text-slate-700">
                            No guide response yet.
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            The guide request will appear here when the system sends the trip request to approved guides.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* SUMMARY */}
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Driver
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {acceptedDriver
                            ? acceptedDriver.name
                            : "Waiting for driver response"}
                        </p>

                        {trip.driverStatus && (
                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            Status:{" "}
                            {trip.driverStatus}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          Guide
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-800">
                          {acceptedGuide
                            ? acceptedGuide.name
                            : "Waiting for guide response"}
                        </p>

                        {trip.guideStatus && (
                          <p className="mt-1 text-xs font-semibold text-purple-600">
                            Status:{" "}
                            {trip.guideStatus}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Trip Monitoring
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {selectedTrip.destination ||
                    "Lombok Trip"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Guest:{" "}
                  {selectedTrip.userEmail ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTrip(null)
                }
                className="rounded-xl bg-slate-100 px-3 py-2 text-lg font-bold text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* TRIP INFO */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Trip Information
                </h3>

                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Start Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatDate(
                        selectedTrip.startDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      End Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatDate(
                        selectedTrip.endDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Travelers
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedTrip.travelers ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Airport Pickup
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedTrip.airportPickup ===
                      "funtravel"
                        ? "FunTravel Driver"
                        : selectedTrip.airportPickup ===
                          "own"
                        ? "Traveler's Own Transportation"
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </section>

              {/* FLIGHT */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Flight
                </h3>

                <div className="mt-2 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Arrival
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Flight:{" "}
                    {selectedTrip.arrivalFlight ||
                      "-"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Date:{" "}
                    {formatDate(
                      selectedTrip.arrivalDate
                    )}
                  </p>

                  <p className="text-sm text-slate-600">
                    Time:{" "}
                    {selectedTrip.arrivalTime ||
                      "-"}
                  </p>

                  <div className="my-4 h-px bg-slate-200" />

                  <p className="text-sm font-bold text-slate-900">
                    Departure
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Flight:{" "}
                    {selectedTrip.departureFlight ||
                      "-"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Date:{" "}
                    {formatDate(
                      selectedTrip.departureDate
                    )}
                  </p>

                  <p className="text-sm text-slate-600">
                    Time:{" "}
                    {selectedTrip.departureTime ||
                      "-"}
                  </p>
                </div>
              </section>

              {/* HOTEL */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Accommodation
                </h3>

                <div className="mt-2 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {selectedTrip.hotelName ||
                      "Not selected"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {selectedTrip.hotelAddress ||
                      "-"}
                  </p>

                  {selectedTrip.bookingNumber && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Booking:{" "}
                      {
                        selectedTrip.bookingNumber
                      }
                    </p>
                  )}
                </div>
              </section>

              {/* DRIVER REQUESTS */}
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Driver Responses
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    {
                      getDriverRequests(
                        selectedTrip
                      ).length
                    }{" "}
                    Requests
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  {getDriverRequests(
                    selectedTrip
                  ).length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        No driver response has been recorded yet.
                      </p>
                    </div>
                  ) : (
                    getDriverRequests(
                      selectedTrip
                    ).map((request) => {
                      const driver =
                        getDriver(
                          request.partnerId
                        );

                      return (
                        <div
                          key={
                            request.partnerId
                          }
                          className="rounded-2xl bg-blue-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {driver?.name ||
                                  "Unknown Driver"}
                              </p>

                              {driver && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    driver.vehicleModel
                                  }{" "}
                                  •{" "}
                                  {
                                    driver.vehiclePlate
                                  }
                                </p>
                              )}
                            </div>

                            <RequestStatusBadge
                              status={
                                request.status
                              }
                            />
                          </div>

                          {request.respondedAt && (
                            <p className="mt-2 text-xs text-slate-500">
                              Response time:{" "}
                              {formatResponseDate(
                                request.respondedAt
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* GUIDE REQUESTS */}
              <section>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    Guide Responses
                  </h3>

                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                    {
                      getGuideRequests(
                        selectedTrip
                      ).length
                    }{" "}
                    Requests
                  </span>
                </div>

                <div className="mt-2 space-y-2">
                  {getGuideRequests(
                    selectedTrip
                  ).length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        No guide response has been recorded yet.
                      </p>
                    </div>
                  ) : (
                    getGuideRequests(
                      selectedTrip
                    ).map((request) => {
                      const guide =
                        getGuide(
                          request.partnerId
                        );

                      return (
                        <div
                          key={
                            request.partnerId
                          }
                          className="rounded-2xl bg-purple-50 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {guide?.name ||
                                  "Unknown Guide"}
                              </p>

                              {guide && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {
                                    guide.areas
                                  }
                                </p>
                              )}
                            </div>

                            <RequestStatusBadge
                              status={
                                request.status
                              }
                            />
                          </div>

                          {request.respondedAt && (
                            <p className="mt-2 text-xs text-slate-500">
                              Response time:{" "}
                              {formatResponseDate(
                                request.respondedAt
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* SPECIAL REQUEST */}
              {selectedTrip.specialRequest && (
                <section>
                  <h3 className="text-sm font-black text-slate-900">
                    Special Request
                  </h3>

                  <div className="mt-2 rounded-2xl bg-amber-50 p-4">
                    <p className="text-sm leading-6 text-amber-800">
                      {
                        selectedTrip.specialRequest
                      }
                    </p>
                  </div>
                </section>
              )}
            </div>

            <div className="border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedTrip(null)
                }
                className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}