"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type User = {
  id: string;
  name: string;
  email: string;
};

type Trip = {
  id: string;
  userId: string;
  userEmail: string;
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

type BudgetAmount = {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
};

type DayPlan = {
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  photoQuery: string;
};

type DestinationPhoto = {
  url: string;
  title: string;
};

type DayPhotos = Record<number, DestinationPhoto[]>;

function TripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [destinationImage, setDestinationImage] =
    useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [dayPhotos, setDayPhotos] = useState<DayPhotos>({});
  const [loadingPhotos, setLoadingPhotos] =
    useState<Record<number, boolean>>({});
  const [activePhoto, setActivePhoto] =
    useState<Record<number, number>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryDay, setGalleryDay] = useState<number | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const destination =
    searchParams.get("destination") || "Your Destination";

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const budget = searchParams.get("budget") || "Comfort";

  const travelers =
    searchParams.get("travelers") || "2 Travelers";

  const interests = searchParams.get("interests") || "";
  const travelStyle =
    searchParams.get("travelStyle") || "Balanced";

  const specialRequest =
    searchParams.get("specialRequest") || "";

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("funtravel_logged_in");

    if (loggedIn !== "true") {
      router.push("/login");
      return;
    }

    const savedUser =
      localStorage.getItem("funtravel_current_user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      if (!parsedUser.id || !parsedUser.email) {
        localStorage.removeItem("funtravel_current_user");
        localStorage.removeItem("funtravel_logged_in");

        router.push("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("funtravel_current_user");
      localStorage.removeItem("funtravel_logged_in");

      router.push("/login");
      return;
    }

    setCheckingLogin(false);
  }, [router]);

  // ==========================================
  // PAGE LOAD ANIMATION
  // ==========================================

  useEffect(() => {
    if (!checkingLogin) {
      const timer = setTimeout(() => {
        setPageLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [checkingLogin]);

  // ==========================================
  // MAIN DESTINATION IMAGE
  // ==========================================

  useEffect(() => {
    async function loadImage() {
      setLoadingImage(true);

      try {
        const searchQuery =
          encodeURIComponent(destination);

        const url =
          `https://commons.wikimedia.org/w/api.php` +
          `?action=query` +
          `&generator=search` +
          `&gsrsearch=${searchQuery}` +
          `&gsrnamespace=6` +
          `&gsrlimit=15` +
          `&prop=imageinfo` +
          `&iiprop=url` +
          `&iiurlwidth=1400` +
          `&format=json` +
          `&origin=*`;

        const response = await fetch(url);

        if (!response.ok) {
          setDestinationImage(null);
          return;
        }

        const data = await response.json();

        const pages = data?.query?.pages;

        if (!pages) {
          setDestinationImage(null);
          return;
        }

        const pageList =
          Object.values(pages) as any[];

        const validImage =
          pageList.find(
            (page) =>
              page?.imageinfo?.[0]?.thumburl
          );

        if (
          validImage?.imageinfo?.[0]?.thumburl
        ) {
          setDestinationImage(
            validImage.imageinfo[0].thumburl
          );
        } else {
          setDestinationImage(null);
        }
      } catch {
        setDestinationImage(null);
      } finally {
        setLoadingImage(false);
      }
    }

    loadImage();
  }, [destination]);

  // ==========================================
  // DATE
  // ==========================================

  function formatDate(date: string) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function calculateDays() {
    if (!startDate || !endDate) {
      return 3;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const difference =
      end.getTime() - start.getTime();

    const days =
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return days > 0 ? days : 3;
  }

  const totalDays = calculateDays();

  // ==========================================
  // USER
  // ==========================================

  function getInitials(name: string) {
    if (!name) return "U";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem(
      "funtravel_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_user"
    );

    router.push("/login");
  }

  // ==========================================
  // SAVE TRIP
  // ==========================================

  function saveTrip() {
    if (!user) {
      router.push("/login");
      return;
    }

    const existingTrips =
      localStorage.getItem("funtravel_trips");

    let trips: Trip[] = [];

    if (existingTrips) {
      try {
        trips = JSON.parse(existingTrips);
      } catch {
        trips = [];
      }
    }

    const alreadyExists =
      trips.some(
        (trip) =>
          trip.userId === user.id &&
          trip.destination === destination &&
          trip.startDate === startDate &&
          trip.endDate === endDate
      );

    if (alreadyExists) {
      setSaved(true);
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      userId: user.id,
      userEmail: user.email,
      destination,
      startDate,
      endDate,
      travelers,
      budget,
      interests,
      travelStyle,
      specialRequest,
      createdAt:
        new Date().toISOString(),
    };

    const updatedTrips = [
      newTrip,
      ...trips,
    ];

    localStorage.setItem(
      "funtravel_trips",
      JSON.stringify(updatedTrips)
    );

    setSaved(true);
  }

  // ==========================================
  // DELETE
  // ==========================================

  function deleteTrip() {
    if (!user) return;

    const existingTrips =
      localStorage.getItem("funtravel_trips");

    if (!existingTrips) {
      router.push("/trips");
      return;
    }

    let trips: Trip[] = [];

    try {
      trips = JSON.parse(existingTrips);
    } catch {
      trips = [];
    }

    const updatedTrips =
      trips.filter(
        (trip) =>
          !(
            trip.userId === user.id &&
            trip.destination === destination &&
            trip.startDate === startDate &&
            trip.endDate === endDate
          )
      );

    localStorage.setItem(
      "funtravel_trips",
      JSON.stringify(updatedTrips)
    );

    router.push("/trips");
  }

  function handlePrint() {
    window.print();
  }

  // ==========================================
  // DAY PLANS
  // ==========================================

  function getDayPlans(): DayPlan[] {
    const plans: DayPlan[] = [];

    for (
      let i = 1;
      i <= totalDays;
      i++
    ) {
      if (i === 1) {
        plans.push({
          title:
            "Arrival & Exploration",

          morning:
            `Arrive in ${destination} and check in to your accommodation.`,

          afternoon:
            `Enjoy lunch and start exploring interesting places around ${destination}.`,

          evening:
            `Relax and enjoy the local atmosphere around ${destination}.`,

          photoQuery:
            `${destination} tourism`,
        });
      } else if (i === 2) {
        plans.push({
          title:
            "Explore & Experience",

          morning:
            `Start the day with a visit to one of the popular attractions in ${destination}.`,

          afternoon:
            `Enjoy local food and continue exploring places that match your interests.`,

          evening:
            `Spend a relaxing evening and discover the local nightlife or sunset spots.`,

          photoQuery:
            `${destination} attractions`,
        });
      } else if (i === totalDays) {
        plans.push({
          title:
            "Relax & Departure",

          morning:
            `Enjoy a relaxed morning and visit one last interesting place in ${destination}.`,

          afternoon:
            `Have your final local meal and prepare for your journey home.`,

          evening:
            `Finish your trip and travel back home safely.`,

          photoQuery:
            `${destination} sunset`,
        });
      } else {
        plans.push({
          title:
            "Adventure Day",

          morning:
            `Have breakfast and explore a scenic destination around ${destination}.`,

          afternoon:
            `Enjoy activities, local cuisine, and cultural experiences.`,

          evening:
            `Relax, take photos, and enjoy the atmosphere before ending the day.`,

          photoQuery:
            `${destination} nature travel`,
        });
      }
    }

    return plans;
  }

  const dayPlans = getDayPlans();

  // ==========================================
  // LOAD MULTIPLE PHOTOS
  // ==========================================

  useEffect(() => {
    async function loadAllPhotos() {
      const results: DayPhotos = {};

      const loadingState: Record<
        number,
        boolean
      > = {};

      dayPlans.forEach(
        (_, index) => {
          loadingState[index + 1] = true;
        }
      );

      setLoadingPhotos(loadingState);

      await Promise.all(
        dayPlans.map(
          async (plan, index) => {
            const day = index + 1;

            try {
              const searchQuery =
                encodeURIComponent(
                  plan.photoQuery
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
                `&iiurlwidth=1000` +
                `&format=json` +
                `&origin=*`;

              const response =
                await fetch(url);

              if (!response.ok) {
                results[day] = [];
                return;
              }

              const data =
                await response.json();

              const pages =
                data?.query?.pages;

              if (!pages) {
                results[day] = [];
                return;
              }

              const pageList =
                Object.values(
                  pages
                ) as any[];

              const photos:
                DestinationPhoto[] =
                pageList
                  .map(
                    (page) => ({
                      url:
                        page
                          ?.imageinfo?.[0]
                          ?.thumburl,
                      title:
                        page?.title ||
                        destination,
                    })
                  )
                  .filter(
                    (photo) =>
                      Boolean(
                        photo.url
                      )
                  )
                  .slice(0, 5);

              results[day] = photos;
            } catch {
              results[day] = [];
            } finally {
              setLoadingPhotos(
                (previous) => ({
                  ...previous,
                  [day]: false,
                })
              );
            }
          }
        )
      );

      setDayPhotos(results);

      const initialSlides:
        Record<number, number> = {};

      dayPlans.forEach(
        (_, index) => {
          initialSlides[index + 1] = 0;
        }
      );

      setActivePhoto(initialSlides);
    }

    loadAllPhotos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    destination,
    totalDays,
  ]);

  // ==========================================
  // AUTO SLIDE — EACH DAY
  // ==========================================

  useEffect(() => {
    const interval =
      setInterval(() => {
        setActivePhoto(
          (previous) => {
            const next = {
              ...previous,
            };

            Object.keys(dayPhotos).forEach(
              (dayKey) => {
                const day =
                  Number(dayKey);

                const photos =
                  dayPhotos[day];

                if (
                  photos &&
                  photos.length > 1
                ) {
                  next[day] =
                    ((previous[day] ||
                      0) +
                      1) %
                    photos.length;
                }
              }
            );

            return next;
          }
        );
      }, 4500);

    return () =>
      clearInterval(interval);
  }, [dayPhotos]);

  // ==========================================
  // GALLERY
  // ==========================================

  function openGallery(
    day: number,
    index: number
  ) {
    const photos =
      dayPhotos[day];

    if (
      !photos ||
      photos.length === 0
    ) {
      return;
    }

    setGalleryDay(day);
    setGalleryIndex(index);
    setGalleryOpen(true);
  }

  function closeGallery() {
    setGalleryOpen(false);
    setGalleryDay(null);
  }

  function nextGalleryPhoto() {
    if (
      galleryDay === null
    ) {
      return;
    }

    const photos =
      dayPhotos[galleryDay];

    if (
      !photos ||
      photos.length === 0
    ) {
      return;
    }

    setGalleryIndex(
      (previous) =>
        (previous + 1) %
        photos.length
    );
  }

  function previousGalleryPhoto() {
    if (
      galleryDay === null
    ) {
      return;
    }

    const photos =
      dayPhotos[galleryDay];

    if (
      !photos ||
      photos.length === 0
    ) {
      return;
    }

    setGalleryIndex(
      (previous) =>
        (previous - 1 +
          photos.length) %
        photos.length
    );
  }

  // ==========================================
  // FULLSCREEN AUTO SLIDE
  // ==========================================

  useEffect(() => {
    if (!galleryOpen) {
      return;
    }

    const interval =
      setInterval(() => {
        nextGalleryPhoto();
      }, 5000);

    return () =>
      clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    galleryOpen,
    galleryDay,
    dayPhotos,
  ]);

  // ==========================================
  // ESC KEY
  // ==========================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (!galleryOpen) {
        return;
      }

      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowRight") {
        nextGalleryPhoto();
      }

      if (event.key === "ArrowLeft") {
        previousGalleryPhoto();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    galleryOpen,
    galleryDay,
    dayPhotos,
  ]);

  // ==========================================
  // BUDGET
  // ==========================================

  function getBudgetAmount(): BudgetAmount {
    const travelerNumber =
      parseInt(travelers) || 2;

    const days = totalDays;

    if (budget === "Budget") {
      return {
        accommodation:
          250000 *
          days *
          travelerNumber,

        food:
          150000 *
          days *
          travelerNumber,

        transportation:
          100000 *
          days,

        activities:
          100000 *
          days *
          travelerNumber,
      };
    }

    if (budget === "Luxury") {
      return {
        accommodation:
          1500000 *
          days *
          travelerNumber,

        food:
          500000 *
          days *
          travelerNumber,

        transportation:
          400000 *
          days,

        activities:
          500000 *
          days *
          travelerNumber,
      };
    }

    return {
      accommodation:
        600000 *
        days *
        travelerNumber,

      food:
        250000 *
        days *
        travelerNumber,

      transportation:
        200000 *
        days,

      activities:
        250000 *
        days *
        travelerNumber,
    };
  }

  const budgetAmount =
    getBudgetAmount();

  const totalBudget =
    budgetAmount.accommodation +
    budgetAmount.food +
    budgetAmount.transportation +
    budgetAmount.activities;

  function formatRupiah(
    amount: number
  ) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(amount);
  }

  function getFallbackImage() {
    return `https://placehold.co/1400x650/e0f2fe/2563eb?text=${encodeURIComponent(
      destination
    )}`;
  }

  // ==========================================
  // LOGIN LOADING
  // ==========================================

  if (checkingLogin) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="text-5xl mb-4 animate-pulse">
            ✈️
          </div>

          <p className="text-gray-500">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <div className="print:hidden">
        <Navbar />
      </div>

      {/* ======================================
          HERO
      ====================================== */}

      <section
        className="max-w-6xl mx-auto px-6 pt-8"
        style={{
          animationName: pageLoaded
            ? "fadeUp"
            : "none",
          animationDuration: "0.8s",
          animationTimingFunction:
            "ease-out",
          animationFillMode:
            "forwards",
          opacity: pageLoaded
            ? undefined
            : 0,
        }}
      >

        <div className="relative h-[360px] md:h-[430px] rounded-[2rem] overflow-hidden shadow-lg bg-blue-100 group">

          {loadingImage ? (
            <div className="w-full h-full flex items-center justify-center">

              <div className="text-center">

                <div className="text-5xl animate-pulse">
                  🌎
                </div>

                <p className="text-blue-600 font-medium mt-3 animate-pulse">
                  Finding a beautiful photo...
                </p>

              </div>

            </div>
          ) : (
            <img
              src={
                destinationImage ||
                getFallbackImage()
              }
              alt={`${destination} destination`}
              className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.src =
                  getFallbackImage();
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10 text-white">

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold"
              style={{
                animationName: pageLoaded
                  ? "fadeUp"
                  : "none",
                animationDuration:
                  "0.7s",
                animationDelay:
                  "250ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >
              ✨ Your Personalized Trip
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold mt-4"
              style={{
                animationName: pageLoaded
                  ? "fadeUp"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "350ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >
              {destination}
            </h1>

            <p
              className="mt-3 text-white/90"
              style={{
                animationName: pageLoaded
                  ? "fadeUp"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "450ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >
              {formatDate(startDate)}{" "}
              →{" "}
              {formatDate(endDate)}{" "}
              • {totalDays} Days
            </p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div
          className="flex flex-wrap gap-3 mt-5 print:hidden"
          style={{
            animationName: pageLoaded
              ? "fadeUp"
              : "none",
            animationDuration: "0.7s",
            animationDelay: "550ms",
            animationFillMode:
              "forwards",
            opacity: pageLoaded
              ? undefined
              : 0,
          }}
        >

          <button
            onClick={saveTrip}
            disabled={saved}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
              saved
                ? "bg-green-100 text-green-600"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
            }`}
          >
            {saved
              ? "✓ Trip Saved"
              : "💾 Save Trip"}
          </button>

          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:-translate-y-1 hover:shadow-md active:scale-95 transition-all duration-200"
          >
            🖨️ Print
          </button>

        </div>

      </section>

      {/* ======================================
          OVERVIEW
      ====================================== */}

      <section className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <InfoCard
            icon="📅"
            title="Duration"
            value={`${totalDays} Days`}
            delay="650ms"
            loaded={pageLoaded}
          />

          <InfoCard
            icon="👥"
            title="Travelers"
            value={travelers}
            delay="730ms"
            loaded={pageLoaded}
          />

          <InfoCard
            icon="💰"
            title="Budget"
            value={budget}
            delay="810ms"
            loaded={pageLoaded}
          />

          <InfoCard
            icon="🧳"
            title="Style"
            value={travelStyle}
            delay="890ms"
            loaded={pageLoaded}
          />

        </div>

      </section>

      {/* ======================================
          MAIN
      ====================================== */}

      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ==================================
              LEFT
          ================================== */}

          <div className="lg:col-span-2 space-y-8">

            {/* ==================================
                ITINERARY
            ================================== */}

            <div
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"
              style={{
                animationName: pageLoaded
                  ? "fadeUp"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "900ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >

              <div className="flex items-center gap-4 mb-8">

                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:rotate-3">
                  🗓️
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    Your Itinerary
                  </h2>

                  <p className="text-sm text-gray-500">
                    Your suggested day-by-day travel plan
                  </p>

                </div>

              </div>

              <div className="space-y-12">

                {dayPlans.map(
                  (plan, index) => {

                    const day =
                      index + 1;

                    const photos =
                      dayPhotos[day] ||
                      [];

                    const currentPhoto =
                      activePhoto[day] ||
                      0;

                    return (
                      <div
                        key={day}
                        className="relative pl-8 border-l-2 border-blue-100"
                        style={{
                          animationName:
                            pageLoaded
                              ? "fadeUp"
                              : "none",
                          animationDuration:
                            "0.7s",
                          animationDelay:
                            `${1000 + index * 120}ms`,
                          animationFillMode:
                            "forwards",
                          opacity:
                            pageLoaded
                              ? undefined
                              : 0,
                        }}
                      >

                        <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-transform duration-300 hover:scale-125">
                          {day}
                        </div>

                        <h3 className="text-xl font-bold">
                          Day {day} —{" "}
                          {plan.title}
                        </h3>

                        {/* PHOTO */}

                        <div className="mt-5">

                          <div
                            className="relative h-[220px] md:h-[300px] rounded-3xl overflow-hidden bg-gray-100 cursor-pointer group"
                            onClick={() =>
                              openGallery(
                                day,
                                currentPhoto
                              )
                            }
                          >

                            {loadingPhotos[day] ? (

                              <div className="w-full h-full flex flex-col items-center justify-center">

                                <div className="text-4xl animate-pulse">
                                  📸
                                </div>

                                <p className="text-sm text-gray-400 mt-2 animate-pulse">
                                  Finding photos...
                                </p>

                              </div>

                            ) : photos.length > 0 ? (

                              <>

                                <img
                                  src={
                                    photos[
                                      currentPhoto
                                    ]?.url
                                  }
                                  alt={`${destination} - Day ${day}`}
                                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                                <div className="absolute bottom-4 left-4 text-white text-sm font-semibold transition-transform duration-300 group-hover:translate-x-1">
                                  📍 {destination}
                                </div>

                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs">
                                  🖼️{" "}
                                  {currentPhoto +
                                    1}{" "}
                                  /{" "}
                                  {
                                    photos.length
                                  }
                                </div>

                                <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      setActivePhoto(
                                        (
                                          previous
                                        ) => ({
                                          ...previous,
                                          [day]:
                                            (currentPhoto -
                                              1 +
                                              photos.length) %
                                            photos.length,
                                        })
                                      );
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-800 shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
                                  >
                                    ←
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      setActivePhoto(
                                        (
                                          previous
                                        ) => ({
                                          ...previous,
                                          [day]:
                                            (currentPhoto +
                                              1) %
                                            photos.length,
                                        })
                                      );
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur text-gray-800 shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
                                  >
                                    →
                                  </button>

                                </div>

                              </>

                            ) : (

                              <div className="w-full h-full flex items-center justify-center bg-blue-50">

                                <div className="text-center px-6 transition-transform duration-500 hover:scale-105">

                                  <div className="text-4xl">
                                    🌎
                                  </div>

                                  <p className="text-sm text-blue-600 mt-2 font-medium">
                                    {destination}
                                  </p>

                                </div>

                              </div>

                            )}

                          </div>

                          {/* THUMBNAILS */}

                          {photos.length > 1 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">

                              {photos.map(
                                (
                                  photo,
                                  photoIndex
                                ) => (
                                  <button
                                    key={
                                      photoIndex
                                    }
                                    type="button"
                                    onClick={() =>
                                      setActivePhoto(
                                        (
                                          previous
                                        ) => ({
                                          ...previous,
                                          [day]:
                                            photoIndex,
                                        })
                                      )
                                    }
                                    className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                      currentPhoto ===
                                      photoIndex
                                        ? "border-blue-600 scale-105 shadow-md"
                                        : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                                    }`}
                                  >
                                    <img
                                      src={
                                        photo.url
                                      }
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </button>
                                )
                              )}

                            </div>
                          )}

                        </div>

                        {/* ACTIVITIES */}

                        <div className="mt-5 space-y-3">

                          <Activity
                            time="Morning"
                            icon="🌅"
                            text={
                              plan.morning
                            }
                            delay="0ms"
                          />

                          <Activity
                            time="Afternoon"
                            icon="🍜"
                            text={
                              plan.afternoon
                            }
                            delay="80ms"
                          />

                          <Activity
                            time="Evening"
                            icon="🌙"
                            text={
                              plan.evening
                            }
                            delay="160ms"
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* ==================================
                BUDGET
            ================================== */}

            <div
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8"
              style={{
                animationName: pageLoaded
                  ? "fadeUp"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "1150ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >

              <div className="flex items-center gap-4 mb-7">

                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 hover:scale-110 hover:rotate-3">
                  💰
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    Estimated Budget
                  </h2>

                  <p className="text-sm text-gray-500">
                    Based on your selected budget
                  </p>

                </div>

              </div>

              <div className="space-y-4">

                <BudgetRow
                  icon="🏨"
                  label="Accommodation"
                  amount={
                    budgetAmount.accommodation
                  }
                  delay="0ms"
                />

                <BudgetRow
                  icon="🍜"
                  label="Food"
                  amount={
                    budgetAmount.food
                  }
                  delay="70ms"
                />

                <BudgetRow
                  icon="🚗"
                  label="Transportation"
                  amount={
                    budgetAmount.transportation
                  }
                  delay="140ms"
                />

                <BudgetRow
                  icon="🎯"
                  label="Activities"
                  amount={
                    budgetAmount.activities
                  }
                  delay="210ms"
                />

              </div>

              <div className="border-t border-gray-100 mt-6 pt-6 flex items-center justify-between">

                <span className="font-bold text-lg">
                  Estimated Total
                </span>

                <span className="font-bold text-xl text-blue-600">
                  {formatRupiah(
                    totalBudget
                  )}
                </span>

              </div>

              <p className="text-xs text-gray-400 mt-4">
                * Estimated only. Actual costs may vary.
              </p>

            </div>

          </div>

          {/* ======================================
              SIDEBAR
          ====================================== */}

          <div className="space-y-6">

            {/* PREFERENCES */}

            <div
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
              style={{
                animationName: pageLoaded
                  ? "slideRight"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "950ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >

              <h2 className="text-lg font-bold mb-5">
                Your Preferences
              </h2>

              <div className="space-y-4">

                <Preference
                  icon="📍"
                  label="Destination"
                  value={destination}
                />

                <Preference
                  icon="📅"
                  label="Dates"
                  value={`${formatDate(
                    startDate
                  )} - ${formatDate(
                    endDate
                  )}`}
                />

                <Preference
                  icon="💰"
                  label="Budget"
                  value={budget}
                />

                <Preference
                  icon="👥"
                  label="Travelers"
                  value={travelers}
                />

                <Preference
                  icon="🎯"
                  label="Interests"
                  value={
                    interests ||
                    "Not specified"
                  }
                />

                <Preference
                  icon="🧳"
                  label="Travel Style"
                  value={travelStyle}
                />

              </div>

            </div>

            {/* SPECIAL REQUEST */}

            {specialRequest && (
              <div
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
                style={{
                  animationName: pageLoaded
                    ? "slideRight"
                    : "none",
                  animationDuration:
                    "0.8s",
                  animationDelay:
                    "1050ms",
                  animationFillMode:
                    "forwards",
                  opacity:
                    pageLoaded
                      ? undefined
                      : 0,
                }}
              >

                <h2 className="text-lg font-bold mb-3">
                  💬 Special Request
                </h2>

                <p className="text-gray-600 leading-6">
                  {specialRequest}
                </p>

              </div>
            )}

            {/* ACTIONS */}

            <div
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 print:hidden"
              style={{
                animationName: pageLoaded
                  ? "slideRight"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "1150ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >

              <h2 className="text-lg font-bold mb-4">
                Trip Actions
              </h2>

              <div className="space-y-3">

                <Link
                  href="/planner"
                  className="block w-full text-center px-4 py-3 rounded-xl bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 hover:-translate-y-1 hover:shadow-sm active:scale-95 transition-all duration-200"
                >
                  ✏️ Plan Another Trip
                </Link>

                <Link
                  href="/trips"
                  className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:-translate-y-1 hover:shadow-sm active:scale-95 transition-all duration-200"
                >
                  🧳 My Trips
                </Link>

                <button
                  onClick={() =>
                    setShowDeleteConfirm(
                      true
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl border border-red-100 text-red-500 font-semibold hover:bg-red-50 hover:border-red-200 hover:-translate-y-1 active:scale-95 transition-all duration-200"
                >
                  🗑️ Delete Trip
                </button>

              </div>

            </div>

            {/* TIP */}

            <div
              className="bg-blue-600 rounded-3xl p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                animationName: pageLoaded
                  ? "slideRight"
                  : "none",
                animationDuration:
                  "0.8s",
                animationDelay:
                  "1250ms",
                animationFillMode:
                  "forwards",
                opacity:
                  pageLoaded
                    ? undefined
                    : 0,
              }}
            >

              <div className="text-3xl transition-transform duration-300 hover:scale-110">
                💡
              </div>

              <h2 className="text-xl font-bold mt-3">
                Travel Tip
              </h2>

              <p className="text-blue-100 text-sm leading-6 mt-2">
                Keep your schedule flexible so you can discover unexpected places and experiences during your trip.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================
          DELETE MODAL
      ====================================== */}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-6 z-[100] print:hidden"
          onClick={() =>
            setShowDeleteConfirm(false)
          }
        >

          <div
            className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-modal-in"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="text-4xl mb-4">
              🗑️
            </div>

            <h2 className="text-2xl font-bold">
              Delete this trip?
            </h2>

            <p className="text-gray-500 mt-3 leading-6">
              This trip will be removed from your saved trips. This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-7">

              <button
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>

              <button
                onClick={deleteTrip}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-200"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================
          FULLSCREEN GALLERY
      ====================================== */}

      {galleryOpen &&
        galleryDay !== null &&
        dayPhotos[galleryDay] &&
        dayPhotos[galleryDay].length > 0 && (
          <div
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col print:hidden animate-gallery-in"
            onClick={closeGallery}
          >

            {/* TOP BAR */}

            <div
              className="flex items-center justify-between px-5 md:px-8 py-5 text-white"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div>

                <p className="text-sm text-white/60">
                  Day {galleryDay}
                </p>

                <h2 className="font-bold text-lg md:text-xl">
                  {destination}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeGallery}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 flex items-center justify-center text-2xl transition-all duration-200"
              >
                ×
              </button>

            </div>

            {/* MAIN IMAGE */}

            <div
              className="flex-1 relative flex items-center justify-center px-5 md:px-20"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                onClick={
                  previousGalleryPhoto
                }
                className="absolute left-4 md:left-8 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 text-white text-2xl backdrop-blur transition-all duration-200"
              >
                ←
              </button>

              <img
                src={
                  dayPhotos[
                    galleryDay
                  ][galleryIndex]?.url
                }
                alt={`${destination} gallery`}
                className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl select-none animate-gallery-image"
              />

              <button
                type="button"
                onClick={
                  nextGalleryPhoto
                }
                className="absolute right-4 md:right-8 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 text-white text-2xl backdrop-blur transition-all duration-200"
              >
                →
              </button>

            </div>

            {/* COUNTER */}

            <div className="text-center text-white/70 text-sm pb-3">
              {galleryIndex + 1} /{" "}
              {dayPhotos[galleryDay].length}
              {" "}• Auto slideshow
            </div>

            {/* THUMBNAILS */}

            <div
              className="flex gap-3 overflow-x-auto px-5 md:px-10 pb-6 justify-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {dayPhotos[
                galleryDay
              ].map(
                (
                  photo,
                  index
                ) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setGalleryIndex(
                        index
                      )
                    }
                    className={`flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      galleryIndex ===
                      index
                        ? "border-white scale-105 shadow-lg"
                        : "border-white/20 opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img
                      src={
                        photo.url
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                )
              )}

            </div>

          </div>
        )}

      {/* ======================================
          ANIMATIONS
      ====================================== */}

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes galleryIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes galleryImage {
          from {
            opacity: 0;
            transform: scale(0.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.7s ease-out forwards;
        }

        .animate-modal-in {
          animation: modalIn 0.3s ease-out forwards;
        }

        .animate-gallery-in {
          animation: galleryIn 0.3s ease-out forwards;
        }

        .animate-gallery-image {
          animation: galleryImage 0.4s ease-out forwards;
        }
      `}</style>

      {/* ======================================
          PRINT
      ====================================== */}

      <style jsx global>{`
        @media print {
          nav,
          button,
          .print\\:hidden {
            display: none !important;
          }

          body {
            background: white !important;
          }

          main {
            background: white !important;
          }
        }
      `}</style>

    </main>
  );
}

// ==========================================
// PAGE WRAPPER
// ==========================================

export default function TripPage() {
  return (
    <React.Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">

            <div className="text-5xl mb-4 animate-pulse">
              ✈️
            </div>

            <p className="text-gray-500 font-medium">
              Loading your trip...
            </p>

          </div>
        </main>
      }
    >
      <TripContent />
    </React.Suspense>
  );
}

// ==========================================
// INFO CARD
// ==========================================

function InfoCard({
  icon,
  title,
  value,
  delay,
  loaded,
}: {
  icon: string;
  title: string;
  value: string;
  delay: string;
  loaded: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        animationName: loaded
          ? "fadeUp"
          : "none",
        animationDuration: "0.7s",
        animationDelay: delay,
        animationFillMode:
          "forwards",
        opacity: loaded
          ? undefined
          : 0,
      }}
    >

      <div className="text-2xl transition-transform duration-300 hover:scale-110">
        {icon}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        {title}
      </p>

      <p className="font-bold mt-1">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// ACTIVITY
// ==========================================

function Activity({
  time,
  icon,
  text,
  delay,
}: {
  time: string;
  icon: string;
  text: string;
  delay: string;
}) {
  return (
    <div
      className="bg-gray-50 rounded-2xl p-4 transition-all duration-300 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-sm"
      style={{
        animationName: "fadeUp",
        animationDuration: "0.6s",
        animationDelay: delay,
        animationFillMode: "forwards",
      }}
    >

      <div className="flex items-center gap-3">

        <span className="text-xl transition-transform duration-300 hover:scale-110">
          {icon}
        </span>

        <span className="text-sm font-bold">
          {time}
        </span>

      </div>

      <p className="text-sm text-gray-600 mt-2 leading-6">
        {text}
      </p>

    </div>
  );
}

// ==========================================
// PREFERENCE
// ==========================================

function Preference({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 transition-all duration-200 hover:translate-x-1">

      <span className="text-lg">
        {icon}
      </span>

      <div className="min-w-0">

        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="text-sm font-medium text-gray-700 break-words">
          {value}
        </p>

      </div>

    </div>
  );
}

// ==========================================
// BUDGET ROW
// ==========================================

function BudgetRow({
  icon,
  label,
  amount,
  delay,
}: {
  icon: string;
  label: string;
  amount: number;
  delay: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl transition-all duration-300 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-sm"
      style={{
        animationName: "fadeUp",
        animationDuration: "0.6s",
        animationDelay: delay,
        animationFillMode: "forwards",
      }}
    >

      <div className="flex items-center gap-3">

        <span className="text-xl transition-transform duration-300 hover:scale-110">
          {icon}
        </span>

        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-gray-900">
        {new Intl.NumberFormat(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }
        ).format(amount)}
      </span>

    </div>
  );
}