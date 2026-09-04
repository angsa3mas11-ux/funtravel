"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type Destination = {
  name: string;
  country: string;
  emoji: string;
  search: string;
};

const destinations: Destination[] = [
  {
    name: "Pantai Tanjung Aan",
    country: "Lombok, Indonesia",
    emoji: "🏖️",
    search: "Tanjung Aan Beach Lombok Indonesia",
  },
  {
    name: "Pantai Selong Belanak",
    country: "Lombok, Indonesia",
    emoji: "🌊",
    search: "Selong Belanak Beach Lombok Indonesia",
  },
  {
    name: "Gunung Rinjani",
    country: "Lombok, Indonesia",
    emoji: "⛰️",
    search: "Mount Rinjani Lombok Indonesia",
  },
  {
    name: "Bukit Merese",
    country: "Lombok, Indonesia",
    emoji: "🌄",
    search: "Bukit Merese Lombok Indonesia",
  },
  {
    name: "Pantai Pink Lombok",
    country: "Lombok, Indonesia",
    emoji: "🌸",
    search: "Pink Beach Lombok Indonesia",
  },
  {
    name: "Air Terjun Tiu Kelep",
    country: "Lombok, Indonesia",
    emoji: "💧",
    search: "Tiu Kelep Waterfall Lombok Indonesia",
  },
  {
    name: "Gili Trawangan",
    country: "Lombok, Indonesia",
    emoji: "🏝️",
    search: "Gili Trawangan Lombok Indonesia",
  },
  {
    name: "Desa Adat Sade",
    country: "Lombok, Indonesia",
    emoji: "🏡",
    search: "Sade Village Lombok Indonesia",
  },
];

export default function HomePage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);

    async function loadImages() {
      const results: Record<string, string> = {};

      await Promise.all(
        destinations.map(async (destination) => {
          try {
            const response = await fetch(
              `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
                destination.search
              )}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
            );

            const data = await response.json();
            const pages = data?.query?.pages;

            if (pages) {
              const firstPage = Object.values(pages)[0] as {
                imageinfo?: {
                  thumburl?: string;
                  url?: string;
                }[];
              };

              const imageInfo = firstPage?.imageinfo?.[0];

              if (imageInfo?.thumburl) {
                results[destination.name] = imageInfo.thumburl;
              } else if (imageInfo?.url) {
                results[destination.name] = imageInfo.url;
              }
            }
          } catch (error) {
            console.error(
              `Gagal memuat foto ${destination.name}`,
              error
            );
          }
        })
      );

      setImages(results);
    }

    loadImages();
  }, []);

  return (
    <main className="min-h-screen bg-white text-gray-900">

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gray-50">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">

          {/* HERO TEXT */}
          <div
            className={`transition-all duration-1000 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >

            <div
              className={`mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-all duration-700 ${
                pageLoaded
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-3 opacity-0"
              }`}
            >
              🌴 Explore Lombok
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Your Lombok
              <span className="block text-blue-600">
                Adventure Starts Here
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-500">
              Discover beautiful beaches, mountains,
              waterfalls, islands, culture, and
              delicious local food across Lombok.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                href="/planner"
                className="rounded-xl bg-blue-600 px-7 py-4 text-center font-bold text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
              >
                Make a Plan →
              </Link>

              <Link
                href="/explore"
                className="rounded-xl border border-gray-200 bg-white px-7 py-4 text-center font-bold text-gray-700 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:text-blue-600 hover:shadow-md active:translate-y-0"
              >
                Explore Lombok
              </Link>

            </div>
          </div>

          {/* HERO IMAGE */}
          <div
            className={`relative transition-all delay-200 duration-1000 ${
              pageLoaded
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-8 scale-95 opacity-0"
            }`}
          >

            <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-400 to-cyan-400 shadow-2xl">

              {images["Pantai Tanjung Aan"] ? (
                <img
                  src={images["Pantai Tanjung Aan"]}
                  alt="Pantai Tanjung Aan Lombok"
                  className="h-[450px] w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex h-[450px] items-center justify-center">
                  <span className="animate-pulse text-8xl">
                    🏝️
                  </span>
                </div>
              )}

              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 transition duration-500 group-hover:translate-y-[-4px]">
                <p className="text-sm font-semibold text-white/80">
                  LOMBOK, INDONESIA
                </p>

                <h2 className="mt-1 text-3xl font-bold text-white">
                  Pantai Tanjung Aan
                </h2>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div
          className={`mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end transition-all duration-700 ${
            pageLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >

          <div>
            <p className="font-semibold text-blue-600">
              Discover Lombok
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Popular Destinations
            </h2>

            <p className="mt-3 max-w-2xl text-gray-500">
              Explore some of the most beautiful
              places waiting for you in Lombok.
            </p>
          </div>

          <Link
            href="/explore"
            className="font-semibold text-blue-600 transition duration-300 hover:translate-x-1 hover:text-blue-700"
          >
            View All →
          </Link>

        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {destinations.map((destination, index) => (
            <div
              key={destination.name}
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{
                animation: pageLoaded
                  ? `cardEnter 700ms ease-out ${index * 100}ms both`
                  : "none",
              }}
            >

              <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-400">

                {images[destination.name] ? (
                  <img
                    src={images[destination.name]}
                    alt={destination.name}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-6xl transition duration-500 group-hover:scale-125">
                      {destination.emoji}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition duration-500 group-hover:from-black/80" />

                <div className="absolute bottom-0 left-0 right-0 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    Lombok
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-white transition duration-300 group-hover:-translate-y-1">
                    {destination.name}
                  </h3>

                  <Link
                    href={`/planner?destination=${encodeURIComponent(
                      destination.name
                    )}`}
                    className="mt-3 flex translate-y-2 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white opacity-90 transition duration-300 hover:bg-blue-700 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    Plan Trip
                    <span className="transition duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* FEATURES */}
      <section className="overflow-hidden bg-gray-50">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div
            className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >

            <p className="font-semibold text-blue-600">
              Why FunTravel?
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Everything You Need for Lombok
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* FEATURE 1 */}
            <div
              className="group rounded-3xl bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{
                animation: pageLoaded
                  ? "cardEnter 700ms ease-out 200ms both"
                  : "none",
              }}
            >
              <div className="text-4xl transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                🗺️
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Discover Lombok
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Find beaches, mountains, waterfalls,
                gilis, cultural destinations, and
                culinary experiences.
              </p>
            </div>

            {/* FEATURE 2 */}
            <div
              className="group rounded-3xl bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{
                animation: pageLoaded
                  ? "cardEnter 700ms ease-out 350ms both"
                  : "none",
              }}
            >
              <div className="text-4xl transition duration-500 group-hover:scale-110 group-hover:-rotate-3">
                ✈️
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Plan Your Trip
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Build your own Lombok travel plan
                based on your dates, budget, travelers,
                and interests.
              </p>
            </div>

            {/* FEATURE 3 */}
            <div
              className="group rounded-3xl bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              style={{
                animation: pageLoaded
                  ? "cardEnter 700ms ease-out 500ms both"
                  : "none",
              }}
            >
              <div className="text-4xl transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                🤖
              </div>

              <h3 className="mt-5 text-xl font-bold">
                AI Travel Assistant
              </h3>

              <p className="mt-3 leading-7 text-gray-500">
                Get personalized Lombok travel
                recommendations and itinerary ideas.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div
          className={`relative overflow-hidden rounded-[2rem] bg-blue-600 p-10 text-center text-white transition-all duration-1000 md:p-16 ${
            pageLoaded
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-95 opacity-0"
          }`}
        >

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-white/10" />

          <div className="relative">

            <div className="inline-block text-5xl transition duration-500 hover:scale-125">
              🌴
            </div>

            <h2 className="mt-5 text-3xl font-bold md:text-4xl">
              Ready to Explore Lombok?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-blue-100">
              Start planning your next Lombok
              adventure with FunTravel.
            </p>

            <Link
              href="/planner"
              className="mt-8 inline-flex rounded-xl bg-white px-7 py-4 font-bold text-blue-600 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-xl active:translate-y-0"
            >
              Start Planning →
            </Link>

          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 md:flex-row md:items-center md:justify-between lg:px-8">

          <div
            className="transition duration-500 hover:translate-x-1"
          >
            <p className="text-xl font-bold text-blue-600">
              FunTravel
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Your Lombok travel companion.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-gray-500">

            <Link
              href="/"
              className="transition duration-300 hover:-translate-y-0.5 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/planner"
              className="transition duration-300 hover:-translate-y-0.5 hover:text-blue-600"
            >
              Planner
            </Link>

            <Link
              href="/trips"
              className="transition duration-300 hover:-translate-y-0.5 hover:text-blue-600"
            >
              My Trips
            </Link>

            <Link
              href="/explore"
              className="transition duration-300 hover:-translate-y-0.5 hover:text-blue-600"
            >
              Explore Lombok
            </Link>

          </div>

        </div>
      </footer>

      {/* ANIMATION CSS */}
      <style jsx>{`
        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.97);
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