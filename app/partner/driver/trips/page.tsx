"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  experience: string;
  languages: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type RequestStatus = "pending" | "accepted" | "declined";

type PartnerRequest = {
  partnerId: string;
  status: RequestStatus;
  respondedAt?: string;
};

type DriverTrip = {
  id: string;
  driverId?: string;
  userId?: string;
  userEmail?: string;

  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;

  budget?: string;
  interests?: string;
  travelStyle?: string;
  specialRequest?: string;

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

  driverStatus?: string;

  driverRequests?: PartnerRequest[];
};

const operationalStatusSteps = [
  "Accepted",
  "On the way",
  "Arrived",
  "Guest picked up",
  "Completed",
];

function formatDate(date?: string) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusIndex(status: string) {
  const index = operationalStatusSteps.indexOf(status);

  return index >= 0 ? index : 0;
}

function getTripStatus(trip: DriverTrip) {
  if (trip.driverStatus === "pending") {
    return "Pending Response";
  }

  if (trip.driverStatus === "declined") {
    return "Declined";
  }

  if (trip.driverStatus === "accepted") {
    return "Accepted";
  }

  return trip.driverStatus || "Accepted";
}

function getTravelerCount(value?: string) {
  if (!value) return "-";

  return value;
}

function getDriverRequest(
  trip: DriverTrip,
  driverId: string
): PartnerRequest | null {
  if (!trip.driverRequests) return null;

  return (
    trip.driverRequests.find(
      (request) => request.partnerId === driverId
    ) || null
  );
}

function DriverTripsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const loggedIn = localStorage.getItem(
        "funtravel_driver_logged_in"
      );

      const storedDriver = localStorage.getItem(
        "funtravel_current_driver"
      );

      if (loggedIn !== "true" || !storedDriver) {
        router.replace("/partner/driver/login");
        return;
      }

      const currentDriver: Driver = JSON.parse(storedDriver);

      if (currentDriver.status !== "approved") {
        router.replace("/partner/driver/login");
        return;
      }

      setDriver(currentDriver);

      const storedTrips = localStorage.getItem("funtravel_trips");

      if (storedTrips) {
        const allTrips: DriverTrip[] = JSON.parse(storedTrips);

        const driverTrips = allTrips
          .filter((trip) => {
            if (trip.airportPickup !== "funtravel") {
              return false;
            }

            const request = getDriverRequest(
              trip,
              currentDriver.id
            );

            const isRequested =
              request?.partnerId === currentDriver.id;

            const isAssigned =
              trip.driverId === currentDriver.id;

            return isRequested || isAssigned;
          })
          .sort((a, b) => {
            const dateA = new Date(
              a.arrivalDate || a.startDate
            ).getTime();

            const dateB = new Date(
              b.arrivalDate || b.startDate
            ).getTime();

            return dateA - dateB;
          });

        setTrips(driverTrips);

        const queryTripId = searchParams.get("tripId");

        if (
          queryTripId &&
          driverTrips.some((trip) => trip.id === queryTripId)
        ) {
          setSelectedTripId(queryTripId);
        } else if (driverTrips.length > 0) {
          setSelectedTripId(driverTrips[0].id);
        }
      }
    } catch {
      localStorage.removeItem("funtravel_driver_logged_in");
      localStorage.removeItem("funtravel_current_driver");

      router.replace("/partner/driver/login");
    } finally {
      setLoading(false);
    }
  }, [router, searchParams]);

  const selectedTrip = useMemo(() => {
    return (
      trips.find((trip) => trip.id === selectedTripId) || null
    );
  }, [trips, selectedTripId]);

  const pendingRequests = useMemo(() => {
    if (!driver) return [];

    return trips.filter((trip) => {
      const request = getDriverRequest(trip, driver.id);

      return request?.status === "pending";
    });
  }, [trips, driver]);

  const handleRequestResponse = (
    tripId: string,
    response: "accepted" | "declined"
  ) => {
    if (!driver) return;

    setSaving(true);
    setMessage("");

    try {
      const storedTrips = localStorage.getItem("funtravel_trips");

      if (!storedTrips) {
        setSaving(false);
        return;
      }

      const allTrips: DriverTrip[] = JSON.parse(storedTrips);

      const now = new Date().toISOString();

      const updatedTrips = allTrips.map((trip) => {
        if (trip.id !== tripId) {
          return trip;
        }

        const existingRequests = trip.driverRequests || [];

        const hasCurrentDriverRequest = existingRequests.some(
          (request) => request.partnerId === driver.id
        );

        if (!hasCurrentDriverRequest) {
          return trip;
        }

        const updatedRequests = existingRequests.map((request) => {
          if (request.partnerId !== driver.id) {
            return request;
          }

          return {
            ...request,
            status: response,
            respondedAt: now,
          };
        });

        if (response === "accepted") {
          return {
            ...trip,
            driverRequests: updatedRequests,
            driverId: driver.id,
            driverStatus: "accepted",
          };
        }

        /*
         * IMPORTANT:
         * Ketika driver menolak, jangan menghapus driverId
         * milik driver lain apabila trip tersebut sudah
         * diterima oleh driver lain.
         */
        const shouldKeepCurrentDriver =
          trip.driverId === driver.id;

        return {
          ...trip,
          driverRequests: updatedRequests,
          driverId: shouldKeepCurrentDriver
            ? undefined
            : trip.driverId,
          driverStatus: shouldKeepCurrentDriver
            ? "declined"
            : trip.driverStatus,
        };
      });

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(updatedTrips)
      );

      const updatedDriverTrips = updatedTrips
        .filter((trip) => {
          if (trip.airportPickup !== "funtravel") {
            return false;
          }

          const request = getDriverRequest(
            trip,
            driver.id
          );

          const isRequested =
            request?.partnerId === driver.id;

          const isAssigned =
            trip.driverId === driver.id;

          return isRequested || isAssigned;
        })
        .sort((a, b) => {
          const dateA = new Date(
            a.arrivalDate || a.startDate
          ).getTime();

          const dateB = new Date(
            b.arrivalDate || b.startDate
          ).getTime();

          return dateA - dateB;
        });

      setTrips(updatedDriverTrips);

      if (response === "accepted") {
        setMessage(
          "Trip request accepted. You can now manage the pickup journey."
        );
      } else {
        setMessage(
          "Trip request declined. FunTravel has recorded your response."
        );
      }

      setTimeout(() => {
        setMessage("");
      }, 4000);
    } catch {
      setMessage("Unable to update trip request.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedTrip || !driver) return;

    const request = getDriverRequest(
      selectedTrip,
      driver.id
    );

    /*
     * Driver harus menjadi driver yang diterima
     * sebelum bisa mengubah status operasional.
     */
    const isAccepted =
      request?.status === "accepted" &&
      selectedTrip.driverId === driver.id;

    if (!isAccepted) {
      setMessage(
        "Please accept this trip request before updating the pickup status."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const storedTrips = localStorage.getItem("funtravel_trips");

      if (!storedTrips) {
        setSaving(false);
        return;
      }

      const allTrips: DriverTrip[] = JSON.parse(storedTrips);

      const updatedTrips = allTrips.map((trip) => {
        if (trip.id !== selectedTrip.id) {
          return trip;
        }

        return {
          ...trip,
          driverId: driver.id,
          driverStatus: newStatus,
        };
      });

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(updatedTrips)
      );

      setTrips((currentTrips) =>
        currentTrips.map((trip) =>
          trip.id === selectedTrip.id
            ? {
                ...trip,
                driverId: driver.id,
                driverStatus: newStatus,
              }
            : trip
        )
      );

      setMessage(`Trip status updated to "${newStatus}".`);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setMessage("Unable to update trip status.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("funtravel_driver_logged_in");
    localStorage.removeItem("funtravel_current_driver");

    router.push("/partner/driver/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading assignments...
        </div>
      </main>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/driver/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              🚗
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                FunTravel
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Driver Partner
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/partner/driver/dashboard"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/partner/driver/profile"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:block"
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Driver Partner
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                My Assignments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                View your FunTravel traveler requests and manage
                each airport pickup journey in Lombok.
              </p>
            </div>

            {pendingRequests.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                  {pendingRequests.length}
                </span>

                <div>
                  <p className="text-xs font-bold text-orange-800">
                    New Trip Request
                  </p>

                  <p className="text-[11px] text-orange-600">
                    Please review and respond
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
              🚗
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No trip requests yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              When a traveler requests FunTravel airport pickup,
              the trip request will appear here for you to accept
              or decline.
            </p>

            <Link
              href="/partner/driver/dashboard"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
            {/* Assignment List */}
            <aside className="space-y-3">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">
                    Trip Requests
                  </span>

                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {trips.length}
                  </span>
                </div>
              </div>

              {pendingRequests.length > 0 && (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    New Requests
                  </p>

                  <p className="mt-1 text-sm font-bold text-orange-800">
                    {pendingRequests.length} trip
                    {pendingRequests.length > 1 ? "s" : ""} waiting
                    for your response
                  </p>
                </div>
              )}

              {trips.map((trip) => {
                const request = getDriverRequest(
                  trip,
                  driver.id
                );

                const status =
                  request?.status === "pending"
                    ? "New Request"
                    : request?.status === "declined"
                    ? "Declined"
                    : getTripStatus(trip);

                const isSelected =
                  trip.id === selectedTripId;

                const isPending =
                  request?.status === "pending";

                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => {
                      setSelectedTripId(trip.id);
                      setMessage("");
                    }}
                    className={`w-full rounded-3xl p-5 text-left transition ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : isPending
                        ? "bg-orange-50 text-slate-900 shadow-sm ring-2 ring-orange-300 hover:ring-orange-400"
                        : "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 hover:ring-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                            isSelected
                              ? "bg-white/15"
                              : isPending
                              ? "bg-orange-100"
                              : "bg-blue-50"
                          }`}
                        >
                          🚗
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold ${
                              isSelected
                                ? "text-blue-100"
                                : isPending
                                ? "text-orange-600"
                                : "text-blue-600"
                            }`}
                          >
                            Airport Pickup
                          </p>

                          <p className="mt-1 truncate text-sm font-bold">
                            Lombok International Airport
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          isSelected
                            ? "bg-white/15 text-white"
                            : isPending
                            ? "bg-orange-500 text-white"
                            : status === "Declined"
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div
                      className={`mt-4 border-t pt-4 ${
                        isSelected
                          ? "border-white/15"
                          : "border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          isSelected
                            ? "text-blue-100"
                            : "text-slate-400"
                        }`}
                      >
                        Arrival
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(
                          trip.arrivalDate || trip.startDate
                        )}
                      </p>

                      {trip.arrivalTime && (
                        <p
                          className={`mt-1 text-xs ${
                            isSelected
                              ? "text-blue-100"
                              : "text-slate-500"
                          }`}
                        >
                          {trip.arrivalTime}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </aside>

            {/* Assignment Detail */}
            <section className="min-w-0">
              {selectedTrip && (
                <div className="space-y-6">
                  {(() => {
                    const request = getDriverRequest(
                      selectedTrip,
                      driver.id
                    );

                    const isPending =
                      request?.status === "pending";

                    const isAccepted =
                      request?.status === "accepted" &&
                      selectedTrip.driverId === driver.id;

                    const isDeclined =
                      request?.status === "declined";

                    return (
                      <>
                        {/* New Request */}
                        {isPending && (
                          <div className="overflow-hidden rounded-3xl border-2 border-orange-200 bg-white shadow-sm">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white sm:p-8">
                              <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                                  🔔
                                </div>

                                <div>
                                  <p className="text-sm font-bold uppercase tracking-wider text-orange-100">
                                    New Trip Request
                                  </p>

                                  <h2 className="mt-2 text-2xl font-bold">
                                    Traveler needs airport pickup
                                  </h2>

                                  <p className="mt-2 text-sm leading-6 text-orange-50">
                                    Please review the trip details
                                    below and choose whether you
                                    want to accept or decline this
                                    request.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 sm:p-8">
                              <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl bg-slate-50 p-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Arrival
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {formatDate(
                                      selectedTrip.arrivalDate ||
                                        selectedTrip.startDate
                                    )}
                                  </p>

                                  {selectedTrip.arrivalTime && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {selectedTrip.arrivalTime}
                                    </p>
                                  )}
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Travelers
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {getTravelerCount(
                                      selectedTrip.travelers
                                    )}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 p-4">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Destination
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-800">
                                    {selectedTrip.destination ||
                                      "Lombok"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    handleRequestResponse(
                                      selectedTrip.id,
                                      "accepted"
                                    )
                                  }
                                  className="flex-1 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  ✓ Accept Trip
                                </button>

                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() =>
                                    handleRequestResponse(
                                      selectedTrip.id,
                                      "declined"
                                    )
                                  }
                                  className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  ✕ Decline Trip
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Declined */}
                        {isDeclined && (
                          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-xl">
                                ✕
                              </div>

                              <div>
                                <h2 className="font-bold text-red-800">
                                  Trip Request Declined
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-red-600">
                                  You declined this airport pickup
                                  request. Your response has been
                                  recorded by FunTravel.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Main Assignment */}
                        {isAccepted && (
                          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                            <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-6 text-white sm:p-8">
                              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                                <div>
                                  <p className="text-sm font-medium text-blue-100">
                                    Airport Pickup Assignment
                                  </p>

                                  <h2 className="mt-2 text-2xl font-bold">
                                    Lombok International Airport
                                  </h2>

                                  <p className="mt-2 text-sm text-blue-50">
                                    Accepted by {driver.name}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                    Current Status
                                  </p>

                                  <p className="mt-1 text-lg font-bold">
                                    {getTripStatus(selectedTrip)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Progress */}
                            <div className="p-6 sm:p-8">
                              <p className="text-sm font-bold text-slate-900">
                                Pickup Progress
                              </p>

                              <div className="mt-6 overflow-x-auto pb-2">
                                <div className="min-w-[620px]">
                                  <div className="flex items-center">
                                    {operationalStatusSteps.map(
                                      (step, index) => {
                                        const currentIndex =
                                          getStatusIndex(
                                            getTripStatus(
                                              selectedTrip
                                            )
                                          );

                                        const completed =
                                          index <= currentIndex;

                                        return (
                                          <div
                                            key={step}
                                            className="flex flex-1 items-center"
                                          >
                                            <div
                                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                completed
                                                  ? "bg-blue-600 text-white"
                                                  : "bg-slate-100 text-slate-400"
                                              }`}
                                            >
                                              {index <
                                              currentIndex
                                                ? "✓"
                                                : index + 1}
                                            </div>

                                            {index <
                                              operationalStatusSteps.length -
                                                1 && (
                                              <div
                                                className={`h-1 flex-1 ${
                                                  index < currentIndex
                                                    ? "bg-blue-600"
                                                    : "bg-slate-100"
                                                }`}
                                              />
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>

                                  <div className="mt-3 flex">
                                    {operationalStatusSteps.map(
                                      (step) => (
                                        <div
                                          key={step}
                                          className="flex-1 text-center text-[10px] font-semibold text-slate-400"
                                        >
                                          {step}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status Buttons */}
                              <div className="mt-7">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Update Status
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {operationalStatusSteps.map(
                                    (status) => {
                                      const active =
                                        getTripStatus(
                                          selectedTrip
                                        ) === status;

                                      return (
                                        <button
                                          key={status}
                                          type="button"
                                          disabled={saving}
                                          onClick={() =>
                                            handleStatusChange(
                                              status
                                            )
                                          }
                                          className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                                            active
                                              ? "bg-blue-600 text-white"
                                              : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                                          } disabled:cursor-not-allowed disabled:opacity-50`}
                                        >
                                          {status}
                                        </button>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Traveler */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                              👤
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                Traveler Information
                              </h3>

                              <p className="text-xs text-slate-500">
                                Information needed for the pickup.
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Number of Travelers
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {getTravelerCount(
                                  selectedTrip.travelers
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Traveler Email
                              </p>

                              <p className="mt-1 break-all text-sm font-bold text-slate-800">
                                {selectedTrip.userEmail || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Flight */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-xl">
                              ✈️
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                Arrival Flight
                              </h3>

                              <p className="text-xs text-slate-500">
                                Traveler arrival information.
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Flight
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {selectedTrip.arrivalFlight ||
                                  "-"}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Arrival Date
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {formatDate(
                                  selectedTrip.arrivalDate ||
                                    selectedTrip.startDate
                                )}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Arrival Time
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {selectedTrip.arrivalTime || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Destination & Hotel */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                                📍
                              </div>

                              <div>
                                <h3 className="font-bold text-slate-900">
                                  Destination
                                </h3>

                                <p className="text-xs text-slate-500">
                                  Traveler's planned destination.
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Lombok Destination
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {selectedTrip.destination ||
                                  "Lombok"}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                                🏨
                              </div>

                              <div>
                                <h3 className="font-bold text-slate-900">
                                  Accommodation
                                </h3>

                                <p className="text-xs text-slate-500">
                                  Traveler's hotel information.
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Hotel
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {selectedTrip.hotelName ||
                                  "Accommodation not specified"}
                              </p>

                              {selectedTrip.hotelAddress && (
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {selectedTrip.hotelAddress}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Pickup Instructions */}
                        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
                          <div className="flex gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                              ℹ️
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                Airport Pickup Instructions
                              </h3>

                              <p className="mt-2 text-sm leading-6 text-slate-600">
                                Please arrive at Lombok International
                                Airport before the scheduled arrival
                                time. Keep your phone available and
                                make sure your vehicle is clean and
                                ready for the traveler.
                              </p>

                              <div className="mt-4 space-y-2 text-sm text-slate-600">
                                <p>
                                  • Confirm the flight arrival time.
                                </p>

                                <p>
                                  • Wait at the agreed meeting point.
                                </p>

                                <p>
                                  • Contact FunTravel if you cannot
                                  find the traveler.
                                </p>

                                <p>
                                  • Update the trip status after each
                                  stage.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Driver Vehicle */}
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                              🚙
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                Your Vehicle
                              </h3>

                              <p className="text-xs text-slate-500">
                                Vehicle information shown to FunTravel.
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Type
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {driver.vehicleType}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Model
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {driver.vehicleModel}
                              </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Plate
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-800">
                                {driver.vehiclePlate}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <a
                            href={`tel:${driver.phone}`}
                            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-blue-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                                📞
                              </div>

                              <div>
                                <p className="text-xs text-slate-400">
                                  Your Phone
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                  {driver.phone}
                                </p>
                              </div>
                            </div>
                          </a>

                          <a
                            href={`https://wa.me/${driver.whatsapp.replace(
                              /\D/g,
                              ""
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-green-300"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                                💬
                              </div>

                              <div>
                                <p className="text-xs text-slate-400">
                                  Driver WhatsApp
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                  Contact traveler through FunTravel
                                </p>
                              </div>
                            </div>
                          </a>
                        </div>
                      </>
                    );
                  })()}

                  <div className="pb-6 text-center">
                    <Link
                      href="/partner/driver/dashboard"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700"
                    >
                      ← Back to Driver Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

export default function DriverTripsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">
            Loading...
          </div>
        </main>
      }
    >
      <DriverTripsContent />
    </Suspense>
  );
}