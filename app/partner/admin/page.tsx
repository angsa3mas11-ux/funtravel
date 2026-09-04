"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DriverStatus = "pending" | "approved" | "rejected";

type GuideStatus = "pending" | "approved" | "rejected";

type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: DriverStatus;
  createdAt: string;
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
  status: GuideStatus;
  createdAt: string;
};

type Trip = {
  id?: string;
  tripId?: string;
  userEmail?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  airportPickup?: "funtravel" | "own" | "";
  driverId?: string;
  driverStatus?: string;
  guideId?: string;
  guideStatus?: string;
  createdAt?: string;
};

type Admin = {
  name: string;
  email: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_admin_logged_in");

    if (loggedIn !== "true") {
      router.replace("/partner/admin/login");
      return;
    }

    try {
      const storedAdmin = localStorage.getItem("funtravel_current_admin");

      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }

      const storedDrivers = localStorage.getItem("funtravel_drivers");
      const storedGuides = localStorage.getItem("funtravel_guides");
      const storedTrips = localStorage.getItem("funtravel_trips");

      if (storedDrivers) {
        setDrivers(JSON.parse(storedDrivers));
      }

      if (storedGuides) {
        setGuides(JSON.parse(storedGuides));
      }

      if (storedTrips) {
        setTrips(JSON.parse(storedTrips));
      }
    } catch {
      setDrivers([]);
      setGuides([]);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const stats = useMemo(() => {
    const pendingDrivers = drivers.filter(
      (driver) => driver.status === "pending"
    ).length;

    const approvedDrivers = drivers.filter(
      (driver) => driver.status === "approved"
    ).length;

    const pendingGuides = guides.filter(
      (guide) => guide.status === "pending"
    ).length;

    const approvedGuides = guides.filter(
      (guide) => guide.status === "approved"
    ).length;

    const tripsNeedDriver = trips.filter(
      (trip) =>
        trip.airportPickup === "funtravel" &&
        !trip.driverId
    ).length;

    const tripsNeedGuide = trips.filter(
      (trip) => !trip.guideId
    ).length;

    const fullyAssigned = trips.filter(
      (trip) =>
        (trip.airportPickup !== "funtravel" || !!trip.driverId) &&
        !!trip.guideId
    ).length;

    return {
      pendingDrivers,
      approvedDrivers,
      pendingGuides,
      approvedGuides,
      tripsNeedDriver,
      tripsNeedGuide,
      fullyAssigned,
    };
  }, [drivers, guides, trips]);

  const recentTrips = useMemo(() => {
    return [...trips]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [trips]);

  const pendingApplications = useMemo(() => {
    const driverApplications = drivers
      .filter((driver) => driver.status === "pending")
      .map((driver) => ({
        id: driver.id,
        type: "Driver",
        name: driver.name,
        email: driver.email,
        createdAt: driver.createdAt,
      }));

    const guideApplications = guides
      .filter((guide) => guide.status === "pending")
      .map((guide) => ({
        id: guide.id,
        type: "Guide",
        name: guide.name,
        email: guide.email,
        createdAt: guide.createdAt,
      }));

    return [...driverApplications, ...guideApplications]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [drivers, guides]);

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const logout = () => {
    localStorage.removeItem("funtravel_admin_logged_in");
    localStorage.removeItem("funtravel_current_admin");

    router.replace("/partner/admin/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl text-white shadow-lg shadow-blue-200">
                🌴
              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  FunTravel Admin
                </h1>
                <p className="text-xs text-slate-500">
                  Lombok Travel Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">
                {admin?.name || "FunTravel Admin"}
              </p>
              <p className="text-xs text-slate-500">
                {admin?.email || "Administrator"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-100">
                ADMIN CONTROL CENTER
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Welcome to FunTravel Admin 👋
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Manage drivers, guides, traveler trips, and trip assignments
                for FunTravel&apos;s Lombok travel service.
              </p>
            </div>
          </div>
        </section>

        {/* Main Navigation */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Management
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage every part of the FunTravel Lombok operation from here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/partner/admin/drivers"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🚗
                </div>

                {stats.pendingDrivers > 0 && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {stats.pendingDrivers} pending
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Drivers
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Review applications and manage FunTravel drivers.
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">
                  {stats.approvedDrivers} approved
                </span>

                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/partner/admin/guides"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                  🧭
                </div>

                {stats.pendingGuides > 0 && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {stats.pendingGuides} pending
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Guides
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Review guide applications and manage approved guides.
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600">
                  {stats.approvedGuides} approved
                </span>

                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/partner/admin/trips"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                  🧳
                </div>

                {(stats.tripsNeedDriver > 0 ||
                  stats.tripsNeedGuide > 0) && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    Action needed
                  </span>
                )}
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Trip Assignments
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Assign approved drivers and guides to traveler trips.
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-purple-600">
                  {trips.length} total trips
                </span>

                <span className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-600">
                  →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current FunTravel operation status.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🚗</span>

                <span className="text-xs font-semibold text-slate-400">
                  DRIVERS
                </span>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {drivers.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.approvedDrivers} approved
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧭</span>

                <span className="text-xs font-semibold text-slate-400">
                  GUIDES
                </span>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {guides.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.approvedGuides} approved
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧳</span>

                <span className="text-xs font-semibold text-slate-400">
                  TRIPS
                </span>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {trips.length}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.fullyAssigned} fully assigned
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl">⚠️</span>

                <span className="text-xs font-semibold text-slate-400">
                  ACTION NEEDED
                </span>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-slate-900">
                {stats.pendingDrivers +
                  stats.pendingGuides +
                  stats.tripsNeedDriver +
                  stats.tripsNeedGuide}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Items requiring attention
              </p>
            </div>
          </div>
        </section>

        {/* Action Needed */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Action Needed
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Items that may need your attention.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/partner/admin/drivers"
              className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:bg-amber-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                  🚗
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Pending Driver Applications
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {stats.pendingDrivers} driver
                    {stats.pendingDrivers !== 1 ? "s" : ""} waiting for review.
                  </p>
                </div>
              </div>

              <span className="text-amber-700">→</span>
            </Link>

            <Link
              href="/partner/admin/guides"
              className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:bg-amber-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                  🧭
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Pending Guide Applications
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {stats.pendingGuides} guide
                    {stats.pendingGuides !== 1 ? "s" : ""} waiting for review.
                  </p>
                </div>
              </div>

              <span className="text-amber-700">→</span>
            </Link>

            <Link
              href="/partner/admin/trips"
              className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:bg-red-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
                  🚗
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Trips Without Driver
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {stats.tripsNeedDriver} trip
                    {stats.tripsNeedDriver !== 1 ? "s" : ""} need an airport
                    pickup driver.
                  </p>
                </div>
              </div>

              <span className="text-red-700">→</span>
            </Link>

            <Link
              href="/partner/admin/trips"
              className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:bg-red-100"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
                  🧭
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Trips Without Guide
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {stats.tripsNeedGuide} trip
                    {stats.tripsNeedGuide !== 1 ? "s" : ""} need a guide.
                  </p>
                </div>
              </div>

              <span className="text-red-700">→</span>
            </Link>
          </div>
        </section>

        {/* Recent Applications + Recent Trips */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Applications */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-extrabold text-slate-900">
                  Pending Applications
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recent partner applications.
                </p>
              </div>
            </div>

            <div className="p-5">
              {pendingApplications.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <div className="text-3xl">✅</div>

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    No pending applications
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    All partner applications have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApplications.map((application) => (
                    <div
                      key={`${application.type}-${application.id}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                          {application.type === "Driver"
                            ? "🚗"
                            : "🧭"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {application.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {application.type} · {application.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={
                          application.type === "Driver"
                            ? "/partner/admin/drivers"
                            : "/partner/admin/guides"
                        }
                        className="ml-3 shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Trips */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-extrabold text-slate-900">
                  Recent Trips
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest traveler trip plans.
                </p>
              </div>

              <Link
                href="/partner/admin/trips"
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            <div className="p-5">
              {recentTrips.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <div className="text-3xl">🧳</div>

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    No trips yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Traveler trips will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTrips.map((trip, index) => {
                    const tripKey =
                      trip.id ||
                      trip.tripId ||
                      `${trip.userEmail}-${trip.startDate}-${index}`;

                    const hasDriver =
                      trip.airportPickup !== "funtravel" ||
                      !!trip.driverId;

                    const hasGuide = !!trip.guideId;

                    return (
                      <Link
                        key={tripKey}
                        href={`/partner/admin/trips${
                          trip.id || trip.tripId
                            ? `?tripId=${encodeURIComponent(
                                trip.id || trip.tripId || ""
                              )}`
                            : ""
                        }`}
                        className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {trip.destination || "Lombok Trip"}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {trip.userEmail || "Traveler"}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs font-semibold text-slate-400">
                            {formatDate(trip.startDate)}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              hasDriver
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {hasDriver
                              ? "✓ Driver"
                              : "⚠ Driver needed"}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              hasGuide
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {hasGuide
                              ? "✓ Guide"
                              : "⚠ Guide needed"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 pt-6 pb-8">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-slate-400">
              FunTravel Admin • Lombok Travel Management
            </p>

            <div className="flex gap-4">
              <Link
                href="/partner/admin/drivers"
                className="text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                Drivers
              </Link>

              <Link
                href="/partner/admin/guides"
                className="text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                Guides
              </Link>

              <Link
                href="/partner/admin/trips"
                className="text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                Trips
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}