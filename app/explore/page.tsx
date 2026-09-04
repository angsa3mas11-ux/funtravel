"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import CustomerService from "@/components/CustomerService";

type Destination = {
  id: string;
  name: string;
  category: string;
  description: string;
  search: string;
  emoji: string;
  location: string;
};

type ImageMap = Record<string, string[]>;

const destinations: Destination[] = [
  {
    id: "0zkt50",
    name: "Pantai Tanjung Aan",
    category: "Pantai",
    description:
      "Pantai dengan pasir putih yang indah dan air laut jernih, cocok untuk bersantai dan menikmati sunset.",
    search: "Tanjung Aan Lombok",
    emoji: "🏖️",
    location: "Kuta Mandalika, Lombok",
  },
  {
    id: "qzg1gk",
    name: "Pantai Selong Belanak",
    category: "Pantai",
    description:
      "Pantai populer dengan garis pantai luas dan ombak yang cocok untuk belajar surfing.",
    search: "Selong Belanak Lombok",
    emoji: "🏄",
    location: "Lombok Tengah",
  },
  {
    id: "z6gbhp",
    name: "Pantai Kuta Mandalika",
    category: "Pantai",
    description:
      "Pantai cantik di kawasan Mandalika dengan pasir putih dan pemandangan perbukitan.",
    search: "Kuta Mandalika Lombok",
    emoji: "🌊",
    location: "Mandalika, Lombok",
  },
  {
    id: "mawun",
    name: "Pantai Mawun",
    category: "Pantai",
    description:
      "Teluk cantik dengan air biru jernih yang dikelilingi bukit hijau.",
    search: "Mawun Beach Lombok",
    emoji: "🏝️",
    location: "Lombok Tengah",
  },
  {
    id: "pink",
    name: "Pantai Pink Lombok",
    category: "Pantai",
    description:
      "Pantai unik dengan pasir berwarna merah muda dan pemandangan laut yang memukau.",
    search: "Pink Beach Lombok",
    emoji: "🌸",
    location: "Lombok Timur",
  },
  {
    id: "senggigi",
    name: "Pantai Senggigi",
    category: "Pantai",
    description:
      "Salah satu pantai terkenal di Lombok dengan pemandangan sunset yang indah.",
    search: "Senggigi Beach Lombok",
    emoji: "🌅",
    location: "Lombok Barat",
  },
  {
    id: "bloam",
    name: "Pantai Tanjung Bloam",
    category: "Pantai",
    description:
      "Pantai alami dengan tebing batu dan suasana yang masih tenang.",
    search: "Tanjung Bloam Lombok",
    emoji: "🌴",
    location: "Lombok Timur",
  },
  {
    id: "rinjani",
    name: "Gunung Rinjani",
    category: "Gunung",
    description:
      "Gunung megah di Lombok dengan Danau Segara Anak dan panorama alam luar biasa.",
    search: "Mount Rinjani Lombok",
    emoji: "⛰️",
    location: "Lombok Utara",
  },
  {
    id: "merese",
    name: "Bukit Merese",
    category: "Alam",
    description:
      "Bukit populer untuk menikmati panorama laut dan sunset dari ketinggian.",
    search: "Merese Hill Lombok",
    emoji: "🌄",
    location: "Mandalika, Lombok",
  },
  {
    id: "selong",
    name: "Bukit Selong",
    category: "Alam",
    description:
      "Bukit dengan pemandangan hamparan sawah dan perbukitan Sembalun.",
    search: "Selong Hill Lombok",
    emoji: "🏞️",
    location: "Sembalun, Lombok",
  },
  {
    id: "tunak",
    name: "Taman Wisata Alam Gunung Tunak",
    category: "Alam",
    description:
      "Kawasan konservasi dengan tebing, pantai dan panorama alam yang masih alami.",
    search: "Gunung Tunak Lombok",
    emoji: "🌿",
    location: "Lombok Tengah",
  },
  {
    id: "sembalun",
    name: "Sembalun",
    category: "Alam",
    description:
      "Kawasan dataran tinggi dengan udara sejuk dan pemandangan pegunungan yang indah.",
    search: "Sembalun Lombok",
    emoji: "🏔️",
    location: "Lombok Timur",
  },
  {
    id: "sendang-gile",
    name: "Air Terjun Sendang Gile",
    category: "Air Terjun",
    description:
      "Air terjun indah di kaki Rinjani dengan suasana hutan yang sejuk.",
    search: "Sendang Gile Waterfall Lombok",
    emoji: "💦",
    location: "Lombok Utara",
  },
  {
    id: "tiu-kelep",
    name: "Air Terjun Tiu Kelep",
    category: "Air Terjun",
    description:
      "Air terjun spektakuler dengan aliran air tinggi dan suasana hutan tropis.",
    search: "Tiu Kelep Waterfall Lombok",
    emoji: "💧",
    location: "Lombok Utara",
  },
  {
    id: "benang-kelambu",
    name: "Air Terjun Benang Kelambu",
    category: "Air Terjun",
    description:
      "Air terjun unik yang mengalir seperti tirai dari sela-sela pepohonan.",
    search: "Benang Kelambu Waterfall Lombok",
    emoji: "🌊",
    location: "Lombok Tengah",
  },
  {
    id: "benang-stokel",
    name: "Air Terjun Benang Stokel",
    category: "Air Terjun",
    description:
      "Air terjun kembar yang berada di kawasan hutan tropis Lombok.",
    search: "Benang Stokel Waterfall Lombok",
    emoji: "💦",
    location: "Lombok Tengah",
  },
  {
    id: "gili-trawangan",
    name: "Gili Trawangan",
    category: "Gili",
    description:
      "Pulau kecil populer dengan laut jernih, snorkeling dan suasana tropis.",
    search: "Gili Trawangan Lombok",
    emoji: "🐠",
    location: "Lombok Utara",
  },
  {
    id: "gili-meno",
    name: "Gili Meno",
    category: "Gili",
    description:
      "Gili yang lebih tenang dengan pantai indah dan kehidupan bawah laut.",
    search: "Gili Meno Lombok",
    emoji: "🐢",
    location: "Lombok Utara",
  },
  {
    id: "gili-air",
    name: "Gili Air",
    category: "Gili",
    description:
      "Pulau tropis dengan pantai cantik, snorkeling dan suasana santai.",
    search: "Gili Air Lombok",
    emoji: "🏝️",
    location: "Lombok Utara",
  },
  {
    id: "sade",
    name: "Desa Adat Sade",
    category: "Budaya",
    description:
      "Desa tradisional Sasak yang mempertahankan rumah dan budaya khas Lombok.",
    search: "Sade Village Lombok",
    emoji: "🏡",
    location: "Lombok Tengah",
  },
  {
    id: "ende",
    name: "Kampung Tradisional Ende",
    category: "Budaya",
    description:
      "Kampung tradisional Sasak dengan rumah adat dan kehidupan masyarakat lokal.",
    search: "Ende Village Lombok",
    emoji: "🏘️",
    location: "Lombok Tengah",
  },
  {
    id: "sukarara",
    name: "Desa Sukarara",
    category: "Budaya",
    description:
      "Sentra kerajinan tenun tradisional khas masyarakat Sasak.",
    search: "Sukarara Village Lombok",
    emoji: "🧵",
    location: "Lombok Tengah",
  },
  {
    id: "bayan",
    name: "Masjid Kuno Bayan",
    category: "Budaya",
    description:
      "Situs budaya dan sejarah penting yang berkaitan dengan perkembangan Islam di Lombok.",
    search: "Bayan Ancient Mosque Lombok",
    emoji: "🕌",
    location: "Lombok Utara",
  },
  {
    id: "lingsar",
    name: "Pura Lingsar",
    category: "Budaya",
    description:
      "Kompleks pura bersejarah yang menjadi simbol kerukunan masyarakat Lombok.",
    search: "Lingsar Temple Lombok",
    emoji: "🛕",
    location: "Lombok Barat",
  },
  {
    id: "mayura",
    name: "Taman Mayura",
    category: "Budaya",
    description:
      "Taman bersejarah dengan kolam dan bangunan peninggalan Kerajaan Karangasem.",
    search: "Mayura Park Lombok",
    emoji: "🏛️",
    location: "Mataram, Lombok",
  },
  {
    id: "gendang-beleq",
    name: "Gendang Beleq",
    category: "Budaya",
    description:
      "Kesenian musik tradisional Sasak dengan drum besar dan pertunjukan budaya.",
    search: "Gendang Beleq Lombok",
    emoji: "🥁",
    location: "Lombok",
  },
  {
    id: "ayam-taliwang",
    name: "Ayam Taliwang",
    category: "Kuliner",
    description:
      "Kuliner khas Lombok berupa ayam bakar dengan bumbu pedas yang kaya rempah.",
    search: "Ayam Taliwang Lombok",
    emoji: "🍗",
    location: "Lombok",
  },
  {
    id: "plecing",
    name: "Plecing Kangkung",
    category: "Kuliner",
    description:
      "Kangkung dengan sambal tomat pedas khas Lombok.",
    search: "Plecing Kangkung Lombok",
    emoji: "🥗",
    location: "Lombok",
  },
  {
    id: "rembiga",
    name: "Sate Rembiga",
    category: "Kuliner",
    description:
      "Sate daging sapi khas Lombok dengan bumbu pedas dan gurih.",
    search: "Sate Rembiga Lombok",
    emoji: "🍢",
    location: "Mataram, Lombok",
  },
  {
    id: "bulayak",
    name: "Sate Bulayak",
    category: "Kuliner",
    description:
      "Sate khas Lombok yang disajikan bersama lontong bulayak dan bumbu kacang.",
    search: "Sate Bulayak Lombok",
    emoji: "🍢",
    location: "Lombok",
  },
  {
    id: "puyung",
    name: "Nasi Balap Puyung",
    category: "Kuliner",
    description:
      "Nasi khas Lombok dengan lauk pedas dan sambal yang menggugah selera.",
    search: "Nasi Balap Puyung Lombok",
    emoji: "🍚",
    location: "Lombok Tengah",
  },
  {
    id: "bebalung",
    name: "Bebalung",
    category: "Kuliner",
    description:
      "Sup iga khas Lombok dengan kuah gurih dan rempah yang kuat.",
    search: "Bebalung Lombok",
    emoji: "🍲",
    location: "Lombok",
  },
];

const categories = [
  "Semua",
  "Pantai",
  "Gunung",
  "Air Terjun",
  "Gili",
  "Alam",
  "Budaya",
  "Kuliner",
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [images, setImages] = useState<ImageMap>({});
  const [slideIndexes, setSlideIndexes] = useState<
    Record<string, number>
  >({});
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  // =========================
  // PAGE LOAD ANIMATION
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // =========================
  // LOAD WIKIMEDIA IMAGES
  // =========================

  useEffect(() => {
    let cancelled = false;

    async function loadImages() {
      const results: ImageMap = {};

      await Promise.all(
        destinations.map(async (destination) => {
          try {
            const response = await fetch(
              `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
                destination.search
              )}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
            );

            const data = await response.json();

            const pages = data?.query?.pages
              ? Object.values(data.query.pages)
              : [];

            const photoUrls = pages
              .map((page: any) => {
                return (
                  page?.imageinfo?.[0]?.thumburl ||
                  page?.imageinfo?.[0]?.url
                );
              })
              .filter(Boolean)
              .slice(0, 5) as string[];

            results[destination.id] = photoUrls;
          } catch {
            results[destination.id] = [];
          }
        })
      );

      if (!cancelled) {
        setImages(results);
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // AUTOMATIC CARD SLIDESHOW
  // =========================

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndexes((current) => {
        const next = { ...current };

        destinations.forEach((destination) => {
          const photos = images[destination.id] || [];

          if (photos.length > 1) {
            next[destination.id] =
              ((next[destination.id] || 0) + 1) %
              photos.length;
          }
        });

        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [images]);

  // =========================
  // FILTER
  // =========================

  const filteredDestinations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesCategory =
        category === "Semua" ||
        destination.category === category;

      const matchesSearch =
        !keyword ||
        destination.name.toLowerCase().includes(keyword) ||
        destination.category.toLowerCase().includes(keyword) ||
        destination.location.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  // =========================
  // CARD CONTROLS
  // =========================

  function previousImage(destination: Destination) {
    const photos = images[destination.id] || [];

    if (photos.length <= 1) return;

    setSlideIndexes((current) => ({
      ...current,
      [destination.id]:
        ((current[destination.id] || 0) -
          1 +
          photos.length) %
        photos.length,
    }));
  }

  function nextImage(destination: Destination) {
    const photos = images[destination.id] || [];

    if (photos.length <= 1) return;

    setSlideIndexes((current) => ({
      ...current,
      [destination.id]:
        ((current[destination.id] || 0) + 1) %
        photos.length,
    }));
  }

  // =========================
  // MODAL
  // =========================

  function openDestination(destination: Destination) {
    const index =
      slideIndexes[destination.id] || 0;

    setSelectedDestination(destination);
    setModalIndex(index);
  }

  function closeModal() {
    setSelectedDestination(null);
  }

  function previousModalImage() {
    if (!selectedDestination) return;

    const photos =
      images[selectedDestination.id] || [];

    if (photos.length <= 1) return;

    setModalIndex(
      (current) =>
        (current - 1 + photos.length) %
        photos.length
    );
  }

  function nextModalImage() {
    if (!selectedDestination) return;

    const photos =
      images[selectedDestination.id] || [];

    if (photos.length <= 1) return;

    setModalIndex(
      (current) =>
        (current + 1) % photos.length
    );
  }

  // =========================
  // MODAL AUTO SLIDESHOW
  // =========================

  useEffect(() => {
    if (!selectedDestination) return;

    const photos =
      images[selectedDestination.id] || [];

    if (photos.length <= 1) return;

    const timer = setInterval(() => {
      setModalIndex(
        (current) =>
          (current + 1) % photos.length
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [selectedDestination, images]);

  // =========================
  // KEYBOARD
  // =========================

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (!selectedDestination) return;

      if (event.key === "Escape") {
        closeModal();
      }

      if (event.key === "ArrowRight") {
        nextModalImage();
      }

      if (event.key === "ArrowLeft") {
        previousModalImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [selectedDestination, images]);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      {/* =========================
          HERO
      ========================= */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div
            className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
              🌴 Explore Lombok
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Discover the Beauty of{" "}
              <span className="text-blue-600">
                Lombok
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-500">
              Temukan destinasi terbaik di Lombok,
              mulai dari pantai, gunung, air terjun,
              gili, budaya hingga kuliner khas.
            </p>
          </div>

          {/* SEARCH */}

          <div
            className={`mx-auto mt-10 max-w-2xl transition-all delay-200 duration-1000 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari destinasi Lombok..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-14 pr-5 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* CATEGORIES */}

          <div
            className={`mt-8 flex flex-wrap justify-center gap-3 transition-all delay-300 duration-1000 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
                  category === item
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          DESTINATIONS
      ========================= */}

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div
          className={`mb-8 transition-all duration-700 ${
            pageLoaded
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Explore Destinations
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Jelajahi Lombok
              </h2>

              <p className="mt-2 text-gray-500">
                {filteredDestinations.length} destinasi ditemukan
              </p>
            </div>
          </div>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-5xl">🔍</div>

            <h3 className="mt-5 text-xl font-bold">
              Destinasi tidak ditemukan
            </h3>

            <p className="mt-2 text-gray-500">
              Coba gunakan kata pencarian atau kategori
              yang berbeda.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("Semua");
              }}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDestinations.map(
              (destination, index) => {
                const photos =
                  images[destination.id] || [];

                const currentIndex =
                  slideIndexes[destination.id] || 0;

                const currentImage =
                  photos[currentIndex];

                return (
                  <article
                    key={destination.id}
                    className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                    style={{
                      animationName: pageLoaded
                        ? "cardEnter"
                        : "none",
                      animationDuration: "0.7s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 70}ms`,
                      opacity: pageLoaded ? undefined : 0,
                    }}
                  >
                    {/* IMAGE */}

                    <div
                      className="relative h-64 cursor-pointer overflow-hidden bg-gray-100"
                      onClick={() =>
                        openDestination(destination)
                      }
                    >
                      {currentImage ? (
                        <img
                          key={currentImage}
                          src={currentImage}
                          alt={destination.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{
                            animationName: "imageFade",
                            animationDuration: "0.45s",
                            animationTimingFunction:
                              "ease-out",
                            animationFillMode: "both",
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-50">
                          <span className="text-6xl transition-transform duration-500 group-hover:scale-125">
                            {destination.emoji}
                          </span>
                        </div>
                      )}

                      {/* OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                      {/* CATEGORY */}

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-105">
                        {destination.category}
                      </div>

                      {/* PHOTO COUNT */}

                      {photos.length > 0 && (
                        <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                          📷 {currentIndex + 1}/
                          {photos.length}
                        </div>
                      )}

                      {/* IMAGE CONTROLS */}

                      {photos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              previousImage(destination);
                            }}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-gray-800 opacity-0 shadow-md transition-all duration-300 hover:scale-110 group-hover:opacity-100"
                          >
                            ←
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              nextImage(destination);
                            }}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-gray-800 opacity-0 shadow-md transition-all duration-300 hover:scale-110 group-hover:opacity-100"
                          >
                            →
                          </button>
                        </>
                      )}

                      {/* IMAGE TITLE */}

                      <div className="absolute bottom-4 left-4 right-4 translate-y-2 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <p className="text-xs font-medium text-white/80">
                          Klik untuk melihat foto
                        </p>
                      </div>
                    </div>

                    {/* DOTS */}

                    {photos.length > 1 && (
                      <div className="flex justify-center gap-1.5 bg-white px-4 pt-3">
                        {photos.map((_, photoIndex) => (
                          <button
                            key={photoIndex}
                            type="button"
                            onClick={() =>
                              setSlideIndexes(
                                (current) => ({
                                  ...current,
                                  [destination.id]:
                                    photoIndex,
                                })
                              )
                            }
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              photoIndex === currentIndex
                                ? "w-5 bg-blue-600"
                                : "w-1.5 bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Foto ${
                              photoIndex + 1
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* CONTENT */}

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                        {destination.name}
                      </h3>

                      <p className="mt-2 text-sm text-gray-400">
                        📍 {destination.location}
                      </p>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-500">
                        {destination.description}
                      </p>

                      <Link
                        href={`/planner?destination=${encodeURIComponent(
                          destination.name
                        )}`}
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200"
                      >
                        Plan Trip
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =========================
          CULTURE
      ========================= */}

      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div
            className={`grid items-center gap-10 transition-all duration-1000 lg:grid-cols-2 ${
              pageLoaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-10 opacity-0"
            }`}
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Lombok Culture
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Kenali Budaya Lombok
              </h2>

              <p className="mt-5 leading-7 text-gray-500">
                Lombok bukan hanya tentang pantai.
                Temukan budaya Sasak, desa adat,
                kerajinan tradisional dan berbagai
                peninggalan sejarah yang membuat Lombok
                semakin istimewa.
              </p>

              <Link
                href="/planner"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:shadow-lg"
              >
                Buat Rencana Perjalanan
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                ["🏡", "Desa Adat"],
                ["🧵", "Tenun Sasak"],
                ["🥁", "Gendang Beleq"],
                ["🕌", "Sejarah Lombok"],
              ].map(([emoji, title], index) => (
                <div
                  key={title}
                  className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:bg-blue-50 hover:shadow-lg"
                  style={{
                    animationName: pageLoaded
                      ? "fadeUp"
                      : "none",
                    animationDuration: "0.7s",
                    animationTimingFunction:
                      "ease-out",
                    animationFillMode: "forwards",
                    animationDelay: `${
                      300 + index * 100
                    }ms`,
                  }}
                >
                  <div className="text-4xl transition-transform duration-500 hover:scale-125">
                    {emoji}
                  </div>

                  <p className="mt-4 font-bold text-gray-800">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          CULINARY
      ========================= */}

      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div
            className={`text-center transition-all duration-1000 ${
              pageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Taste Lombok
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Kuliner Khas Lombok
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              Lengkapi perjalananmu dengan mencicipi
              berbagai makanan khas Lombok yang kaya
              rasa dan rempah.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                emoji: "🍗",
                name: "Ayam Taliwang",
              },
              {
                emoji: "🥗",
                name: "Plecing Kangkung",
              },
              {
                emoji: "🍢",
                name: "Sate Rembiga",
              },
              {
                emoji: "🍚",
                name: "Nasi Balap Puyung",
              },
            ].map((food, index) => (
              <div
                key={food.name}
                className="rounded-3xl bg-white p-6 text-center shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                style={{
                  animationName: pageLoaded
                    ? "fadeUp"
                    : "none",
                  animationDuration: "0.7s",
                  animationTimingFunction:
                    "ease-out",
                  animationFillMode: "forwards",
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="text-5xl transition-transform duration-500 hover:scale-125">
                  {food.emoji}
                </div>

                <h3 className="mt-4 font-bold text-gray-900">
                  {food.name}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Kuliner khas Lombok
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================
          CTA
      ========================= */}

      <section className="bg-blue-600">
        <div
          className={`mx-auto max-w-7xl px-6 py-16 text-center transition-all duration-1000 lg:px-8 ${
            pageLoaded
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Siap Menjelajahi Lombok?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Buat itinerary perjalanan Lombok sesuai
            tanggal, budget, gaya perjalanan dan
            minatmu.
          </p>

          <Link
            href="/planner"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-blue-600 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl"
          >
            Make a Plan
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* =========================
          MODAL
      ========================= */}

      {selectedDestination && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
          style={{
            animationName: "fadeIn",
            animationDuration: "0.25s",
            animationTimingFunction: "ease-out",
            animationFillMode: "both",
          }}
        >
          <div
            className="relative max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              animationName: "modalEnter",
              animationDuration: "0.35s",
              animationTimingFunction: "ease-out",
              animationFillMode: "both",
            }}
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-xl text-white backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-black/70"
            >
              ✕
            </button>

            <div className="grid max-h-[95vh] overflow-y-auto lg:grid-cols-2">
              {/* MODAL IMAGE */}

              <div className="relative min-h-[350px] bg-gray-100 lg:min-h-[600px]">
                {(images[
                  selectedDestination.id
                ] || [])[modalIndex] ? (
                  <img
                    key={modalIndex}
                    src={
                      images[selectedDestination.id][
                        modalIndex
                      ]
                    }
                    alt={selectedDestination.name}
                    className="h-full w-full object-cover"
                    style={{
                      animationName: "imageFade",
                      animationDuration: "0.45s",
                      animationTimingFunction:
                        "ease-out",
                      animationFillMode: "both",
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-8xl">
                      {selectedDestination.emoji}
                    </span>
                  </div>
                )}

                {/* MODAL CONTROLS */}

                {(images[selectedDestination.id] || [])
                  .length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={previousModalImage}
                      className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={nextModalImage}
                      className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-lg transition-all duration-300 hover:scale-110"
                    >
                      →
                    </button>
                  </>
                )}

                {/* COUNTER */}

                {(images[selectedDestination.id] || [])
                  .length > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                    {modalIndex + 1} /{" "}
                    {images[selectedDestination.id].length}
                  </div>
                )}
              </div>

              {/* MODAL CONTENT */}

              <div className="flex flex-col p-7 lg:p-9">
                <div>
                  <div className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    {selectedDestination.category}
                  </div>

                  <h2 className="mt-4 text-3xl font-bold text-gray-900">
                    {selectedDestination.name}
                  </h2>

                  <p className="mt-3 text-sm text-gray-400">
                    📍 {selectedDestination.location}
                  </p>

                  <p className="mt-6 leading-7 text-gray-500">
                    {selectedDestination.description}
                  </p>
                </div>

                {/* THUMBNAILS */}

                {(images[selectedDestination.id] || [])
                  .length > 1 && (
                  <div className="mt-7">
                    <p className="mb-3 text-sm font-bold text-gray-800">
                      Foto lainnya
                    </p>

                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images[
                        selectedDestination.id
                      ].map((photo, photoIndex) => (
                        <button
                          key={photo}
                          type="button"
                          onClick={() =>
                            setModalIndex(photoIndex)
                          }
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            photoIndex === modalIndex
                              ? "border-blue-600 shadow-lg"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={photo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-8">
                  <Link
                    href={`/planner?destination=${encodeURIComponent(
                      selectedDestination.name
                    )}`}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
                  >
                    Plan Trip to{" "}
                    {selectedDestination.name}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          FOOTER
      ========================= */}

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <Link
                href="/"
                className="text-xl font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                FunTravel
              </Link>

              <p className="mt-1 text-sm text-gray-400">
                Your Lombok Travel Companion
              </p>
            </div>

            <p className="text-sm text-gray-400">
              © 2026 FunTravel. Explore Lombok,
              create unforgettable memories.
            </p>
          </div>
        </div>
      </footer>

      {/* =========================
          CUSTOMER SERVICE
      ========================= */}

      <CustomerService />

      {/* =========================
          ANIMATIONS
      ========================= */}

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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

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

        @keyframes imageFade {
          from {
            opacity: 0;
            transform: scale(1.03);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes modalEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.96);
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