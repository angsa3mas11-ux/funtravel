"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type GuideStatus = "pending" | "approved" | "rejected";

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
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Guest picked up"
    | "Completed";

  guideId?: string;
  guideStatus?:
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Tour started"
    | "Completed";

  createdAt?: string;
};

const guideStatusSteps = [
  "Assigned",
  "On the way",
  "Arrived",
  "Tour started",
  "Completed",
] as const;

export default function GuideDashboardPage() {
  const router = useRouter();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

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
      const currentGuide: Guide = JSON.parse(storedGuide);

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

        const assignedTrips = parsedTrips.filter(
          (trip) =>
            trip.guideId === currentGuide.id
        );

        setTrips(assignedTrips);
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
  }, [router]);

  const activeTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.guideStatus !== "Completed"
    );
  }, [trips]);

  const completedTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.guideStatus === "Completed"
    );
  }, [trips]);

  const currentTrip = useMemo(() => {
    return activeTrips[0] || null;
  }, [activeTrips]);

  const getStatusIndex = (
    status?: Trip["guideStatus"]
  ) => {
    if (!status) return 0;

    const index = guideStatusSteps.indexOf(
      status as (typeof guideStatusSteps)[number]
    );

    return index >= 0 ? index : 0;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
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
          Loading guide dashboard...
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/partner/guide/profile"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              My Profile
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
        {/* Welcome */}
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-xl shadow-blue-200 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-100">
                Guide Partner Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Welcome, {guide.name}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50">
                Manage your Lombok guiding assignments,
                schedules, and guest experiences from one
                place.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                Account Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-300" />

                <span className="text-sm font-bold">
                  Approved Guide
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Assignments
              </p>

              <span className="text-xl">🗺️</span>
            </div>

            <p className="mt-3 text-3xl font-black text-slate-900">
              {trips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Active
              </p>

              <span className="text-xl">📅</span>
            </div>

            <p className="mt-3 text-3xl font-black text-blue-600">
              {activeTrips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Completed
              </p>

              <span className="text-xl">✅</span>
            </div>

            <p className="mt-3 text-3xl font-black text-green-600">
              {completedTrips.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Experience
              </p>

              <span className="text-xl">⭐</span>
            </div>

            <p className="mt-3 text-lg font-black text-slate-900">
              {guide.experience}
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-8">
          <h3 className="mb-4 text-lg font-black text-slate-900">
            Quick Actions
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/partner/guide/trips"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🗺️
              </div>

              <h4 className="mt-4 font-bold text-slate-900">
                My Assignments
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                View your Lombok guest guiding
                assignments.
              </p>

              <span className="mt-4 block text-xs font-bold text-blue-600">
                View assignments →
              </span>
            </Link>

            <Link
              href="/partner/guide/profile"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                👤
              </div>

              <h4 className="mt-4 font-bold text-slate-900">
                My Profile
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Update your contact details,
                languages, and specialties.
              </p>

              <span className="mt-4 block text-xs font-bold text-blue-600">
                Manage profile →
              </span>
            </Link>

            <a
              href="mailto:support@funtravel.com?subject=FunTravel Guide Support"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-xl">
                💬
              </div>

              <h4 className="mt-4 font-bold text-slate-900">
                FunTravel Support
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Contact the FunTravel team if you
                need help with an assignment.
              </p>

              <span className="mt-4 block text-xs font-bold text-blue-600">
                Contact support →
              </span>
            </a>
          </div>
        </section>

        {/* Current Assignment */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Current Work
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Current Assignment
              </h3>
            </div>

            <Link
              href="/partner/guide/trips"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>

          {!currentTrip ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🧭
              </div>

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                No active assignments
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You don't have an active Lombok guiding
                assignment at the moment. New assignments
                will appear here after FunTravel assigns
                them to you.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {currentTrip.guideStatus ||
                        "Assigned"}
                    </span>

                    <span className="text-xs text-slate-400">
                      Trip #{currentTrip.id}
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-black text-slate-900">
                    {currentTrip.destination ||
                      "Lombok"}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(
                      currentTrip.startDate
                    )}{" "}
                    →{" "}
                    {formatDate(
                      currentTrip.endDate
                    )}
                  </p>
                </div>

                <Link
                  href={`/partner/guide/trips?tripId=${encodeURIComponent(
                    currentTrip.id
                  )}`}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Open Assignment
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Guests
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {currentTrip.travelers ||
                      "-"}{" "}
                    traveler
                    {currentTrip.travelers === "1"
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Interests
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {currentTrip.interests ||
                      "Lombok experience"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Travel Style
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {currentTrip.travelStyle ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Hotel
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {currentTrip.hotelName ||
                      "Not selected"}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-7">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Assignment Progress
                </p>

                <div className="grid grid-cols-5 gap-1">
                  {guideStatusSteps.map(
                    (step, index) => {
                      const currentIndex =
                        getStatusIndex(
                          currentTrip.guideStatus
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
                            {completed
                              ? "✓"
                              : index + 1}
                          </div>

                          <p
                            className={`mt-2 text-[9px] font-semibold leading-4 sm:text-[10px] ${
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
            </div>
          )}
        </section>

        {/* Recent Assignments */}
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                History
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Recent Assignments
              </h3>
            </div>

            <Link
              href="/partner/guide/trips"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View all →
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">
                No assignments yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {trips.slice(0, 5).map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/partner/guide/trips?tripId=${encodeURIComponent(
                      trip.id
                    )}`}
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                        🧭
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {trip.destination ||
                            "Lombok"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            trip.startDate
                          )}{" "}
                          •{" "}
                          {trip.travelers ||
                            "-"}{" "}
                          travelers
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          trip.guideStatus ===
                          "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {trip.guideStatus ||
                          "Assigned"}
                      </span>

                      <span className="text-slate-400">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Guide Profile Summary */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                My Guide Profile
              </h3>

              <Link
                href="/partner/guide/profile"
                className="text-xs font-bold text-blue-600"
              >
                Edit
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Languages
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {guide.languages || "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Specialties
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                  {guide.specialties || "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Lombok Areas
                </p>

                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                  {guide.areas || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              💙
            </div>

            <h3 className="mt-4 text-lg font-black text-slate-900">
              Your Role at FunTravel
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              As a FunTravel guide partner, you help
              travelers experience Lombok safely,
              comfortably, and authentically.
            </p>

            <div className="mt-5 space-y-2 text-xs font-semibold text-slate-700">
              <p>✓ Welcome and assist FunTravel guests</p>
              <p>✓ Provide local Lombok knowledge</p>
              <p>✓ Follow the assigned itinerary</p>
              <p>✓ Keep guests informed and comfortable</p>
              <p>✓ Complete each assignment professionally</p>
            </div>
          </div>
        </section>

        <div className="h-10" />
      </div>
    </main>
  );
}