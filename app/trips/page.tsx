"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import CustomerService from "../../components/CustomerService";

type User = {
  id: string;
  name: string;
  email: string;
};

type Trip = {
  id: string;
  userId: string;
  userEmail: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
  interests: string;
  travelStyle: string;
  specialRequest: string;
  createdAt: string;

  hasFlight?: string;

  arrivalFlight?: string;
  arrivalDate?: string;
  arrivalTime?: string;

  departureFlight?: string;
  departureDate?: string;
  departureTime?: string;

  airportPickup?: string;

  accommodationType?: string;
  hotelName?: string;
  hotelAddress?: string;
  bookingNumber?: string;

  driverId?: string;
  driverName?: string;
  driverPhoto?: string;
  driverPhone?: string;
  driverWhatsapp?: string;
  driverRating?: string;
  vehicle?: string;
  plateNumber?: string;
  meetingPoint?: string;
};

type DestinationImage = {
  url: string;
  title: string;
};

type TripStatus = {
  label: string;
  description: string;
  color: string;
  icon: string;
};

export default function TripsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [images, setImages] = useState<Record<string, DestinationImage>>(
    {}
  );

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // =========================================================
  // AUTH + LOAD TRIPS
  // =========================================================

  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_logged_in");
    const currentUser = localStorage.getItem("funtravel_current_user");

    if (loggedIn !== "true" || !currentUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(currentUser);

      if (!parsedUser?.id || !parsedUser?.email) {
        throw new Error("Invalid user");
      }

      setUser(parsedUser);

      const storedTrips = localStorage.getItem("funtravel_trips");

      if (!storedTrips) {
        setTrips([]);
        setLoading(false);
        return;
      }

      const parsedTrips: Trip[] = JSON.parse(storedTrips);

      if (!Array.isArray(parsedTrips)) {
        setTrips([]);
        setLoading(false);
        return;
      }

      // =====================================================
      // MIGRATION
      // Some older trips may not have userId.
      // Match them using userEmail.
      // =====================================================

      const migratedTrips = parsedTrips.map((trip) => {
        if (
          (!trip.userId || trip.userId === "") &&
          trip.userEmail?.toLowerCase() ===
            parsedUser.email.toLowerCase()
        ) {
          return {
            ...trip,
            userId: parsedUser.id,
          };
        }

        return trip;
      });

      const userTrips = migratedTrips.filter(
        (trip) =>
          trip.userId === parsedUser.id ||
          trip.userEmail?.toLowerCase() ===
            parsedUser.email.toLowerCase()
      );

      userTrips.sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.startDate || ""
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.startDate || ""
        ).getTime();

        return dateB - dateA;
      });

      setTrips(userTrips);

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(migratedTrips)
      );

      setLoading(false);
    } catch {
      localStorage.removeItem("funtravel_logged_in");
      localStorage.removeItem("funtravel_current_user");
      router.push("/login");
    }
  }, [router]);

  // =========================================================
  // LOMBOK DESTINATION IMAGE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      const uniqueDestinations = Array.from(
        new Set(
          trips
            .map((trip) => trip.destination)
            .filter(Boolean)
        )
      );

      if (uniqueDestinations.length === 0) {
        return;
      }

      const result: Record<string, DestinationImage> = {};

      await Promise.all(
        uniqueDestinations.map(async (destination) => {
          try {
            const query = encodeURIComponent(
              `${destination} Lombok Indonesia`
            );

            const response = await fetch(
              `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
            );

            if (!response.ok) return;

            const data = await response.json();

            const pages = data?.query?.pages
              ? Object.values(data.query.pages)
              : [];

            const first = pages[0] as any;

            const url =
              first?.imageinfo?.[0]?.thumburl ||
              first?.imageinfo?.[0]?.url;

            if (url) {
              result[destination] = {
                url,
                title:
                  first.title?.replace("File:", "") ||
                  destination,
              };
            }
          } catch {
            // Ignore image errors.
          }
        })
      );

      if (!cancelled) {
        setImages(result);
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [trips]);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const formatDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFullDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDuration = (trip: Trip) => {
    if (!trip.startDate || !trip.endDate) {
      return 1;
    }

    const start = new Date(
      `${trip.startDate}T00:00:00`
    );

    const end = new Date(
      `${trip.endDate}T00:00:00`
    );

    const difference =
      end.getTime() - start.getTime();

    return Math.max(
      1,
      Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getTripStatus = (trip: Trip): TripStatus => {
    const now = new Date();

    const start = trip.startDate
      ? new Date(`${trip.startDate}T00:00:00`)
      : null;

    const end = trip.endDate
      ? new Date(`${trip.endDate}T23:59:59`)
      : null;

    if (end && now > end) {
      return {
        label: "Trip Completed",
        description: "Your Lombok journey has been completed.",
        color: "bg-green-100 text-green-700",
        icon: "✓",
      };
    }

    if (start && end && now >= start && now <= end) {
      return {
        label: "Trip In Progress",
        description: "Enjoy your Lombok adventure!",
        color: "bg-blue-100 text-blue-700",
        icon: "🏝️",
      };
    }

    if (trip.driverName || trip.driverId) {
      return {
        label: "Driver Assigned",
        description: "Your airport pickup driver is ready.",
        color: "bg-green-100 text-green-700",
        icon: "🚗",
      };
    }

    if (trip.airportPickup === "funtravel") {
      return {
        label: "Preparing Your Trip",
        description: "FunTravel is preparing your journey.",
        color: "bg-blue-100 text-blue-700",
        icon: "🛠️",
      };
    }

    return {
      label: "Trip Ready",
      description: "Your Lombok trip has been planned.",
      color: "bg-indigo-100 text-indigo-700",
      icon: "✓",
    };
  };

  // =========================================================
  // TRIP GROUPS
  // =========================================================

  const upcomingTrips = useMemo(() => {
    const now = new Date();

    return trips.filter((trip) => {
      if (!trip.endDate) return true;

      const end = new Date(
        `${trip.endDate}T23:59:59`
      );

      return end >= now;
    });
  }, [trips]);

  const completedTrips = useMemo(() => {
    const now = new Date();

    return trips.filter((trip) => {
      if (!trip.endDate) return false;

      const end = new Date(
        `${trip.endDate}T23:59:59`
      );

      return end < now;
    });
  }, [trips]);

  const activeTrip = useMemo(() => {
    const now = new Date();

    return (
      trips.find((trip) => {
        if (!trip.startDate || !trip.endDate) {
          return false;
        }

        const start = new Date(
          `${trip.startDate}T00:00:00`
        );

        const end = new Date(
          `${trip.endDate}T23:59:59`
        );

        return now >= start && now <= end;
      }) ||
      upcomingTrips[0] ||
      null
    );
  }, [trips, upcomingTrips]);

  const uniqueDestinations = useMemo(() => {
    return new Set(
      trips.map((trip) =>
        trip.destination.trim().toLowerCase()
      )
    ).size;
  }, [trips]);

  // =========================================================
  // VIEW TRIP
  // =========================================================

  const viewTrip = (trip: Trip) => {
    const params = new URLSearchParams();

    params.set("tripId", trip.id);

    params.set("userId", trip.userId || "");
    params.set("userEmail", trip.userEmail || "");

    params.set(
      "destination",
      trip.destination || "Lombok"
    );

    params.set("startDate", trip.startDate || "");
    params.set("endDate", trip.endDate || "");
    params.set("travelers", trip.travelers || "1");

    params.set("budget", trip.budget || "");
    params.set("interests", trip.interests || "");
    params.set("travelStyle", trip.travelStyle || "");

    params.set(
      "specialRequest",
      trip.specialRequest || ""
    );

    params.set(
      "hasFlight",
      trip.hasFlight || "false"
    );

    params.set(
      "arrivalFlight",
      trip.arrivalFlight || ""
    );

    params.set(
      "arrivalDate",
      trip.arrivalDate || ""
    );

    params.set(
      "arrivalTime",
      trip.arrivalTime || ""
    );

    params.set(
      "departureFlight",
      trip.departureFlight || ""
    );

    params.set(
      "departureDate",
      trip.departureDate || ""
    );

    params.set(
      "departureTime",
      trip.departureTime || ""
    );

    params.set(
      "airportPickup",
      trip.airportPickup || ""
    );

    params.set(
      "accommodationType",
      trip.accommodationType || ""
    );

    params.set(
      "hotelName",
      trip.hotelName || ""
    );

    params.set(
      "hotelAddress",
      trip.hotelAddress || ""
    );

    params.set(
      "bookingNumber",
      trip.bookingNumber || ""
    );

    params.set(
      "driverId",
      trip.driverId || ""
    );

    params.set(
      "driverName",
      trip.driverName || ""
    );

    params.set(
      "driverPhoto",
      trip.driverPhoto || ""
    );

    params.set(
      "driverPhone",
      trip.driverPhone || ""
    );

    params.set(
      "driverWhatsapp",
      trip.driverWhatsapp || ""
    );

    params.set(
      "driverRating",
      trip.driverRating || ""
    );

    params.set(
      "vehicle",
      trip.vehicle || ""
    );

    params.set(
      "plateNumber",
      trip.plateNumber || ""
    );

    params.set(
      "meetingPoint",
      trip.meetingPoint || ""
    );

    router.push(`/trip?${params.toString()}`);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const openDeleteModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;

    setShowDeleteModal(false);
    setSelectedTrip(null);
  };

  const deleteTrip = () => {
    if (!selectedTrip) return;

    setDeletingId(selectedTrip.id);

    try {
      const stored = localStorage.getItem(
        "funtravel_trips"
      );

      if (stored) {
        const allTrips: Trip[] = JSON.parse(stored);

        const filteredTrips = allTrips.filter(
          (trip) => trip.id !== selectedTrip.id
        );

        localStorage.setItem(
          "funtravel_trips",
          JSON.stringify(filteredTrips)
        );

        setTrips((current) =>
          current.filter(
            (trip) => trip.id !== selectedTrip.id
          )
        );
      }

      setTimeout(() => {
        setDeletingId(null);
        setShowDeleteModal(false);
        setSelectedTrip(null);
      }, 300);
    } catch {
      setDeletingId(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading your Lombok trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                🧳 Your Lombok Collection
              </div>

              <h1 className="text-3xl font-bold sm:text-4xl">
                My Trips
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Semua perjalanan Lombok kamu tersimpan di satu
                tempat. Dari persiapan sampai perjalanan selesai.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-5 py-3.5 font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              + Plan New Lombok Trip
            </Link>
          </div>
        </section>

        {/* ================================================= */}
        {/* STATS */}
        {/* ================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 text-2xl">🧳</div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Trips
            </p>

            <p className="mt-1 text-2xl font-bold">
              {trips.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 text-2xl">📅</div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Upcoming
            </p>

            <p className="mt-1 text-2xl font-bold">
              {upcomingTrips.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 text-2xl">✓</div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold">
              {completedTrips.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-3 text-2xl">📍</div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lombok Destinations
            </p>

            <p className="mt-1 text-2xl font-bold">
              {uniqueDestinations}
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {trips.length === 0 ? (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-4xl">
              🏝️
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No Lombok trips yet
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Your saved Lombok adventures will appear here.
              Start planning your first trip and let FunTravel
              help organize the journey.
            </p>

            <Link
              href="/planner"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Plan My Lombok Trip →
            </Link>
          </section>
        ) : (
          <>
            {/* ================================================= */}
            {/* ACTIVE / NEXT TRIP */}
            {/* ================================================= */}

            {activeTrip && (
              <section className="mb-8">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    {(() => {
                      const status =
                        getTripStatus(activeTrip);

                      if (
                        status.label === "Trip In Progress"
                      ) {
                        return "Current Trip";
                      }

                      return "Next Trip";
                    })()}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Your Lombok Journey
                  </h2>
                </div>

                <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                  <div className="grid lg:grid-cols-5">
                    <div className="relative h-64 lg:col-span-2 lg:h-full lg:min-h-[360px]">
                      {images[activeTrip.destination] ? (
                        <img
                          src={
                            images[activeTrip.destination].url
                          }
                          alt={activeTrip.destination}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[260px] items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-7xl">
                          🏝️
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                        LOMBOK
                      </div>
                    </div>

                    <div className="p-6 lg:col-span-3 sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold sm:text-3xl">
                            {activeTrip.destination}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            {formatFullDate(
                              activeTrip.startDate
                            )}{" "}
                            —{" "}
                            {formatFullDate(
                              activeTrip.endDate
                            )}
                          </p>
                        </div>

                        {(() => {
                          const status =
                            getTripStatus(activeTrip);

                          return (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${status.color}`}
                            >
                              <span>{status.icon}</span>
                              {status.label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 font-bold">
                            {getDuration(activeTrip)}{" "}
                            {getDuration(activeTrip) === 1
                              ? "Day"
                              : "Days"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Travelers
                          </p>

                          <p className="mt-1 font-bold">
                            {activeTrip.travelers}{" "}
                            {Number(
                              activeTrip.travelers
                            ) === 1
                              ? "Person"
                              : "People"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Flight
                          </p>

                          <p className="mt-1 font-bold">
                            {activeTrip.hasFlight === "true"
                              ? "✓ Added"
                              : "Not added"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Airport Pickup
                          </p>

                          <p className="mt-1 font-bold">
                            {activeTrip.airportPickup ===
                            "funtravel"
                              ? "FunTravel Pickup"
                              : "Own Transport"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            viewTrip(activeTrip)
                          }
                          className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                        >
                          View My Trip →
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal(activeTrip)
                          }
                          className="rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>

                      {(() => {
                        const status =
                          getTripStatus(activeTrip);

                        return (
                          <p className="mt-4 text-xs text-slate-400">
                            {status.description}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ================================================= */}
            {/* UPCOMING */}
            {/* ================================================= */}

            {upcomingTrips.length > 0 && (
              <section className="mb-10">
                <div className="mb-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Upcoming
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Upcoming Lombok Trips
                  </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {upcomingTrips.map((trip) => {
                    if (
                      activeTrip &&
                      trip.id === activeTrip.id
                    ) {
                      return null;
                    }

                    const status = getTripStatus(trip);
                    const image = images[trip.destination];

                    return (
                      <article
                        key={trip.id}
                        className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="relative h-52">
                          {image ? (
                            <img
                              src={image.url}
                              alt={trip.destination}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-6xl">
                              🏝️
                            </div>
                          )}

                          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                            LOMBOK
                          </div>

                          <div
                            className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${status.color}`}
                          >
                            {status.icon} {status.label}
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-xl font-bold">
                            {trip.destination}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(trip.startDate)} —{" "}
                            {formatDate(trip.endDate)}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Travelers
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {trip.travelers}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Duration
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {getDuration(trip)} days
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Pickup
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {trip.airportPickup ===
                                "funtravel"
                                  ? "FunTravel"
                                  : "Own"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                                Hotel
                              </p>

                              <p className="mt-1 truncate text-sm font-bold">
                                {trip.hotelName ||
                                  "Not selected"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                viewTrip(trip)
                              }
                              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                            >
                              View Trip
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(trip)
                              }
                              className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ================================================= */}
            {/* ALL TRIPS */}
            {/* ================================================= */}

            <section className="mb-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Your Collection
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    All My Lombok Trips
                  </h2>
                </div>

                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                  {trips.length}{" "}
                  {trips.length === 1 ? "Trip" : "Trips"}
                </span>
              </div>

              <div className="space-y-4">
                {trips.map((trip) => {
                  const status = getTripStatus(trip);
                  const image = images[trip.destination];

                  return (
                    <article
                      key={trip.id}
                      className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="relative h-52 md:h-auto md:w-64 md:shrink-0">
                          {image ? (
                            <img
                              src={image.url}
                              alt={trip.destination}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 text-6xl">
                              🏝️
                            </div>
                          )}

                          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-700">
                            LOMBOK
                          </div>
                        </div>

                        <div className="flex-1 p-5 sm:p-6">
                          <div className="flex flex-col justify-between gap-4 lg:flex-row">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xl font-bold">
                                  {trip.destination}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${status.color}`}
                                >
                                  {status.icon}{" "}
                                  {status.label}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-slate-500">
                                {formatDate(
                                  trip.startDate
                                )}{" "}
                                —{" "}
                                {formatDate(
                                  trip.endDate
                                )}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  viewTrip(trip)
                                }
                                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                              >
                                View My Trip
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(trip)
                                }
                                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Travelers
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {trip.travelers}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Duration
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {getDuration(trip)}{" "}
                                {getDuration(trip) === 1
                                  ? "Day"
                                  : "Days"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Travel Style
                              </p>

                              <p className="mt-1 truncate text-sm font-bold">
                                {trip.travelStyle ||
                                  "Not specified"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Interests
                              </p>

                              <p className="mt-1 truncate text-sm font-bold">
                                {trip.interests ||
                                  "Not specified"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {trip.hasFlight === "true" && (
                              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                ✈️ Flight Added
                              </span>
                            )}

                            {trip.airportPickup ===
                              "funtravel" && (
                              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                🚗 FunTravel Pickup
                              </span>
                            )}

                            {trip.airportPickup ===
                              "own" && (
                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                🚕 Own Transport
                              </span>
                            )}

                            {trip.hotelName && (
                              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                                🏨 {trip.hotelName}
                              </span>
                            )}

                            {trip.driverName && (
                              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                👨‍✈️ Driver Assigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ================================================= */}
            {/* FUNTRAVEL PROMISE */}
            {/* ================================================= */}

            <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl sm:p-8">
              <div className="max-w-3xl">
                <div className="mb-3 text-3xl">
                  🌴
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  You just enjoy Lombok.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                  FunTravel dirancang supaya kamu tidak perlu
                  bingung mengatur perjalanan sendiri. Mulai dari
                  kedatangan, airport pickup, hotel, itinerary,
                  sampai perjalanan pulang.
                </p>

                <p className="mt-4 font-semibold text-white">
                  Kamu tinggal berangkat. Urusan perjalanan, biar
                  kami yang atur.
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {/* ===================================================== */}
      {/* CUSTOMER SERVICE */}
      {/* ===================================================== */}

      <CustomerService />

      {/* ===================================================== */}
      {/* DELETE MODAL */}
      {/* ===================================================== */}

      {showDeleteModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              🗑️
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Delete this trip?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kamu akan menghapus perjalanan{" "}
              <strong className="text-slate-700">
                {selectedTrip.destination}
              </strong>{" "}
              dari My Trips.
            </p>

            <p className="mt-2 text-sm text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteTrip}
                disabled={Boolean(deletingId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId
                  ? "Deleting..."
                  : "Delete Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}