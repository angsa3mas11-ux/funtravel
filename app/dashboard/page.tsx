"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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
};

type User = {
  id: string;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);

  const [tripImages, setTripImages] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_logged_in"
    );

    if (loggedIn !== "true") {
      router.push("/login");
      return;
    }

    const savedUser = localStorage.getItem(
      "funtravel_current_user"
    );

    if (!savedUser) {
      router.push("/login");
      return;
    }

    let currentUser: User;

    try {
      currentUser = JSON.parse(savedUser);

      if (
        !currentUser.id ||
        !currentUser.email
      ) {
        throw new Error("User tidak valid");
      }

      setUser(currentUser);
    } catch {
      localStorage.removeItem(
        "funtravel_logged_in"
      );

      localStorage.removeItem(
        "funtravel_current_user"
      );

      router.push("/login");
      return;
    }

    const savedTrips = localStorage.getItem(
      "funtravel_trips"
    );

    if (savedTrips) {
      try {
        const allTrips: Trip[] =
          JSON.parse(savedTrips);

        const updatedTrips = allTrips.map(
          (trip) => {
            if (
              !trip.userId &&
              trip.userEmail ===
                currentUser.email
            ) {
              return {
                ...trip,
                userId: currentUser.id,
              };
            }

            return trip;
          }
        );

        localStorage.setItem(
          "funtravel_trips",
          JSON.stringify(updatedTrips)
        );

        const userTrips =
          updatedTrips.filter(
            (trip) =>
              trip.userId ===
              currentUser.id
          );

        setTrips(userTrips);
      } catch {
        console.error(
          "Data trips tidak valid."
        );

        setTrips([]);
      }
    } else {
      setTrips([]);
    }

    setLoading(false);

    // Mulai animasi setelah halaman siap
    requestAnimationFrame(() => {
      setTimeout(() => {
        setPageLoaded(true);
      }, 100);
    });
  }, [router]);

  // =========================
  // LOAD TRIP IMAGES
  // =========================

  useEffect(() => {
    if (trips.length === 0) return;

    async function loadTripImages() {
      const uniqueDestinations =
        Array.from(
          new Set(
            trips
              .map((trip) =>
                trip.destination?.trim()
              )
              .filter(Boolean)
          )
        );

      const imageResults: Record<
        string,
        string
      > = {};

      await Promise.all(
        uniqueDestinations.map(
          async (destination) => {
            try {
              const response =
                await fetch(
                  `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
                    `${destination} Lombok Indonesia`
                  )}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
                );

              const data =
                await response.json();

              const pages =
                data?.query?.pages;

              if (!pages) return;

              const firstPage =
                Object.values(
                  pages
                )[0] as {
                  imageinfo?: {
                    thumburl?: string;
                    url?: string;
                  }[];
                };

              const imageInfo =
                firstPage?.imageinfo?.[0];

              if (
                imageInfo?.thumburl
              ) {
                imageResults[
                  destination
                ] =
                  imageInfo.thumburl;
              } else if (
                imageInfo?.url
              ) {
                imageResults[
                  destination
                ] = imageInfo.url;
              }
            } catch (error) {
              console.error(
                `Gagal memuat foto ${destination}`,
                error
              );
            }
          }
        )
      );

      setTripImages(imageResults);
    }

    loadTripImages();
  }, [trips]);

  const recentTrips = trips.slice(0, 3);

  const upcomingTrips = trips.filter(
    (trip) => {
      if (!trip.startDate) return false;

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const start = new Date(
        trip.startDate
      );

      start.setHours(
        0,
        0,
        0,
        0
      );

      return start >= today;
    }
  );

  const uniqueDestinations =
    new Set(
      trips
        .map(
          (trip) =>
            trip.destination
        )
        .filter(Boolean)
    ).size;

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center animate-pulse">

          <div className="text-5xl mb-4">
            🌴
          </div>

          <p className="text-gray-500">
            Loading your Lombok dashboard...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />

      {/* =========================
          HEADER
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 pt-12">

        <div
          className="transition-all duration-700 ease-out"
          style={{
            animationName: pageLoaded
              ? "fadeUp"
              : "none",
            animationDuration: "0.7s",
            animationTimingFunction:
              "ease-out",
            animationFillMode: "forwards",
          }}
        >

          <p className="text-blue-600 font-semibold">
            Welcome back,{" "}
            {user?.name ||
              "Traveler"} 👋
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Your Lombok Travel Dashboard
          </h1>

          <p className="text-gray-500 mt-3 max-w-2xl">
            Plan, manage, and explore
            your upcoming adventures
            across Lombok.
          </p>

        </div>

      </section>

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div
            style={{
              animationName: pageLoaded
                ? "cardEnter"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "100ms",
            }}
          >
            <StatCard
              icon="✈️"
              title="Total Trips"
              value={trips.length.toString()}
              description="Saved trips"
            />
          </div>

          <div
            style={{
              animationName: pageLoaded
                ? "cardEnter"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "180ms",
            }}
          >
            <StatCard
              icon="📍"
              title="Destinations"
              value={uniqueDestinations.toString()}
              description="Unique places"
            />
          </div>

          <div
            style={{
              animationName: pageLoaded
                ? "cardEnter"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "260ms",
            }}
          >
            <StatCard
              icon="📅"
              title="Upcoming Trips"
              value={upcomingTrips.length.toString()}
              description="Future adventures"
            />
          </div>

          <div
            style={{
              animationName: pageLoaded
                ? "cardEnter"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "340ms",
            }}
          >
            <StatCard
              icon="💾"
              title="Saved Plans"
              value={trips.length.toString()}
              description="Ready to explore"
            />
          </div>

        </div>

      </section>

      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 pb-10">

        <div className="grid md:grid-cols-2 gap-5">

          <Link
            href="/planner"
            className="group bg-blue-600 rounded-3xl p-7 text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"
            style={{
              animationName: pageLoaded
                ? "fadeUp"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "450ms",
            }}
          >

            <div className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              ✈️
            </div>

            <h2 className="text-2xl font-bold mt-4">
              Plan a New Lombok Trip
            </h2>

            <p className="text-blue-100 mt-2">
              Create a personalized
              travel plan for your next
              Lombok adventure.
            </p>

            <div className="mt-5 font-semibold transition-transform duration-300 group-hover:translate-x-2">
              Start Planning →
            </div>

          </Link>

          <Link
            href="/trips"
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
            style={{
              animationName: pageLoaded
                ? "fadeUp"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "550ms",
            }}
          >

            <div className="text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              🧳
            </div>

            <h2 className="text-2xl font-bold mt-4">
              My Trips
            </h2>

            <p className="text-gray-500 mt-2">
              View and manage all your
              saved Lombok travel plans.
            </p>

            <div className="mt-5 text-blue-600 font-semibold transition-transform duration-300 group-hover:translate-x-2">
              View My Trips →
            </div>

          </Link>

        </div>

      </section>

      {/* =========================
          RECENT TRIPS
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div
          className="flex items-center justify-between mb-6"
          style={{
            animationName: pageLoaded
              ? "fadeUp"
              : "none",
            animationDuration: "0.7s",
            animationTimingFunction:
              "ease-out",
            animationFillMode: "forwards",
            animationDelay: "650ms",
          }}
        >

          <div>

            <h2 className="text-2xl font-bold">
              Recent Trips
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Your latest Lombok travel plans.
            </p>

          </div>

          {trips.length > 0 && (
            <Link
              href="/trips"
              className="text-sm font-semibold text-blue-600 transition-all duration-200 hover:text-blue-700 hover:translate-x-1 active:scale-95"
            >
              View All →
            </Link>
          )}

        </div>

        {recentTrips.length === 0 ? (

          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              animationName: pageLoaded
                ? "fadeUp"
                : "none",
              animationDuration: "0.7s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              animationDelay: "750ms",
            }}
          >

            <div className="text-5xl transition-transform duration-500 hover:scale-110">
              🗺️
            </div>

            <h3 className="text-xl font-bold mt-4">
              No trips yet
            </h3>

            <p className="text-gray-500 mt-2">
              Start planning your first
              Lombok adventure.
            </p>

            <Link
              href="/planner"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              Plan My First Trip
            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-3 gap-6">

            {recentTrips.map(
              (trip, index) => (

                <div
                  key={trip.id}
                  className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl"
                  style={{
                    animationName: pageLoaded
                      ? "cardEnter"
                      : "none",
                    animationDuration:
                      "0.7s",
                    animationTimingFunction:
                      "ease-out",
                    animationFillMode:
                      "forwards",
                    animationDelay: `${
                      750 +
                      index * 130
                    }ms`,
                  }}
                >

                  {/* IMAGE */}

                  <div className="h-40 relative overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400">

                    {tripImages[
                      trip.destination
                    ] ? (

                      <img
                        src={
                          tripImages[
                            trip.destination
                          ]
                        }
                        alt={`${trip.destination} Lombok`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                        <span className="text-6xl">
                          🌴
                        </span>
                      </div>

                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-5 right-5">

                      <p className="text-white/90 text-xs font-medium">
                        LOMBOK
                      </p>

                      <h3 className="text-white text-lg font-bold mt-1">
                        {trip.destination}
                      </h3>

                    </div>

                  </div>

                  {/* CARD CONTENT */}

                  <div className="p-6">

                    <p className="text-sm text-gray-500">
                      {trip.startDate ||
                        "Date not set"}
                      {" → "}
                      {trip.endDate ||
                        "Date not set"}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold transition-transform duration-200 group-hover:scale-105">
                        {trip.budget ||
                          "Budget not set"}
                      </span>

                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold transition-transform duration-200 group-hover:scale-105">
                        {trip.travelers ||
                          "Travelers not set"}
                      </span>

                    </div>

                    <Link
                      href={`/trip?destination=${encodeURIComponent(
                        trip.destination
                      )}&startDate=${encodeURIComponent(
                        trip.startDate
                      )}&endDate=${encodeURIComponent(
                        trip.endDate
                      )}&budget=${encodeURIComponent(
                        trip.budget
                      )}&travelers=${encodeURIComponent(
                        trip.travelers
                      )}&interests=${encodeURIComponent(
                        trip.interests
                      )}&travelStyle=${encodeURIComponent(
                        trip.travelStyle
                      )}&specialRequest=${encodeURIComponent(
                        trip.specialRequest
                      )}`}
                      className="block text-center mt-5 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
                    >
                      View Trip
                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

      {/* =========================
          AI SECTION
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div
          className="bg-blue-600 rounded-3xl p-8 md:p-10 text-white transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
          style={{
            animationName: pageLoaded
              ? "fadeUp"
              : "none",
            animationDuration: "0.8s",
            animationTimingFunction:
              "ease-out",
            animationFillMode: "forwards",
            animationDelay: "1200ms",
          }}
        >

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <div className="text-4xl transition-transform duration-500 hover:scale-110 hover:rotate-6">
                🤖
              </div>

              <h2 className="text-2xl font-bold mt-4">
                FunTravel AI
              </h2>

              <p className="text-blue-100 mt-2 max-w-xl">
                Soon you'll be able to
                generate personalized
                Lombok itineraries
                automatically using AI.
              </p>

            </div>

            <Link
              href="/planner"
              className="inline-flex justify-center px-6 py-3 bg-white text-blue-600 rounded-xl font-bold transition-all duration-200 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-lg active:scale-95"
            >
              Plan a Trip
            </Link>

          </div>

        </div>

      </section>

      {/* =========================
          ANIMATIONS
      ========================= */}

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(35px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

    </main>
  );
}

// =========================
// STAT CARD
// =========================

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg active:scale-[0.98]">

      <div className="flex items-center justify-between">

        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>

        <span className="text-3xl font-bold transition-transform duration-300 group-hover:scale-110">
          {value}
        </span>

      </div>

      <h3 className="font-semibold mt-5">
        {title}
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        {description}
      </p>

    </div>
  );
}