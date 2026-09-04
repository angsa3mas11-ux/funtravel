"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";

type User = {
  id: string;
  name: string;
  email: string;
};

type Trip = {
  id: string;
  userId?: string;
  userEmail?: string;

  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
  interests: string;
  travelStyle: string;
  specialRequest: string;
  createdAt: string;

  // Flight
  hasFlight?: string;
  arrivalFlight?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  departureFlight?: string;
  departureDate?: string;
  departureTime?: string;

  // Airport pickup
  airportPickup?: string;

  // Accommodation
  accommodationType?: string;
  hotelName?: string;
  hotelAddress?: string;
  bookingNumber?: string;

  // Driver
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

type TripStatus = {
  label: string;
  description: string;
  color: string;
  bg: string;
  dot: string;
};

type DestinationImage = {
  name: string;
  image: string;
};

function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysUntil(startDate: string) {
  const today = new Date();
  const start = new Date(`${startDate}T00:00:00`);

  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);

  return Math.ceil(
    (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getTripStatus(trip: Trip): TripStatus {
  const daysUntil = getDaysUntil(trip.startDate);
  const end = new Date(`${trip.endDate}T23:59:59`);
  const now = new Date();

  if (now.getTime() > end.getTime()) {
    return {
      label: "Trip Completed",
      description: "Your Lombok journey has been completed.",
      color: "text-slate-600",
      bg: "bg-slate-100",
      dot: "bg-slate-500",
    };
  }

  if (daysUntil <= 0) {
    return {
      label: "Trip In Progress",
      description: "Enjoy your Lombok adventure.",
      color: "text-green-700",
      bg: "bg-green-100",
      dot: "bg-green-500",
    };
  }

  if (daysUntil <= 3) {
    return {
      label: "Trip Ready",
      description: "Everything is almost ready for your Lombok trip.",
      color: "text-blue-700",
      bg: "bg-blue-100",
      dot: "bg-blue-500",
    };
  }

  if (
    trip.driverName ||
    trip.hotelName ||
    trip.airportPickup === "funtravel"
  ) {
    return {
      label: "Preparing Your Trip",
      description: "FunTravel is preparing your Lombok journey.",
      color: "text-purple-700",
      bg: "bg-purple-100",
      dot: "bg-purple-500",
    };
  }

  return {
    label: "Planning",
    description: "Your Lombok trip is being planned.",
    color: "text-amber-700",
    bg: "bg-amber-100",
    dot: "bg-amber-500",
  };
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinationImages, setDestinationImages] = useState<
    DestinationImage[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_logged_in");
    const storedUser = localStorage.getItem("funtravel_current_user");

    if (loggedIn !== "true" || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);

      const storedTrips = localStorage.getItem("funtravel_trips");

      if (storedTrips) {
        const parsedTrips: Trip[] = JSON.parse(storedTrips);

        const migratedTrips = parsedTrips.map((trip) => {
          if (
            !trip.userId &&
            trip.userEmail &&
            trip.userEmail.toLowerCase() === parsedUser.email.toLowerCase()
          ) {
            return {
              ...trip,
              userId: parsedUser.id,
            };
          }

          return trip;
        });

        const userTrips = migratedTrips.filter((trip) => {
          if (trip.userId) {
            return trip.userId === parsedUser.id;
          }

          return (
            trip.userEmail?.toLowerCase() === parsedUser.email.toLowerCase()
          );
        });

        userTrips.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setTrips(userTrips);

        localStorage.setItem(
          "funtravel_trips",
          JSON.stringify(migratedTrips)
        );
      }
    } catch {
      localStorage.removeItem("funtravel_current_user");
      localStorage.removeItem("funtravel_logged_in");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (trips.length === 0) return;

    const uniqueDestinations = Array.from(
      new Set(trips.map((trip) => trip.destination))
    );

    const loadImages = async () => {
      const results: DestinationImage[] = [];

      for (const destination of uniqueDestinations) {
        try {
          const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
              `${destination} Lombok`
            )}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
          );

          const data = await response.json();

          const pages = data?.query?.pages
            ? Object.values(data.query.pages)
            : [];

          const page = pages[0] as
            | {
                imageinfo?: {
                  thumburl?: string;
                  url?: string;
                }[];
              }
            | undefined;

          const image =
            page?.imageinfo?.[0]?.thumburl ||
            page?.imageinfo?.[0]?.url ||
            "";

          results.push({
            name: destination,
            image,
          });
        } catch {
          results.push({
            name: destination,
            image: "",
          });
        }
      }

      setDestinationImages(results);
    };

    loadImages();
  }, [trips]);

  const getDestinationImage = (destination: string) => {
    return (
      destinationImages.find((item) => item.name === destination)?.image || ""
    );
  };

  const upcomingTrips = useMemo(() => {
    return trips.filter((trip) => {
      const end = new Date(`${trip.endDate}T23:59:59`);
      return end.getTime() >= new Date().getTime();
    });
  }, [trips]);

  const completedTrips = useMemo(() => {
    return trips.filter((trip) => {
      const end = new Date(`${trip.endDate}T23:59:59`);
      return end.getTime() < new Date().getTime();
    });
  }, [trips]);

  const activeTrip = useMemo(() => {
    return upcomingTrips
      .slice()
      .sort(
        (a, b) =>
          new Date(`${a.startDate}T00:00:00`).getTime() -
          new Date(`${b.startDate}T00:00:00`).getTime()
      )[0];
  }, [upcomingTrips]);

  const uniqueDestinations = useMemo(() => {
    return new Set(trips.map((trip) => trip.destination)).size;
  }, [trips]);

  const featuredTrip = activeTrip || trips[0];

  const getTripUrl = (trip: Trip) => {
    const params = new URLSearchParams();

    params.set("tripId", trip.id || "");

    params.set("destination", trip.destination || "");
    params.set("startDate", trip.startDate || "");
    params.set("endDate", trip.endDate || "");
    params.set("travelers", trip.travelers || "");
    params.set("budget", trip.budget || "");
    params.set("interests", trip.interests || "");
    params.set("travelStyle", trip.travelStyle || "");
    params.set("specialRequest", trip.specialRequest || "");

    // Flight
    params.set("hasFlight", trip.hasFlight || "");
    params.set("arrivalFlight", trip.arrivalFlight || "");
    params.set("arrivalDate", trip.arrivalDate || "");
    params.set("arrivalTime", trip.arrivalTime || "");
    params.set("departureFlight", trip.departureFlight || "");
    params.set("departureDate", trip.departureDate || "");
    params.set("departureTime", trip.departureTime || "");

    // Airport pickup
    params.set("airportPickup", trip.airportPickup || "");

    // Accommodation
    params.set("accommodationType", trip.accommodationType || "");
    params.set("hotelName", trip.hotelName || "");
    params.set("hotelAddress", trip.hotelAddress || "");
    params.set("bookingNumber", trip.bookingNumber || "");

    // Driver
    params.set("driverId", trip.driverId || "");
    params.set("driverName", trip.driverName || "");
    params.set("driverPhoto", trip.driverPhoto || "");
    params.set("driverPhone", trip.driverPhone || "");
    params.set("driverWhatsapp", trip.driverWhatsapp || "");
    params.set("driverRating", trip.driverRating || "");
    params.set("vehicle", trip.vehicle || "");
    params.set("plateNumber", trip.plateNumber || "");
    params.set("meetingPoint", trip.meetingPoint || "");

    return `/trip?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <main className="mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your Lombok dashboard...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-blue-600">
                FUNTRAVEL • LOMBOK
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"} 👋
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Your Lombok journey starts here. Plan, manage, and enjoy your
                trip without the stress.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              + Plan New Lombok Trip
            </Link>
          </div>
        </section>

        {/* Featured Trip */}
        {featuredTrip ? (
          <section className="mb-8 overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[360px] overflow-hidden">
                {getDestinationImage(featuredTrip.destination) ? (
                  <img
                    src={getDestinationImage(featuredTrip.destination)}
                    alt={featuredTrip.destination}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-cyan-600 to-sky-400" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-md">
                    {getTripStatus(featuredTrip).label}
                  </div>

                  <h2 className="text-3xl font-black sm:text-4xl">
                    {featuredTrip.destination}
                  </h2>

                  <p className="mt-2 text-sm text-white/80">
                    {formatDate(featuredTrip.startDate)} —{" "}
                    {formatDate(featuredTrip.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 text-white sm:p-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Your Lombok Trip
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    {getTripStatus(featuredTrip).description}
                  </h3>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-white/50">Travelers</p>
                      <p className="mt-1 font-bold">
                        {featuredTrip.travelers}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs text-white/50">Budget</p>
                      <p className="mt-1 truncate font-bold">
                        {featuredTrip.budget || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-2xl bg-white/10 p-4">
                    <p className="text-xs text-white/50">
                      Airport Pickup
                    </p>

                    <p className="mt-1 font-bold">
                      {featuredTrip.airportPickup === "funtravel"
                        ? "FunTravel Pickup"
                        : featuredTrip.airportPickup === "own"
                        ? "Own Transportation"
                        : "Not selected"}
                    </p>
                  </div>
                </div>

                <Link
                  href={getTripUrl(featuredTrip)}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-900 transition hover:bg-cyan-50"
                >
                  View My Trip →
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-xl sm:p-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                Your Lombok Journey
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Ready to explore Lombok?
              </h2>

              <p className="mt-4 text-sm leading-7 text-blue-50 sm:text-base">
                Create your first Lombok trip and let FunTravel help organize
                your journey from arrival to departure.
              </p>

              <Link
                href="/planner"
                className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
              >
                Plan My Lombok Trip →
              </Link>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Trips
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {trips.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Lombok trips planned
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {upcomingTrips.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Trips coming up
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {completedTrips.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Lombok trips completed
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Destinations
            </p>

            <p className="mt-2 text-3xl font-black text-cyan-600">
              {uniqueDestinations}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Places in Lombok
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-black text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Everything you need for your Lombok journey.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/planner"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                🗓️
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                Plan a Trip
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Create a new Lombok travel plan.
              </p>
            </Link>

            <Link
              href="/trips"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl">
                🧳
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                My Trips
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                View and manage your Lombok trips.
              </p>
            </Link>

            <Link
              href="/explore"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-xl">
                🌴
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                Explore Lombok
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Discover beautiful places around Lombok.
              </p>
            </Link>

            <Link
              href="/trips"
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-xl">
                📋
              </div>

              <h3 className="mt-4 font-black text-slate-900">
                Trip Details
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Check your flight, driver, hotel and itinerary.
              </p>
            </Link>
          </div>
        </section>

        {/* Upcoming Trip */}
        {upcomingTrips.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Upcoming Trip
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your next Lombok adventure.
                </p>
              </div>

              <Link
                href="/trips"
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            {upcomingTrips.slice(0, 1).map((trip) => {
              const status = getTripStatus(trip);
              const daysUntil = getDaysUntil(trip.startDate);

              return (
                <div
                  key={trip.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                        🌴
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">
                            {trip.destination}
                          </h3>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.bg} ${status.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {status.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(trip.startDate)} —{" "}
                          {formatDate(trip.endDate)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            👥 {trip.travelers} travelers
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            💰 {trip.budget || "Budget not set"}
                          </span>

                          {trip.airportPickup === "funtravel" && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                              🚗 Airport Pickup
                            </span>
                          )}

                          {trip.hotelName && (
                            <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">
                              🏨 {trip.hotelName}
                            </span>
                          )}

                          {trip.driverName && (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">
                              👨‍✈️ Driver Assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:flex-col xl:flex-row">
                      {daysUntil > 0 && (
                        <div className="rounded-2xl bg-blue-50 px-5 py-3 text-center">
                          <p className="text-2xl font-black text-blue-700">
                            {daysUntil}
                          </p>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                            Days to go
                          </p>
                        </div>
                      )}

                      <Link
                        href={getTripUrl(trip)}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                      >
                        View My Trip →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Recent Trips */}
        {trips.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Recent Trips
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest Lombok travel plans.
                </p>
              </div>

              <Link
                href="/trips"
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.slice(0, 3).map((trip) => {
                const status = getTripStatus(trip);

                return (
                  <Link
                    key={trip.id}
                    href={getTripUrl(trip)}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500">
                      {getDestinationImage(trip.destination) ? (
                        <img
                          src={getDestinationImage(trip.destination)}
                          alt={trip.destination}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl">
                          🌴
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-black text-white">
                          {trip.destination}
                        </h3>

                        <p className="mt-1 text-xs text-white/80">
                          {formatDate(trip.startDate)} —{" "}
                          {formatDate(trip.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status.bg} ${status.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        />

                        {status.label}
                      </span>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-400">Travelers</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {trip.travelers}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-slate-400">Pickup</p>
                          <p className="mt-1 font-bold text-slate-800">
                            {trip.airportPickup === "funtravel"
                              ? "FunTravel"
                              : "Own"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm font-bold text-blue-600">
                        <span>View Trip</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* FunTravel Promise */}
        <section className="mb-8 rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg shadow-blue-200">
                ✨
              </div>

              <h2 className="mt-4 text-2xl font-black text-slate-900">
                The FunTravel Promise
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You just enjoy Lombok. We help organize the important parts of
                your journey so you can travel with less stress.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">🚗</div>

                <h3 className="mt-2 text-sm font-black text-slate-900">
                  Airport Pickup
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Arrange your airport transfer and receive driver details
                  when assigned.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">🏨</div>

                <h3 className="mt-2 text-sm font-black text-slate-900">
                  Accommodation
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your accommodation information together with your trip.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">🗺️</div>

                <h3 className="mt-2 text-sm font-black text-slate-900">
                  Itinerary
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Keep your Lombok activities and daily journey organized.
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xl">💬</div>

                <h3 className="mt-2 text-sm font-black text-slate-900">
                  Customer Support
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Need help during your journey? Contact FunTravel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI / Future Section */}
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-slate-900 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-300">
                FUNTRAVEL SMART TRAVEL
              </div>

              <h2 className="text-2xl font-black sm:text-3xl">
                Plan Lombok with less guesswork.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Tell us what kind of Lombok experience you want and organize
                your trip in one place — from your arrival to your journey
                home.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-400"
            >
              Start Planning →
            </Link>
          </div>
        </section>

        {/* Customer Service */}
        <CustomerService />

        {/* Animation */}
        <style jsx>{`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          main > section {
            animation: fadeUp 0.45s ease-out both;
          }
        `}</style>
      </main>
    </div>
  );
}