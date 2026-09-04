"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type GuideStatus =
  | "pending"
  | "approved"
  | "rejected";

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  experience: string;
  languages: string;
  specialties: string;
  areas: string;
  status: GuideStatus;
  createdAt: string;
};

type RequestStatus =
  | "pending"
  | "accepted"
  | "declined";

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

  driverId?: string;

  driverStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Guest picked up"
    | "Completed";

  guideId?: string;

  guideStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Tour started"
    | "Completed";

  guideRequests?: PartnerRequest[];

  createdAt?: string;
};

const statusSteps = [
  "Accepted",
  "On the way",
  "Arrived",
  "Tour started",
  "Completed",
] as const;

function getGuideRequest(
  trip: Trip,
  guideId: string
): PartnerRequest | null {
  if (!trip.guideRequests) return null;

  return (
    trip.guideRequests.find(
      (request) => request.partnerId === guideId
    ) || null
  );
}

function getTripStatus(trip: Trip) {
  if (trip.guideStatus === "pending") {
    return "Pending Response";
  }

  if (trip.guideStatus === "declined") {
    return "Declined";
  }

  if (trip.guideStatus === "accepted") {
    return "Accepted";
  }

  return trip.guideStatus || "Accepted";
}

export default function GuideTripsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading assignments...
          </p>
        </main>
      }
    >
      <GuideTripsContent />
    </Suspense>
  );
}

function GuideTripsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] =
    useState<Trip | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_guide_logged_in"
    );

    const storedGuide = localStorage.getItem(
      "funtravel_current_guide"
    );

    if (loggedIn !== "true" || !storedGuide) {
      router.replace("/partner/guide/login");
      return;
    }

    try {
      const currentGuide: Guide =
        JSON.parse(storedGuide);

      if (currentGuide.status !== "approved") {
        localStorage.removeItem(
          "funtravel_guide_logged_in"
        );

        localStorage.removeItem(
          "funtravel_current_guide"
        );

        router.replace("/partner/guide/login");
        return;
      }

      setGuide(currentGuide);

      const storedTrips =
        localStorage.getItem("funtravel_trips");

      if (storedTrips) {
        const parsedTrips: Trip[] =
          JSON.parse(storedTrips);

        const guideTrips = parsedTrips
          .filter((trip) => {
            const request = getGuideRequest(
              trip,
              currentGuide.id
            );

            const isRequested =
              request?.partnerId === currentGuide.id;

            const isAssigned =
              trip.guideId === currentGuide.id;

            return isRequested || isAssigned;
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

        setTrips(guideTrips);

        const tripId =
          searchParams.get("tripId");

        if (tripId) {
          const foundTrip = guideTrips.find(
            (trip) => trip.id === tripId
          );

          if (foundTrip) {
            setSelectedTrip(foundTrip);
          }
        }
      }
    } catch {
      localStorage.removeItem(
        "funtravel_guide_logged_in"
      );

      localStorage.removeItem(
        "funtravel_current_guide"
      );

      router.replace("/partner/guide/login");
      return;
    }

    setLoading(false);
  }, [router, searchParams]);

  const pendingRequests = useMemo(() => {
    if (!guide) return [];

    return trips.filter((trip) => {
      const request = getGuideRequest(
        trip,
        guide.id
      );

      return request?.status === "pending";
    });
  }, [trips, guide]);

  const activeTrips = useMemo(() => {
    if (!guide) return [];

    return trips.filter((trip) => {
      const request = getGuideRequest(
        trip,
        guide.id
      );

      const accepted =
        request?.status === "accepted" &&
        trip.guideId === guide.id;

      return (
        accepted &&
        trip.guideStatus !== "Completed"
      );
    });
  }, [trips, guide]);

  const completedTrips = useMemo(() => {
    if (!guide) return [];

    return trips.filter((trip) => {
      const request = getGuideRequest(
        trip,
        guide.id
      );

      const accepted =
        request?.status === "accepted" &&
        trip.guideId === guide.id;

      return (
        accepted &&
        trip.guideStatus === "Completed"
      );
    });
  }, [trips, guide]);

  const declinedTrips = useMemo(() => {
    if (!guide) return [];

    return trips.filter((trip) => {
      const request = getGuideRequest(
        trip,
        guide.id
      );

      return request?.status === "declined";
    });
  }, [trips, guide]);

  const getStatusIndex = (
    status?: Trip["guideStatus"]
  ) => {
    if (!status) return 0;

    const normalizedStatus =
      status === "accepted"
        ? "Accepted"
        : status;

    const index = statusSteps.indexOf(
      normalizedStatus as (typeof statusSteps)[number]
    );

    return index >= 0 ? index : 0;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    try {
      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return date;
      }

      return parsed.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  const handleRequestResponse = (
    tripId: string,
    response: "accepted" | "declined"
  ) => {
    if (!guide) return;

    setUpdating(true);
    setMessage("");

    try {
      const storedTrips =
        localStorage.getItem("funtravel_trips");

      if (!storedTrips) {
        setMessage(
          "Trip data could not be found."
        );
        setUpdating(false);
        return;
      }

      const allTrips: Trip[] =
        JSON.parse(storedTrips);

      const now = new Date().toISOString();

      const updatedTrips = allTrips.map(
        (trip) => {
          if (trip.id !== tripId) {
            return trip;
          }

          const existingRequests =
            trip.guideRequests || [];

          const hasCurrentGuideRequest =
            existingRequests.some(
              (request) =>
                request.partnerId === guide.id
            );

          if (!hasCurrentGuideRequest) {
            return trip;
          }

          const updatedRequests =
            existingRequests.map(
              (request) => {
                if (
                  request.partnerId !== guide.id
                ) {
                  return request;
                }

                return {
                  ...request,
                  status: response,
                  respondedAt: now,
                };
              }
            );

          if (response === "accepted") {
            return {
              ...trip,
              guideRequests:
                updatedRequests,
              guideId: guide.id,
              guideStatus: "accepted",
            };
          }

          /*
           * Jika guide menolak:
           * - Jangan mengambil alih guide lain.
           * - Jangan menghapus guideId milik guide lain.
           * - Jika guide ini sebelumnya memang pemegang trip,
           *   lepaskan assignment-nya.
           */
          const currentGuideOwnsTrip =
            trip.guideId === guide.id;

          return {
            ...trip,
            guideRequests:
              updatedRequests,
            guideId: currentGuideOwnsTrip
              ? undefined
              : trip.guideId,
            guideStatus: currentGuideOwnsTrip
              ? "declined"
              : trip.guideStatus,
          };
        }
      );

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(updatedTrips)
      );

      const updatedGuideTrips =
        updatedTrips
          .filter((trip) => {
            const request =
              getGuideRequest(
                trip,
                guide.id
              );

            const isRequested =
              request?.partnerId === guide.id;

            const isAssigned =
              trip.guideId === guide.id;

            return (
              isRequested || isAssigned
            );
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

      setTrips(updatedGuideTrips);

      const updatedSelectedTrip =
        updatedGuideTrips.find(
          (trip) => trip.id === tripId
        );

      if (updatedSelectedTrip) {
        setSelectedTrip(
          updatedSelectedTrip
        );
      }

      if (response === "accepted") {
        setMessage(
          "Trip request accepted. You can now manage the guiding journey."
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
      setMessage(
        "Something went wrong while updating the trip request."
      );
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = (
    tripId: string,
    status: (typeof statusSteps)[number]
  ) => {
    if (!guide) return;

    const currentTrip = trips.find(
      (trip) => trip.id === tripId
    );

    if (!currentTrip) {
      setMessage(
        "Trip data could not be found."
      );
      return;
    }

    const request = getGuideRequest(
      currentTrip,
      guide.id
    );

    /*
     * Status operasional hanya boleh dilakukan
     * oleh guide yang sudah menerima request.
     */
    const isAccepted =
      request?.status === "accepted" &&
      currentTrip.guideId === guide.id;

    if (!isAccepted) {
      setMessage(
        "Please accept this trip request before updating the guiding status."
      );

      return;
    }

    setUpdating(true);
    setMessage("");

    try {
      const storedTrips =
        localStorage.getItem("funtravel_trips");

      if (!storedTrips) {
        setMessage(
          "Trip data could not be found."
        );
        setUpdating(false);
        return;
      }

      const allTrips: Trip[] =
        JSON.parse(storedTrips);

      const updatedTrips = allTrips.map(
        (trip) =>
          trip.id === tripId
            ? {
                ...trip,
                guideId: guide.id,
                guideStatus: status,
              }
            : trip
      );

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(updatedTrips)
      );

      const updatedGuideTrips =
        updatedTrips
          .filter((trip) => {
            const request =
              getGuideRequest(
                trip,
                guide.id
              );

            return (
              request?.partnerId === guide.id ||
              trip.guideId === guide.id
            );
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

      setTrips(updatedGuideTrips);

      const updatedSelectedTrip =
        updatedGuideTrips.find(
          (trip) => trip.id === tripId
        );

      if (updatedSelectedTrip) {
        setSelectedTrip(
          updatedSelectedTrip
        );
      }

      setMessage(
        `Assignment status updated to "${status}".`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setMessage(
        "Something went wrong while updating the assignment."
      );
    } finally {
      setUpdating(false);
    }
  };

  const openTrip = (trip: Trip) => {
    setSelectedTrip(trip);

    router.push(
      `/partner/guide/trips?tripId=${encodeURIComponent(
        trip.id
      )}`
    );
  };

  const closeTrip = () => {
    setSelectedTrip(null);
    router.push("/partner/guide/trips");
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "funtravel_guide_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_guide"
    );

    router.push("/partner/guide/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading assignments...
        </p>
      </main>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/guide/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              🧭
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900">
                FunTravel
              </h1>

              <p className="text-xs text-slate-500">
                Guide Partner
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/partner/guide/dashboard"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/partner/guide/profile"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Guide Partner
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900">
            My Assignments
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your FunTravel Lombok trip
            requests, guest information, itinerary,
            and guiding status.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-700">
              {message}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {trips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
              New Requests
            </p>

            <p className="mt-2 text-3xl font-black text-orange-600">
              {pendingRequests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {activeTrips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {completedTrips.length}
            </p>
          </div>
        </div>

        {/* New Request Notice */}
        {pendingRequests.length > 0 && (
          <div className="mb-8 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl text-white">
                🔔
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  New Trip Request
                </p>

                <h3 className="mt-1 text-lg font-black text-orange-900">
                  You have {pendingRequests.length} new
                  guiding request
                  {pendingRequests.length > 1
                    ? "s"
                    : ""}
                </h3>

                <p className="mt-1 text-sm leading-6 text-orange-700">
                  Open a request below to review the
                  trip details and decide whether you
                  want to accept or decline it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Assignment list */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h3 className="text-lg font-black text-slate-900">
              Trip Requests
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Trip requests sent to your guide account
              are shown here.
            </p>
          </div>

          {trips.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🗺️
              </div>

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                No trip requests yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                When a traveler requests a FunTravel
                guide, the trip request will appear
                here for you to accept or decline.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trips.map((trip) => {
                const request = getGuideRequest(
                  trip,
                  guide.id
                );

                const isPending =
                  request?.status === "pending";

                const isDeclined =
                  request?.status === "declined";

                const isAccepted =
                  request?.status === "accepted" &&
                  trip.guideId === guide.id;

                let displayStatus =
                  "Accepted";

                if (isPending) {
                  displayStatus = "New Request";
                } else if (isDeclined) {
                  displayStatus = "Declined";
                } else if (isAccepted) {
                  displayStatus =
                    getTripStatus(trip);
                }

                return (
                  <button
                    key={trip.id}
                    type="button"
                    onClick={() => openTrip(trip)}
                    className={`block w-full p-5 text-left transition sm:p-6 ${
                      isPending
                        ? "bg-orange-50 hover:bg-orange-100"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                            isPending
                              ? "bg-orange-100"
                              : isDeclined
                              ? "bg-red-100"
                              : "bg-blue-100"
                          }`}
                        >
                          🧭
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-black text-slate-900">
                              {trip.destination ||
                                "Lombok"}
                            </h4>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                isPending
                                  ? "bg-orange-500 text-white"
                                  : isDeclined
                                  ? "bg-red-100 text-red-700"
                                  : displayStatus ===
                                    "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {displayStatus}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            Trip #{trip.id}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span>
                              📅{" "}
                              {formatDate(
                                trip.startDate
                              )}
                            </span>

                            <span>
                              👥{" "}
                              {trip.travelers ||
                                "-"}{" "}
                              traveler
                              {trip.travelers ===
                              "1"
                                ? ""
                                : "s"}
                            </span>

                            <span>
                              🏨{" "}
                              {trip.hotelName ||
                                "No hotel selected"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Guest
                          </p>

                          <p className="mt-1 max-w-[220px] truncate text-xs font-semibold text-slate-700">
                            {trip.userEmail || "-"}
                          </p>
                        </div>

                        <span className="text-lg text-slate-400">
                          →
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Declined summary */}
        {declinedTrips.length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-700">
              {declinedTrips.length} declined request
              {declinedTrips.length > 1
                ? "s"
                : ""}{" "}
              recorded.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeTrip}
        >
          <div
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Guiding Assignment
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-slate-900">
                    {selectedTrip.destination ||
                      "Lombok"}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Trip #{selectedTrip.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeTrip}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* Request State */}
              {(() => {
                const request =
                  getGuideRequest(
                    selectedTrip,
                    guide.id
                  );

                const isPending =
                  request?.status === "pending";

                const isDeclined =
                  request?.status === "declined";

                const isAccepted =
                  request?.status ===
                    "accepted" &&
                  selectedTrip.guideId ===
                    guide.id;

                if (isPending) {
                  return (
                    <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-lg text-white">
                          🔔
                        </div>

                        <div>
                          <p className="text-sm font-black text-orange-900">
                            New Trip Request
                          </p>

                          <p className="mt-1 text-xs leading-5 text-orange-700">
                            Review this Lombok guiding
                            request and choose whether
                            you want to accept or decline
                            it.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            handleRequestResponse(
                              selectedTrip.id,
                              "accepted"
                            )
                          }
                          className="flex-1 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✓ Accept Trip
                        </button>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            handleRequestResponse(
                              selectedTrip.id,
                              "declined"
                            )
                          }
                          className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✕ Decline Trip
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isDeclined) {
                  return (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
                          ✕
                        </div>

                        <div>
                          <p className="text-sm font-black text-red-800">
                            Trip Request Declined
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            You declined this guiding
                            request. Your response has
                            been recorded by FunTravel.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isAccepted) {
                  return (
                    <div className="mt-6">
                      <div className="grid grid-cols-5 gap-1">
                        {statusSteps.map(
                          (step, index) => {
                            const currentIndex =
                              getStatusIndex(
                                selectedTrip.guideStatus
                              );

                            const completed =
                              index <= currentIndex;

                            return (
                              <div
                                key={step}
                                className="text-center"
                              >
                                <div
                                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
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

                                <p
                                  className={`mt-2 text-[8px] font-semibold leading-4 sm:text-[10px] ${
                                    completed
                                      ? "text-blue-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {step}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }

                return null;
              })()}
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Guest Information */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Guest Information
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Guest Email"
                    value={
                      selectedTrip.userEmail ||
                      "-"
                    }
                  />

                  <InfoItem
                    label="Travelers"
                    value={
                      selectedTrip.travelers
                        ? `${selectedTrip.travelers} traveler${
                            selectedTrip.travelers ===
                            "1"
                              ? ""
                              : "s"
                          }`
                        : "-"
                    }
                  />

                  <InfoItem
                    label="Travel Style"
                    value={
                      selectedTrip.travelStyle ||
                      "-"
                    }
                  />

                  <InfoItem
                    label="Interests"
                    value={
                      selectedTrip.interests ||
                      "-"
                    }
                  />
                </div>
              </div>

              {/* Trip Schedule */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Trip Schedule
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Start Date"
                    value={formatDate(
                      selectedTrip.startDate
                    )}
                  />

                  <InfoItem
                    label="End Date"
                    value={formatDate(
                      selectedTrip.endDate
                    )}
                  />

                  <InfoItem
                    label="Destination"
                    value={
                      selectedTrip.destination ||
                      "Lombok"
                    }
                  />

                  <InfoItem
                    label="Special Request"
                    value={
                      selectedTrip.specialRequest ||
                      "No special request"
                    }
                    full
                  />
                </div>
              </div>

              {/* Flight */}
              {selectedTrip.hasFlight && (
                <div>
                  <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                    Flight Information
                  </h4>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                      label="Arrival Flight"
                      value={
                        selectedTrip.arrivalFlight ||
                        "-"
                      }
                    />

                    <InfoItem
                      label="Arrival Date"
                      value={formatDate(
                        selectedTrip.arrivalDate
                      )}
                    />

                    <InfoItem
                      label="Arrival Time"
                      value={
                        selectedTrip.arrivalTime ||
                        "-"
                      }
                    />

                    <InfoItem
                      label="Departure Flight"
                      value={
                        selectedTrip.departureFlight ||
                        "-"
                      }
                    />

                    <InfoItem
                      label="Departure Date"
                      value={formatDate(
                        selectedTrip.departureDate
                      )}
                    />

                    <InfoItem
                      label="Departure Time"
                      value={
                        selectedTrip.departureTime ||
                        "-"
                      }
                    />
                  </div>
                </div>
              )}

              {/* Accommodation */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Accommodation
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Hotel"
                    value={
                      selectedTrip.hotelName ||
                      "Not selected"
                    }
                  />

                  <InfoItem
                    label="Hotel Address"
                    value={
                      selectedTrip.hotelAddress ||
                      "-"
                    }
                  />

                  <InfoItem
                    label="Booking Number"
                    value={
                      selectedTrip.bookingNumber ||
                      "-"
                    }
                  />

                  <InfoItem
                    label="Accommodation Option"
                    value={
                      selectedTrip.hotelOption ||
                      "-"
                    }
                  />
                </div>
              </div>

              {/* Guide Instructions */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    🧭
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Guide Instructions
                    </h4>

                    <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                      <li>
                        • Meet the guest according to
                        the assigned schedule.
                      </li>

                      <li>
                        • Follow the FunTravel
                        itinerary.
                      </li>

                      <li>
                        • Provide accurate local
                        information about Lombok.
                      </li>

                      <li>
                        • Keep the guest comfortable
                        and informed.
                      </li>

                      <li>
                        • Update your assignment
                        status after each stage.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              {(() => {
                const request =
                  getGuideRequest(
                    selectedTrip,
                    guide.id
                  );

                const isAccepted =
                  request?.status ===
                    "accepted" &&
                  selectedTrip.guideId ===
                    guide.id;

                if (!isAccepted) {
                  return null;
                }

                return (
                  <div>
                    <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                      Update Assignment Status
                    </h4>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {statusSteps.map(
                        (status) => {
                          const normalizedCurrent =
                            selectedTrip.guideStatus ===
                            "accepted"
                              ? "Accepted"
                              : selectedTrip.guideStatus;

                          const isActive =
                            normalizedCurrent ===
                            status;

                          return (
                            <button
                              key={status}
                              type="button"
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  selectedTrip.id,
                                  status
                                )
                              }
                              className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                                isActive
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {isActive
                                ? "✓ "
                                : ""}
                              {status}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Footer */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeTrip}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <a
                    href={`mailto:support@funtravel.com?subject=${encodeURIComponent(
                      `Guide Support - Trip ${selectedTrip.id}`
                    )}&body=${encodeURIComponent(
                      `Hi FunTravel Support,

I need help with my guide trip request.

Trip ID: ${selectedTrip.id}
Destination: ${
                        selectedTrip.destination ||
                        "Lombok"
                      }

Thank you.`
                    )}`}
                    className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    💬 Contact FunTravel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}