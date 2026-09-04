"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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
};

type DestinationImage = {
  [key: string]: string;
};

export default function TripsPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [trips, setTrips] =
    useState<Trip[]>([]);

  const [images, setImages] =
    useState<DestinationImage>({});

  const [loading, setLoading] =
    useState(true);

  const [pageLoaded, setPageLoaded] =
    useState(false);

  const [deletingTripId, setDeletingTripId] =
    useState<string | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  async function loadTrips() {
    const loggedIn =
      localStorage.getItem(
        "funtravel_logged_in"
      );

    if (loggedIn !== "true") {
      router.push("/login");
      return;
    }

    const savedUser =
      localStorage.getItem(
        "funtravel_current_user"
      );

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const currentUser: User =
        JSON.parse(savedUser);

      if (
        !currentUser.id ||
        !currentUser.email
      ) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const savedTrips =
        localStorage.getItem(
          "funtravel_trips"
        );

      let allTrips: Trip[] = [];

      if (savedTrips) {
        try {
          allTrips =
            JSON.parse(savedTrips);
        } catch {
          allTrips = [];
        }
      }

      const updatedTrips =
        allTrips.map((trip) => {
          if (
            !trip.userId &&
            trip.userEmail ===
              currentUser.email
          ) {
            return {
              ...trip,
              userId:
                currentUser.id,
            };
          }

          return trip;
        });

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

      loadDestinationImages(
        userTrips
      );
    } catch {
      localStorage.removeItem(
        "funtravel_current_user"
      );

      localStorage.removeItem(
        "funtravel_logged_in"
      );

      router.push("/login");
      return;
    }

    setLoading(false);
  }

  async function loadDestinationImages(
    userTrips: Trip[]
  ) {
    const uniqueDestinations = [
      ...new Set(
        userTrips.map(
          (trip) =>
            trip.destination
        )
      ),
    ];

    const imageResults: DestinationImage =
      {};

    await Promise.all(
      uniqueDestinations.map(
        async (destination) => {
          const image =
            await getDestinationImage(
              destination
            );

          if (image) {
            imageResults[
              destination
            ] = image;
          }
        }
      )
    );

    setImages(imageResults);
  }

  async function getDestinationImage(
    destination: string
  ) {
    try {
      const searchQuery =
        encodeURIComponent(
          `${destination} Lombok Indonesia`
        );

      const url =
        `https://commons.wikimedia.org/w/api.php` +
        `?action=query` +
        `&generator=search` +
        `&gsrsearch=${searchQuery}` +
        `&gsrnamespace=6` +
        `&gsrlimit=10` +
        `&prop=imageinfo` +
        `&iiprop=url` +
        `&iiurlwidth=900` +
        `&format=json` +
        `&origin=*`;

      const response =
        await fetch(url);

      if (!response.ok) {
        return null;
      }

      const data =
        await response.json();

      const pages =
        data?.query?.pages;

      if (!pages) {
        return null;
      }

      const pageList =
        Object.values(
          pages
        ) as any[];

      const validImage =
        pageList.find(
          (page) =>
            page?.imageinfo?.[0]
              ?.thumburl
        );

      if (
        !validImage?.imageinfo?.[0]
          ?.thumburl
      ) {
        return null;
      }

      return validImage.imageinfo[0]
        .thumburl;
    } catch {
      return null;
    }
  }

  function formatDate(
    date: string
  ) {
    if (!date) return "-";

    const parsedDate =
      new Date(date);

    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function calculateDays(
    startDate: string,
    endDate: string
  ) {
    if (!startDate || !endDate) {
      return 1;
    }

    const start =
      new Date(startDate);

    const end =
      new Date(endDate);

    const difference =
      end.getTime() -
      start.getTime();

    const days =
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return days > 0
      ? days
      : 1;
  }

  function viewTrip(
    trip: Trip
  ) {
    const params =
      new URLSearchParams();

    params.set(
      "destination",
      trip.destination
    );

    params.set(
      "startDate",
      trip.startDate
    );

    params.set(
      "endDate",
      trip.endDate
    );

    params.set(
      "travelers",
      trip.travelers
    );

    params.set(
      "budget",
      trip.budget
    );

    params.set(
      "interests",
      trip.interests
    );

    params.set(
      "travelStyle",
      trip.travelStyle
    );

    params.set(
      "specialRequest",
      trip.specialRequest
    );

    router.push(
      `/trip?${params.toString()}`
    );
  }

  function deleteTrip(
    id: string
  ) {
    if (!user) return;

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this trip?"
      );

    if (!confirmed) return;

    setDeletingTripId(id);

    const savedTrips =
      localStorage.getItem(
        "funtravel_trips"
      );

    if (!savedTrips) {
      setDeletingTripId(null);
      return;
    }

    let allTrips: Trip[] = [];

    try {
      allTrips =
        JSON.parse(savedTrips);
    } catch {
      allTrips = [];
    }

    const updatedTrips =
      allTrips.filter(
        (trip) =>
          !(
            trip.id === id &&
            trip.userId ===
              user.id
          )
      );

    localStorage.setItem(
      "funtravel_trips",
      JSON.stringify(updatedTrips)
    );

    setTimeout(() => {
      setTrips(
        updatedTrips.filter(
          (trip) =>
            trip.userId ===
            user.id
        )
      );

      setDeletingTripId(null);
    }, 350);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4 animate-bounce">
            🌴
          </div>

          <p className="text-gray-500 animate-pulse">
            Loading your Lombok trips...
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

      <section
        className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8"
        style={{
          animationName: pageLoaded
            ? "fadeUp"
            : "none",
          animationDuration: "0.7s",
          animationTimingFunction:
            "ease-out",
          animationFillMode: "forwards",
          opacity: pageLoaded ? undefined : 0,
        }}
      >

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              🧳 Your Lombok Collection
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mt-5">
              My Trips
            </h1>

            <p className="text-gray-500 mt-3">
              All your saved Lombok
              adventures in one place.
            </p>

          </div>

          <Link
            href="/planner"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 transition-all duration-200"
          >
            ✨ Plan New Trip

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>

      </section>

      {/* =========================
          TRIPS
      ========================= */}

      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-16">

        {trips.length === 0 ? (

          <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 md:p-16 text-center"
            style={{
              animationName: pageLoaded
                ? "cardEnter"
                : "none",
              animationDuration: "0.8s",
              animationTimingFunction:
                "ease-out",
              animationFillMode: "forwards",
              opacity: pageLoaded ? undefined : 0,
            }}
          >

            <div className="text-6xl mb-5 animate-pulse">
              🗺️
            </div>

            <h2 className="text-2xl font-bold">
              No trips yet
            </h2>

            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              Start planning your next
              Lombok adventure and your
              saved trips will appear here.
            </p>

            <Link
              href="/planner"
              className="group inline-flex items-center gap-2 mt-7 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:scale-95 transition-all duration-200"
            >
              ✈️ Plan My First Trip

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">

            {trips.map(
              (trip, index) => {

                const image =
                  images[
                    trip.destination
                  ];

                const days =
                  calculateDays(
                    trip.startDate,
                    trip.endDate
                  );

                const isDeleting =
                  deletingTripId ===
                  trip.id;

                return (
                  <article
                    key={trip.id}
                    className={`group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 ${
                      isDeleting
                        ? "opacity-0 scale-95 -translate-y-3"
                        : "opacity-100 hover:shadow-xl hover:-translate-y-2"
                    }`}
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
                      animationDelay:
                        `${index * 120}ms`,
                      opacity:
                        pageLoaded
                          ? undefined
                          : 0,
                    }}
                  >

                    {/* =========================
                        IMAGE
                    ========================= */}

                    <div className="relative h-56 bg-gradient-to-br from-blue-100 to-cyan-50 overflow-hidden">

                      {image ? (

                        <img
                          src={image}
                          alt={`${trip.destination} Lombok`}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-105">

                          <div className="text-center">

                            <div className="text-6xl transition-transform duration-500 group-hover:scale-110">
                              🌴
                            </div>

                            <p className="text-blue-600 font-bold mt-3">
                              {trip.destination}
                            </p>

                          </div>

                        </div>

                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 transition-all duration-300 group-hover:scale-105">
                        LOMBOK
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 transition-all duration-300 group-hover:scale-105">
                        {days} Days
                      </div>

                      <div className="absolute bottom-5 left-5 right-5 text-white">

                        <p className="text-sm opacity-90">
                          📍 Destination
                        </p>

                        <h2 className="text-2xl font-bold mt-1">
                          {trip.destination}
                        </h2>

                      </div>

                    </div>

                    {/* =========================
                        CONTENT
                    ========================= */}

                    <div className="p-6">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                          📅
                        </div>

                        <div>

                          <p className="text-xs text-gray-400">
                            Travel Dates
                          </p>

                          <p className="text-sm font-semibold text-gray-700">
                            {formatDate(
                              trip.startDate
                            )}{" "}
                            →{" "}
                            {formatDate(
                              trip.endDate
                            )}
                          </p>

                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <TripDetail
                          icon="💰"
                          label="Budget"
                          value={
                            trip.budget
                          }
                        />

                        <TripDetail
                          icon="👥"
                          label="Travelers"
                          value={
                            trip.travelers
                          }
                        />

                        <TripDetail
                          icon="🧳"
                          label="Style"
                          value={
                            trip.travelStyle
                          }
                        />

                        <TripDetail
                          icon="🎯"
                          label="Interest"
                          value={
                            trip.interests ||
                            "Any"
                          }
                        />

                      </div>

                      {/* =========================
                          BUTTONS
                      ========================= */}

                      <div className="flex gap-3 mt-6">

                        <button
                          onClick={() =>
                            viewTrip(
                              trip
                            )
                          }
                          disabled={isDeleting}
                          className="group/view flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 disabled:opacity-50 transition-all duration-200"
                        >
                          <span className="inline-flex items-center justify-center gap-2">
                            View Trip

                            <span className="transition-transform duration-200 group-hover/view:translate-x-1">
                              →
                            </span>
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            deleteTrip(
                              trip.id
                            )
                          }
                          disabled={isDeleting}
                          className="group/delete px-4 py-3 border border-red-100 text-red-500 rounded-xl font-semibold hover:bg-red-50 hover:border-red-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 transition-all duration-200"
                          title="Delete trip"
                        >
                          <span className="inline-block transition-transform duration-200 group-hover/delete:scale-110">
                            {isDeleting
                              ? "⏳"
                              : "🗑️"}
                          </span>
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* =========================
          ANIMATIONS
      ========================= */}

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(45px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

    </main>
  );
}

function TripDetail({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 transition-all duration-300 hover:bg-blue-50 hover:-translate-y-0.5">

      <div className="flex items-center gap-2">

        <span className="text-base">
          {icon}
        </span>

        <span className="text-xs text-gray-400">
          {label}
        </span>

      </div>

      <p className="text-sm font-semibold text-gray-700 mt-1 truncate">
        {value}
      </p>

    </div>
  );
}