"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Driver = {
  id: string;
  name: string;
  email: string;
  password: string;
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

type PartnerRequest = {
  partnerId: string;
  status: "pending" | "accepted" | "declined";
  respondedAt?: string;
};

type DriverTrip = {
  id: string;
  userId?: string;
  userEmail?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: string;
  flightInfo?: string;
  airportPickup?: string;
  accommodation?: string;
  budget?: string;
  interests?: string;
  travelStyle?: string;
  specialRequest?: string;

  driverId?: string;
  driverStatus?: string;
  driverRequests?: PartnerRequest[];

  createdAt?: string;
};

function getTripStatus(trip: DriverTrip) {
  if (!trip.driverStatus || trip.driverStatus === "accepted") {
    return "Assigned";
  }

  return trip.driverStatus;
}

export default function DriverDashboardPage() {
  const router = useRouter();

  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [pendingRequests, setPendingRequests] = useState<DriverTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_driver_logged_in");
    const driverData = localStorage.getItem("funtravel_current_driver");

    if (loggedIn !== "true" || !driverData) {
      router.push("/partner/driver/login");
      return;
    }

    try {
      const driver: Driver = JSON.parse(driverData);

      if (driver.status !== "approved") {
        router.push("/partner/driver/login");
        return;
      }

      setCurrentDriver(driver);

      const storedTrips = localStorage.getItem("funtravel_trips");

      if (storedTrips) {
        const allTrips: DriverTrip[] = JSON.parse(storedTrips);

        // Trip yang sudah diterima driver
        const assignedTrips = allTrips.filter(
          (trip) =>
            trip.driverId === driver.id &&
            trip.airportPickup === "funtravel"
        );

        // Request baru yang masih menunggu jawaban driver
        const newRequests = allTrips.filter((trip) => {
          if (trip.airportPickup !== "funtravel") {
            return false;
          }

          const request = trip.driverRequests?.find(
            (req) => req.partnerId === driver.id
          );

          return request?.status === "pending";
        });

        // Urutkan request terbaru / tanggal perjalanan terdekat
        newRequests.sort((a, b) => {
          const dateA = a.startDate
            ? new Date(a.startDate).getTime()
            : Number.MAX_SAFE_INTEGER;

          const dateB = b.startDate
            ? new Date(b.startDate).getTime()
            : Number.MAX_SAFE_INTEGER;

          return dateA - dateB;
        });

        setTrips(assignedTrips);
        setPendingRequests(newRequests);
      }
    } catch (error) {
      console.error("Gagal membaca data driver:", error);
      router.push("/partner/driver/login");
    }

    setLoading(false);
  }, [router]);

  const activeTrips = trips.filter(
    (trip) => getTripStatus(trip) !== "Completed"
  );

  const completedTrips = trips.filter(
    (trip) => getTripStatus(trip) === "Completed"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Memuat dashboard...</div>
      </main>
    );
  }

  if (!currentDriver) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/partner/driver/dashboard"
              className="text-2xl font-bold text-sky-600"
            >
              FunTravel
            </Link>

            <p className="text-xs text-slate-500 mt-1">
              Driver Partner · Lombok
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-800">
                {currentDriver.name}
              </p>

              <p className="text-xs text-slate-500">
                Driver Partner
              </p>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("funtravel_driver_logged_in");
                localStorage.removeItem("funtravel_current_driver");
                router.push("/partner/driver/login");
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* WELCOME */}
        <div className="mb-8">
          <p className="text-sm text-sky-600 font-semibold mb-1">
            Driver Partner Dashboard
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Halo, {currentDriver.name} 👋
          </h1>

          <p className="text-slate-500 mt-2">
            Kelola permintaan perjalanan dan perjalanan yang sudah Anda terima
            di Lombok.
          </p>
        </div>

        {/* NEW REQUEST NOTIFICATION */}
        {pendingRequests.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shrink-0">
                  🔔
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      Ada permintaan trip baru
                    </h2>

                    <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                      {pendingRequests.length} Baru
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-1">
                    Traveler membutuhkan layanan airport pickup di Lombok.
                    Silakan buka My Assignments untuk melihat detail dan
                    memilih Accept atau Decline.
                  </p>
                </div>
              </div>

              <Link
                href="/partner/driver/trips"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 whitespace-nowrap"
              >
                Lihat Request →
              </Link>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* NEW REQUESTS */}
          <Link
            href="/partner/driver/trips"
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">New Requests</p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {pendingRequests.length}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">
                🔔
              </div>
            </div>

            <p className="text-xs text-sky-600 font-medium mt-3">
              Review requests →
            </p>
          </Link>

          {/* ACTIVE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Trips</p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {activeTrips.length}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl">
                🚗
              </div>
            </div>
          </div>

          {/* COMPLETED */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed Trips</p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {completedTrips.length}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>

          {/* VEHICLE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Vehicle</p>

                <p className="text-lg font-bold text-slate-900 mt-2">
                  {currentDriver.vehicleType || "-"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {currentDriver.vehiclePlate || "No plate"}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">
                🚙
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* MY ASSIGNMENTS */}
            <Link
              href="/partner/driver/trips"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl">
                  🚗
                </div>

                {pendingRequests.length > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-5">
                My Assignments
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Lihat request baru, terima atau tolak perjalanan, dan kelola
                trip Anda.
              </p>

              <div className="text-sm font-semibold text-sky-600 mt-4">
                Buka Assignments →
              </div>
            </Link>

            {/* PROFILE */}
            <Link
              href="/partner/driver/profile"
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">
                👤
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-5">
                My Profile
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Kelola informasi pribadi, kendaraan, pengalaman, dan bahasa.
              </p>

              <div className="text-sm font-semibold text-sky-600 mt-4">
                Edit Profile →
              </div>
            </Link>

            {/* SUPPORT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                💬
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-5">
                FunTravel Support
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Hubungi tim FunTravel jika membutuhkan bantuan mengenai trip
                atau akun partner.
              </p>

              <p className="text-sm font-semibold text-emerald-600 mt-4">
                Support tersedia
              </p>
            </div>
          </div>
        </section>

        {/* NEW TRIP REQUESTS */}
        {pendingRequests.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Trip Requests
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Permintaan dari traveler yang menunggu jawaban Anda.
                </p>
              </div>

              <Link
                href="/partner/driver/trips"
                className="text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                Lihat Semua →
              </Link>
            </div>

            <div className="space-y-4">
              {pendingRequests.slice(0, 3).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/partner/driver/trips?tripId=${trip.id}`}
                  className="block bg-white rounded-2xl border border-amber-200 p-5 hover:border-sky-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                          Pending Response
                        </span>

                        <span className="text-xs text-slate-400">
                          Trip #{trip.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-3">
                        Airport Pickup · Lombok
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">
                            Traveler
                          </p>
                          <p className="font-medium text-slate-700">
                            {trip.userEmail || "Traveler"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Tanggal
                          </p>
                          <p className="font-medium text-slate-700">
                            {trip.startDate || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Travelers
                          </p>
                          <p className="font-medium text-slate-700">
                            {trip.travelers || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-sky-600 text-white text-sm font-semibold">
                        Review Request →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ACTIVE ASSIGNMENTS */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Assignments
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Trip yang sudah Anda terima dan sedang berjalan atau menunggu
                perjalanan.
              </p>
            </div>

            <Link
              href="/partner/driver/trips"
              className="text-sm font-semibold text-sky-600 hover:text-sky-700"
            >
              Lihat Semua →
            </Link>
          </div>

          {activeTrips.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <div className="text-4xl mb-3">🚗</div>

              <h3 className="font-bold text-slate-900">
                Belum ada active trip
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Ketika traveler membuat request airport pickup dan Anda
                menerima trip tersebut, trip akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTrips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/partner/driver/trips?tripId=${trip.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-sm transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                          {getTripStatus(trip)}
                        </span>

                        <span className="text-xs text-slate-400">
                          Trip #{trip.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mt-3">
                        Airport Pickup · Lombok
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">
                            Traveler
                          </p>

                          <p className="font-medium text-slate-700">
                            {trip.userEmail || "Traveler"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Tanggal
                          </p>

                          <p className="font-medium text-slate-700">
                            {trip.startDate || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Travelers
                          </p>

                          <p className="font-medium text-slate-700">
                            {trip.travelers || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">
                        Open Trip →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* DRIVER INFORMATION */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              Driver Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">WhatsApp</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.whatsapp || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Languages</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.languages || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* VEHICLE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              Vehicle Information
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Vehicle Type</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.vehicleType || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Vehicle Model</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.vehicleModel || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Vehicle Plate</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.vehiclePlate || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Experience</p>
                <p className="font-medium text-slate-800 mt-1">
                  {currentDriver.experience || "-"}
                </p>
              </div>

              <Link
                href="/partner/driver/profile"
                className="inline-flex mt-2 text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                Update Vehicle Information →
              </Link>
            </div>
          </div>
        </section>

        {/* PARTNER PROMISE */}
        <section className="mt-8">
          <div className="rounded-2xl bg-sky-600 p-6 md:p-8 text-white">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-sky-100">
                FunTravel Driver Partner
              </p>

              <h2 className="text-2xl font-bold mt-2">
                Anda memiliki kendali atas setiap request perjalanan.
              </h2>

              <p className="text-sm text-sky-100 mt-3 leading-relaxed">
                Traveler mengirimkan request airport pickup kepada partner
                yang tersedia. Anda dapat melihat detail perjalanan terlebih
                dahulu, kemudian memilih untuk menerima atau menolak request
                tersebut. Setelah diterima, perjalanan akan masuk ke Active
                Assignments Anda.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center text-xs text-slate-400">
          FunTravel Driver Partner · Lombok, Indonesia
        </footer>
      </div>
    </main>
  );
}