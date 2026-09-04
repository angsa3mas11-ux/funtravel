"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

type User = {
  id: string;
  name: string;
  email: string;
};

function BudgetButton({
  value,
  label,
  description,
  selected,
  onClick,
}: {
  value: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
          : "border-gray-200 bg-white hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`font-bold ${
              selected ? "text-blue-700" : "text-gray-800"
            }`}
          >
            {label}
          </p>

          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>

        <div
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-blue-600 bg-blue-600"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </button>
  );
}

function Interest({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
        selected
          ? "scale-[1.02] border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-200"
          : "border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {label}
    </button>
  );
}

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("2 Travelers");
  const [travelStyle, setTravelStyle] = useState("Balanced");
  const [specialRequest, setSpecialRequest] = useState("");
  const [budget, setBudget] = useState("Comfort");
  const [interests, setInterests] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_logged_in");
    const currentUser = localStorage.getItem("funtravel_current_user");

    if (loggedIn !== "true" || !currentUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem("funtravel_current_user");
      localStorage.removeItem("funtravel_logged_in");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const selectedDestination = searchParams.get("destination");

    if (selectedDestination) {
      setDestination(selectedDestination);
    }
  }, [searchParams]);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);

    if (endDate && value > endDate) {
      setEndDate("");
    }

    setError("");
  };

  const generateTrip = () => {
    setError("");

    if (!user) {
      setError("Please login before creating a trip.");
      return;
    }

    const cleanDestination = destination.trim();

    if (!cleanDestination) {
      setError("Please enter a destination.");
      return;
    }

    if (!startDate) {
      setError("Please select your start date.");
      return;
    }

    if (!endDate) {
      setError("Please select your end date.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (startDate < today) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before your start date.");
      return;
    }

    setIsGenerating(true);

    const params = new URLSearchParams({
      destination: cleanDestination,
      startDate,
      endDate,
      budget,
      travelers,
      interests: interests.join(", "),
      travelStyle,
      specialRequest: specialRequest.trim(),
    });

    setTimeout(() => {
      router.push(`/trip?${params.toString()}`);
    }, 700);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div
          className={`mb-10 text-center transition-all duration-700 ${
            pageLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <span>✨</span>
            <span>AI Travel Planner</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Plan Your{" "}
            <span className="text-blue-600">Lombok</span>{" "}
            Adventure
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Tell us what kind of Lombok trip you want, and FunTravel will
            create a personalized itinerary for you.
          </p>
        </div>

        {/* MAIN FORM */}
        <div
          className={`rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-blue-100/40 transition-all duration-700 sm:p-8 ${
            pageLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0"
          }`}
        >
          {/* DESTINATION */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 1
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Where do you want to go?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explore beautiful destinations across Lombok.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Destination
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                📍
              </span>

              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setError("");
                }}
                placeholder="Example: Kuta Lombok, Senggigi, Gili Trawangan..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-800 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* DATE */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 2
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                When are you traveling?
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) =>
                    handleStartDateChange(e.target.value)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* TRAVELERS */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 3
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Who is traveling?
              </h2>
            </div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Number of Travelers
            </label>

            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option>1 Traveler</option>
              <option>2 Travelers</option>
              <option>3 Travelers</option>
              <option>4 Travelers</option>
              <option>5 Travelers</option>
              <option>6 Travelers</option>
              <option>7 Travelers</option>
              <option>8+ Travelers</option>
            </select>
          </div>

          {/* BUDGET */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 4
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                What is your budget?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Choose the travel style that fits your budget.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <BudgetButton
                value="Budget"
                label="Budget"
                description="Affordable & practical"
                selected={budget === "Budget"}
                onClick={() => setBudget("Budget")}
              />

              <BudgetButton
                value="Comfort"
                label="Comfort"
                description="Balanced & comfortable"
                selected={budget === "Comfort"}
                onClick={() => setBudget("Comfort")}
              />

              <BudgetButton
                value="Luxury"
                label="Luxury"
                description="Premium experience"
                selected={budget === "Luxury"}
                onClick={() => setBudget("Luxury")}
              />
            </div>
          </div>

          {/* INTERESTS */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 5
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                What are you interested in?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select one or more activities you would like to experience
                in Lombok.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Interest
                label="🏖️ Beaches"
                selected={interests.includes("Beaches")}
                onClick={() => toggleInterest("Beaches")}
              />

              <Interest
                label="🍜 Food"
                selected={interests.includes("Food")}
                onClick={() => toggleInterest("Food")}
              />

              <Interest
                label="🌿 Nature"
                selected={interests.includes("Nature")}
                onClick={() => toggleInterest("Nature")}
              />

              <Interest
                label="🏛️ Culture"
                selected={interests.includes("Culture")}
                onClick={() => toggleInterest("Culture")}
              />

              <Interest
                label="🛍️ Shopping"
                selected={interests.includes("Shopping")}
                onClick={() => toggleInterest("Shopping")}
              />

              <Interest
                label="🌙 Nightlife"
                selected={interests.includes("Nightlife")}
                onClick={() => toggleInterest("Nightlife")}
              />

              <Interest
                label="📸 Photography"
                selected={interests.includes("Photography")}
                onClick={() => toggleInterest("Photography")}
              />

              <Interest
                label="❤️ Romance"
                selected={interests.includes("Romance")}
                onClick={() => toggleInterest("Romance")}
              />
            </div>
          </div>

          {/* TRAVEL STYLE */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 6
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                What is your travel style?
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Relaxed & Slow",
                "Balanced",
                "Adventure",
                "Fast & Packed",
              ].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition-all duration-300 ${
                    travelStyle === style
                      ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "border-gray-200 bg-white text-gray-700 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* SPECIAL REQUEST */}
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Step 7
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Any special requests?
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tell us anything else that can make your Lombok trip better.
              </p>
            </div>

            <textarea
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              rows={5}
              placeholder="Example: I want a romantic sunset experience, avoid crowded places, find local food, etc."
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 animate-[shake_0.4s_ease-in-out] rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold text-red-600">
              ⚠️ {error}
            </div>
          )}

          {/* GENERATE BUTTON */}
          <button
            type="button"
            onClick={generateTrip}
            disabled={isGenerating}
            className={`group relative w-full overflow-hidden rounded-2xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-blue-200 transition-all duration-300 ${
              isGenerating
                ? "cursor-not-allowed opacity-80"
                : "hover:-translate-y-1 hover:bg-blue-700 hover:shadow-2xl"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isGenerating ? (
                <>
                  <span className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                  Creating Your Trip...
                </>
              ) : (
                <>
                  ✨ Generate My Lombok Trip
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </span>
          </button>

          {/* AI INFO */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                ✨
              </div>

              <div>
                <h3 className="font-bold text-blue-900">
                  Smart Lombok Trip Planning
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  FunTravel uses your destination, dates, budget, interests,
                  and travel style to create a personalized Lombok itinerary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="font-semibold text-gray-600">
              Loading Planner...
            </p>
          </div>
        </main>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}