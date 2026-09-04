"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import CustomerService from "../../components/CustomerService";

type User = {
  id: string;
  name: string;
  email: string;
};

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);

  // =========================
  // TRIP BASIC INFORMATION
  // =========================
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("1");

  // =========================
  // FLIGHT
  // =========================
  const [hasFlight, setHasFlight] = useState(true);

  const [arrivalFlight, setArrivalFlight] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const [departureFlight, setDepartureFlight] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  // =========================
  // AIRPORT PICKUP
  // =========================
  const [airportPickup, setAirportPickup] = useState<
    "funtravel" | "own" | ""
  >("");

  // =========================
  // TOUR GUIDE
  // =========================
  const [guideRequired, setGuideRequired] = useState(false);

  // =========================
  // ACCOMMODATION
  // =========================
  const [hotelOption, setHotelOption] = useState<"own" | "later" | "">("");

  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");

  // =========================
  // PREFERENCES
  // =========================
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  // =========================
  // UI
  // =========================
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  // =========================
  // TODAY
  // =========================
  const today = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // =========================
  // DATE FORMAT HELPERS
  // =========================

  // Menampilkan YYYY-MM-DD menjadi DD/MM/YYYY
  const displayDate = (value: string) => {
    if (!value) return "";

    const parts = value.split("-");

    if (parts.length !== 3) return value;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Mengubah DD/MM/YYYY menjadi YYYY-MM-DD
  const convertToISODate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length !== 8) return "";

    const day = cleaned.slice(0, 2);
    const month = cleaned.slice(2, 4);
    const year = cleaned.slice(4, 8);

    return `${year}-${month}-${day}`;
  };

  // Memformat input menjadi DD/MM/YYYY
  const formatDateTyping = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 8);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    }

    return `${numbers.slice(0, 2)}/${numbers.slice(
      2,
      4
    )}/${numbers.slice(4, 8)}`;
  };

  // Validasi apakah tanggal benar-benar valid
  const isValidDate = (value: string) => {
    if (!value) return false;

    const parts = value.split("-");

    if (parts.length !== 3) return false;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!year || !month || !day) return false;

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  // =========================
  // AUTH
  // =========================
  useEffect(() => {
    const loggedIn = localStorage.getItem("funtravel_logged_in");
    const currentUser = localStorage.getItem("funtravel_current_user");

    if (loggedIn !== "true" || !currentUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(currentUser);

      if (!parsedUser?.id || !parsedUser?.email) {
        throw new Error("Invalid user");
      }

      setUser(parsedUser);
      setPageReady(true);
    } catch {
      localStorage.removeItem("funtravel_current_user");
      localStorage.removeItem("funtravel_logged_in");
      router.push("/login");
    }
  }, [router]);

  // =========================
  // DESTINATION FROM URL
  // =========================
  useEffect(() => {
    const destinationFromUrl = searchParams.get("destination");

    if (destinationFromUrl) {
      setDestination(destinationFromUrl);
    }
  }, [searchParams]);

  // =========================
  // ERROR AUTO CLEAR
  // =========================
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 7000);

    return () => clearTimeout(timer);
  }, [error]);

  // =========================
  // INTERESTS
  // =========================
  const interestOptions = [
    "Beach",
    "Nature",
    "Waterfall",
    "Mountains",
    "Culture",
    "Food",
    "Adventure",
    "Relaxation",
    "Photography",
    "Nightlife",
  ];

  const toggleInterest = (interest: string) => {
    setError("");

    setInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      return [...current, interest];
    });
  };

  // =========================
  // LOMBOK VALIDATION
  // =========================
  const lombokKeywords = [
    "lombok",
    "kuta mandalika",
    "kuta",
    "mandalika",
    "tanjung aan",
    "pantai pink",
    "pink beach",
    "tangsi",
    "sembalun",
    "tetebatu",
    "senggigi",
    "gili trawangan",
    "gili air",
    "gili meno",
    "selong belanak",
    "bukit merese",
    "merese",
    "mawun",
    "selong",
    "gerupuk",
    "ekas",
    "jerowaru",
    "sekotong",
    "bangko-bangko",
    "benang kelambu",
    "benang stokel",
    "sendang gile",
    "torean",
    "rinjani",
    "pusuk",
    "narmada",
  ];

  const isLombokDestination = (value: string) => {
    const text = value.toLowerCase().trim();

    return lombokKeywords.some((keyword) => text.includes(keyword));
  };

  // =========================
  // DATE HANDLERS
  // =========================

  const handleStartDateChange = (value: string) => {
    const formatted = formatDateTyping(value);

    setError("");

    // Belum lengkap → tetap simpan agar tahun tidak reset
    if (formatted.length < 10) {
      setStartDate(formatted);
      return;
    }

    const isoDate = convertToISODate(formatted);

    if (!isValidDate(isoDate)) {
      setStartDate(formatted);
      setError("Format tanggal tidak valid. Gunakan DD/MM/YYYY.");
      return;
    }

    if (isoDate < today) {
      setStartDate(formatted);
      setError(
        "Tanggal mulai perjalanan tidak boleh berada di masa lalu."
      );
      return;
    }

    setStartDate(isoDate);

    if (endDate && endDate < isoDate) {
      setEndDate("");
    }

    if (arrivalDate && arrivalDate < isoDate) {
      setArrivalDate("");
    }
  };

  const handleEndDateChange = (value: string) => {
    const formatted = formatDateTyping(value);

    setError("");

    if (formatted.length < 10) {
      setEndDate(formatted);
      return;
    }

    const isoDate = convertToISODate(formatted);

    if (!isValidDate(isoDate)) {
      setEndDate(formatted);
      setError("Format tanggal tidak valid. Gunakan DD/MM/YYYY.");
      return;
    }

    if (startDate && startDate.length === 10 && isoDate < startDate) {
      setEndDate(formatted);
      setError(
        "Tanggal selesai tidak boleh lebih awal dari tanggal mulai perjalanan."
      );
      return;
    }

    setEndDate(isoDate);
  };

  const handleArrivalDateChange = (value: string) => {
    const formatted = formatDateTyping(value);

    setError("");

    if (formatted.length < 10) {
      setArrivalDate(formatted);
      return;
    }

    const isoDate = convertToISODate(formatted);

    if (!isValidDate(isoDate)) {
      setArrivalDate(formatted);
      setError("Format tanggal tidak valid. Gunakan DD/MM/YYYY.");
      return;
    }

    if (startDate && startDate.length === 10 && isoDate < startDate) {
      setArrivalDate(formatted);
      setError(
        "Tanggal kedatangan tidak boleh lebih awal dari tanggal mulai perjalanan."
      );
      return;
    }

    setArrivalDate(isoDate);
  };

  const handleDepartureDateChange = (value: string) => {
    const formatted = formatDateTyping(value);

    setError("");

    if (formatted.length < 10) {
      setDepartureDate(formatted);
      return;
    }

    const isoDate = convertToISODate(formatted);

    if (!isValidDate(isoDate)) {
      setDepartureDate(formatted);
      setError("Format tanggal tidak valid. Gunakan DD/MM/YYYY.");
      return;
    }

    if (
      arrivalDate &&
      arrivalDate.length === 10 &&
      isoDate < arrivalDate
    ) {
      setDepartureDate(formatted);
      setError(
        "Tanggal penerbangan pulang tidak boleh lebih awal dari penerbangan datang."
      );
      return;
    }

    setDepartureDate(isoDate);
  };

  // =========================
  // TRAVELERS
  // =========================
  const handleTravelersChange = (value: string) => {
    setError("");

    if (value === "") {
      setTravelers("");
      return;
    }

    const number = Number(value);

    if (number > 20) {
      setTravelers("20");
      return;
    }

    if (number < 1) {
      setTravelers("1");
      return;
    }

    setTravelers(value);
  };

  // =========================
  // GENERATE TRIP
  // =========================
  const generateTrip = async () => {
    setError("");

    if (!user) {
      setError("Silakan login terlebih dahulu.");
      return;
    }

    // -------------------------
    // DESTINATION
    // -------------------------
    if (!destination.trim()) {
      setError("Silakan masukkan destinasi Lombok.");
      return;
    }

    if (!isLombokDestination(destination)) {
      setError(
        "FunTravel saat ini hanya melayani perjalanan di Lombok. Silakan masukkan destinasi yang berada di Lombok."
      );
      return;
    }

    // -------------------------
    // DATE
    // -------------------------
    if (!startDate) {
      setError("Silakan masukkan tanggal mulai perjalanan.");
      return;
    }

    if (startDate.length !== 10) {
      setError(
        "Tanggal mulai belum lengkap. Gunakan format DD/MM/YYYY."
      );
      return;
    }

    if (!isValidDate(startDate)) {
      setError("Tanggal mulai tidak valid.");
      return;
    }

    if (startDate < today) {
      setError("Tanggal mulai perjalanan tidak boleh berada di masa lalu.");
      return;
    }

    if (!endDate) {
      setError("Silakan masukkan tanggal selesai perjalanan.");
      return;
    }

    if (endDate.length !== 10) {
      setError(
        "Tanggal selesai belum lengkap. Gunakan format DD/MM/YYYY."
      );
      return;
    }

    if (!isValidDate(endDate)) {
      setError("Tanggal selesai tidak valid.");
      return;
    }

    if (endDate < startDate) {
      setError(
        "Tanggal selesai perjalanan tidak boleh lebih awal dari tanggal mulai."
      );
      return;
    }

    // -------------------------
    // TRAVELERS
    // -------------------------
    const travelerNumber = Number(travelers);

    if (!travelers || Number.isNaN(travelerNumber)) {
      setError("Masukkan jumlah traveler.");
      return;
    }

    if (travelerNumber < 1) {
      setError("Jumlah traveler minimal 1 orang.");
      return;
    }

    if (travelerNumber > 20) {
      setError("Jumlah traveler maksimal 20 orang.");
      return;
    }

    // -------------------------
    // FLIGHT
    // -------------------------
    if (hasFlight) {
      if (!arrivalFlight.trim()) {
        setError("Masukkan nomor penerbangan kedatangan.");
        return;
      }

      if (!arrivalDate) {
        setError("Masukkan tanggal penerbangan kedatangan.");
        return;
      }

      if (arrivalDate.length !== 10 || !isValidDate(arrivalDate)) {
        setError("Tanggal penerbangan kedatangan tidak valid.");
        return;
      }

      if (arrivalDate < startDate) {
        setError(
          "Tanggal kedatangan tidak boleh lebih awal dari tanggal mulai perjalanan."
        );
        return;
      }

      if (!arrivalTime) {
        setError("Masukkan waktu penerbangan kedatangan.");
        return;
      }

      if (!departureFlight.trim()) {
        setError("Masukkan nomor penerbangan kepulangan.");
        return;
      }

      if (!departureDate) {
        setError("Masukkan tanggal penerbangan kepulangan.");
        return;
      }

      if (departureDate.length !== 10 || !isValidDate(departureDate)) {
        setError("Tanggal penerbangan kepulangan tidak valid.");
        return;
      }

      if (departureDate < arrivalDate) {
        setError(
          "Tanggal penerbangan kepulangan tidak boleh lebih awal dari penerbangan datang."
        );
        return;
      }

      if (!departureTime) {
        setError("Masukkan waktu penerbangan kepulangan.");
        return;
      }
    }

    // -------------------------
    // AIRPORT PICKUP
    // -------------------------
    if (!airportPickup) {
      setError("Silakan pilih pengaturan transportasi bandara.");
      return;
    }

    // -------------------------
    // ACCOMMODATION
    // -------------------------
    if (!hotelOption) {
      setError("Silakan pilih pengaturan hotel.");
      return;
    }

    if (hotelOption === "own" && !hotelName.trim()) {
      setError("Masukkan nama hotel yang sudah kamu booking.");
      return;
    }

    // -------------------------
    // START GENERATING
    // -------------------------
    setGenerating(true);

    try {
      const params = new URLSearchParams();

      // USER
      params.set("userId", user.id);
      params.set("userEmail", user.email);
      params.set("userName", user.name);

      // DESTINATION
      params.set("destination", destination.trim());
      params.set("destinationRegion", "Lombok");

      // TRIP
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      params.set("travelers", travelers);

      // FLIGHT
      params.set("hasFlight", String(hasFlight));

      if (hasFlight) {
        params.set("arrivalFlight", arrivalFlight.trim());
        params.set("arrivalDate", arrivalDate);
        params.set("arrivalTime", arrivalTime);

        params.set("departureFlight", departureFlight.trim());
        params.set("departureDate", departureDate);
        params.set("departureTime", departureTime);
      } else {
        params.set("arrivalFlight", "");
        params.set("arrivalDate", "");
        params.set("arrivalTime", "");

        params.set("departureFlight", "");
        params.set("departureDate", "");
        params.set("departureTime", "");
      }

      // AIRPORT PICKUP
      params.set("airportPickup", airportPickup);

      // TOUR GUIDE
      params.set("guideRequired", String(guideRequired));

      // ACCOMMODATION
      params.set("accommodationType", hotelOption);

      if (hotelOption === "own") {
        params.set("hotelName", hotelName.trim());
        params.set("hotelAddress", hotelAddress.trim());
        params.set("bookingNumber", bookingNumber.trim());
      } else {
        params.set("hotelName", "");
        params.set("hotelAddress", "");
        params.set("bookingNumber", "");
      }

      // PREFERENCES
      params.set("budget", budget);
      params.set("interests", interests.join(","));
      params.set("travelStyle", travelStyle);
      params.set("specialRequest", specialRequest.trim());

      // DRIVER
      params.set("driverId", "");
      params.set("driverName", "");
      params.set("driverPhoto", "");
      params.set("driverPhone", "");
      params.set("driverWhatsapp", "");
      params.set("driverRating", "");
      params.set("vehicle", "");
      params.set("plateNumber", "");
      params.set("meetingPoint", "");

      // GUIDE
      params.set("guideId", "");
      params.set("guideName", "");
      params.set("guidePhone", "");
      params.set("guideWhatsapp", "");

      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push(`/trip?${params.toString()}`);
    } catch {
      setGenerating(false);
      setError("Terjadi kesalahan saat membuat perjalanan.");
    }
  };

  if (!pageReady && !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Preparing your Lombok planner...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}
        <div className="mb-10 animate-[fadeIn_0.5s_ease-out]">
          <Link
            href="/dashboard"
            className="mb-5 inline-flex items-center text-sm font-medium text-blue-600 transition hover:translate-x-[-2px] hover:text-blue-700"
          >
            ← Back to Dashboard
          </Link>

          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 p-7 text-white shadow-xl sm:p-8">
            <div className="max-w-3xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                FunTravel Lombok
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Plan Your Lombok Trip
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Kamu tinggal berangkat. Urusan perjalanan, biar kami yang
                atur. Masukkan rencana perjalananmu dan kami bantu
                menyiapkannya.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  📍 Lombok Only
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  ✈️ Flight
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  🚗 Airport Pickup
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  🧑‍🏫 Tour Guide
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1.5">
                  🏨 Accommodation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* 1. DESTINATION */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              1
            </div>

            <div>
              <h2 className="text-xl font-bold">Where are you going?</h2>

              <p className="mt-1 text-sm text-slate-500">
                Ketik destinasi yang ingin kamu kunjungi di Lombok.
              </p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Destination
          </label>

          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setError("");
            }}
            placeholder="Contoh: Kuta Mandalika, Pantai Pink, Sembalun..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />

          <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            <strong>📍 Lombok only</strong>

            <p className="mt-1 text-blue-700">
              FunTravel saat ini fokus melayani perjalanan di Lombok saja.
            </p>
          </div>
        </section>

        {/* ========================= */}
        {/* 2. DATE & TRAVELERS */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              2
            </div>

            <div>
              <h2 className="text-xl font-bold">When are you traveling?</h2>

              <p className="mt-1 text-sm text-slate-500">
                Tentukan tanggal dan jumlah orang yang ikut perjalanan.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* START DATE */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Start Date
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={displayDate(startDate)}
                onChange={(e) => handleStartDateChange(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Masukkan tanggal dengan format DD/MM/YYYY.
              </p>
            </div>

            {/* END DATE */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                End Date
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={displayDate(endDate)}
                onChange={(e) => handleEndDateChange(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Tidak boleh sebelum tanggal mulai.
              </p>
            </div>

            {/* TRAVELERS */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Travelers
              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => handleTravelersChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Maksimal 20 traveler.
              </p>
            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* 3. FLIGHT */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              3
            </div>

            <div>
              <h2 className="text-xl font-bold">Flight Information</h2>

              <p className="mt-1 text-sm text-slate-500">
                Beri tahu kami detail penerbanganmu agar perjalanan bisa
                dipersiapkan dengan baik.
              </p>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={hasFlight}
              onChange={(e) => {
                setHasFlight(e.target.checked);
                setError("");
              }}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />

            <span className="font-medium">
              I already have my flight information
            </span>
          </label>

          {hasFlight && (
            <div className="mt-6 space-y-6">
              {/* ARRIVAL */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900">
                    ✈️ Arrival Flight
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Arrival
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Flight Number
                    </label>

                    <input
                      type="text"
                      value={arrivalFlight}
                      onChange={(e) => {
                        setArrivalFlight(e.target.value.toUpperCase());
                        setError("");
                      }}
                      placeholder="Contoh: QZ123"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Arrival Date
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={10}
                      value={displayDate(arrivalDate)}
                      onChange={(e) =>
                        handleArrivalDateChange(e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Arrival Time
                    </label>

                    <input
                      type="time"
                      value={arrivalTime}
                      onChange={(e) => {
                        setArrivalTime(e.target.value);
                        setError("");
                      }}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* DEPARTURE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900">
                    🛫 Departure Flight
                  </h3>

                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                    Departure
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Flight Number
                    </label>

                    <input
                      type="text"
                      value={departureFlight}
                      onChange={(e) => {
                        setDepartureFlight(e.target.value.toUpperCase());
                        setError("");
                      }}
                      placeholder="Contoh: QZ456"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Departure Date
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={10}
                      value={displayDate(departureDate)}
                      onChange={(e) =>
                        handleDepartureDateChange(e.target.value)
                      }
                      placeholder="DD/MM/YYYY"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Departure Time
                    </label>

                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => {
                        setDepartureTime(e.target.value);
                        setError("");
                      }}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!hasFlight && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
              <strong>✈️ Flight belum ditentukan</strong>

              <p className="mt-1">
                Tidak masalah. Kamu bisa menambahkan informasi penerbangan
                nanti setelah tiket sudah tersedia.
              </p>
            </div>
          )}
        </section>

        {/* ========================= */}
        {/* 4. AIRPORT PICKUP */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              4
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Airport Transportation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Bagaimana kamu ingin menuju hotel dari bandara?
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setAirportPickup("funtravel");
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                airportPickup === "funtravel"
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🚗</div>

              <h3 className="font-bold">
                Arrange My Airport Pickup
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                FunTravel akan membantu mengatur penjemputanmu di Bandara
                Internasional Lombok.
              </p>

              {airportPickup === "funtravel" && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAirportPickup("own");
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                airportPickup === "own"
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🚕</div>

              <h3 className="font-bold">
                I&apos;ll Arrange My Own Transportation
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu mengatur sendiri transportasi dari dan menuju bandara.
              </p>

              {airportPickup === "own" && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>
          </div>

          {airportPickup === "funtravel" && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
              <strong>🚗 FunTravel Airport Pickup</strong>

              <p className="mt-1 leading-6">
                Setelah perjalanan dibuat, request penjemputan akan otomatis
                dikirim kepada driver FunTravel yang sudah disetujui. Driver
                dapat menerima atau menolak request tersebut.
              </p>
            </div>
          )}
        </section>

        {/* ========================= */}
        {/* 5. TOUR GUIDE */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              5
            </div>

            <div>
              <h2 className="text-xl font-bold">Tour Guide</h2>

              <p className="mt-1 text-sm text-slate-500">
                Apakah kamu membutuhkan Tour Guide selama perjalanan di
                Lombok?
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setGuideRequired(true);
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                guideRequired
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🧑‍🏫</div>

              <h3 className="font-bold">I Need a Tour Guide</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Saya ingin ditemani Tour Guide FunTravel selama perjalanan
                di Lombok.
              </p>

              {guideRequired && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setGuideRequired(false);
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                !guideRequired
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🗺️</div>

              <h3 className="font-bold">
                I Don&apos;t Need a Tour Guide
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Saya akan menjelajahi Lombok sendiri tanpa Tour Guide
                FunTravel.
              </p>

              {!guideRequired && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>
          </div>

          {guideRequired && (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
              <strong>🧑‍🏫 Tour Guide Request</strong>

              <p className="mt-1 leading-6">
                Setelah perjalanan dibuat, request Tour Guide akan otomatis
                dikirim kepada Guide FunTravel yang sudah disetujui. Guide
                dapat menerima atau menolak request tersebut.
              </p>
            </div>
          )}
        </section>

        {/* ========================= */}
        {/* 6. ACCOMMODATION */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              6
            </div>

            <div>
              <h2 className="text-xl font-bold">Accommodation</h2>

              <p className="mt-1 text-sm text-slate-500">
                Untuk hotel, kamu bebas mengatur sendiri sesuai kebutuhanmu.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setHotelOption("own");
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                hotelOption === "own"
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🏨</div>

              <h3 className="font-bold">
                I Already Booked My Hotel
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Saya sudah mempunyai booking hotel sendiri.
              </p>

              {hotelOption === "own" && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setHotelOption("later");
                setError("");
              }}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                hotelOption === "later"
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
            >
              <div className="mb-2 text-3xl">🗓️</div>

              <h3 className="font-bold">
                I&apos;ll Arrange My Hotel Later
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Saya akan menentukan hotel sendiri nanti.
              </p>

              {hotelOption === "later" && (
                <div className="mt-3 font-semibold text-blue-600">
                  ✓ Selected
                </div>
              )}
            </button>
          </div>

          {hotelOption === "own" && (
            <div className="mt-6 space-y-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Hotel Name *
                </label>

                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => {
                    setHotelName(e.target.value);
                    setError("");
                  }}
                  placeholder="Contoh: Novotel Lombok Resort"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Hotel Address
                </label>

                <textarea
                  value={hotelAddress}
                  onChange={(e) => {
                    setHotelAddress(e.target.value);
                    setError("");
                  }}
                  placeholder="Masukkan alamat hotel..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Booking Number
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={bookingNumber}
                  onChange={(e) => {
                    setBookingNumber(e.target.value);
                    setError("");
                  }}
                  placeholder="Contoh: ABC123456"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          {hotelOption === "later" && (
            <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">
              <strong>🏨 Hotel belum ditentukan</strong>

              <p className="mt-1 leading-6">
                Tidak masalah. Kamu bisa menentukan hotel sendiri nanti.
                Informasi hotel dapat ditambahkan ke perjalanan setelah
                booking.
              </p>
            </div>
          )}
        </section>

        {/* ========================= */}
        {/* 7. PREFERENCES */}
        {/* ========================= */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md sm:p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              7
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Your Travel Preferences
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Bantu kami memahami perjalanan seperti apa yang kamu
                inginkan.
              </p>
            </div>
          </div>

          {/* BUDGET */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Estimated Budget
            </label>

            <select
              value={budget}
              onChange={(e) => {
                setBudget(e.target.value);
                setError("");
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select your budget</option>

              <option value="under-2m">Under Rp 2.000.000</option>

              <option value="2m-5m">
                Rp 2.000.000 - Rp 5.000.000
              </option>

              <option value="5m-10m">
                Rp 5.000.000 - Rp 10.000.000
              </option>

              <option value="10m-20m">
                Rp 10.000.000 - Rp 20.000.000
              </option>

              <option value="above-20m">
                Above Rp 20.000.000
              </option>

              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* INTERESTS */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold">
              What are you interested in?
            </label>

            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const selected = interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {selected ? "✓ " : ""}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRAVEL STYLE */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold">
              Travel Style
            </label>

            <select
              value={travelStyle}
              onChange={(e) => {
                setTravelStyle(e.target.value);
                setError("");
              }}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Select your travel style</option>

              <option value="relaxed">Relaxed &amp; Slow</option>

              <option value="balanced">Balanced</option>

              <option value="adventure">Adventure</option>

              <option value="luxury">Luxury</option>

              <option value="budget">Budget Friendly</option>

              <option value="family">Family Trip</option>

              <option value="couple">Couple Trip</option>

              <option value="solo">Solo Travel</option>
            </select>
          </div>

          {/* SPECIAL REQUEST */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Special Requests
            </label>

            <textarea
              value={specialRequest}
              onChange={(e) => {
                setSpecialRequest(e.target.value);
                setError("");
              }}
              placeholder="Contoh: Saya ingin lebih banyak waktu di pantai, membutuhkan child seat, atau memiliki kebutuhan khusus lainnya..."
              rows={5}
              className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3.5 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>

              <div>
                <p className="font-bold">
                  Please check your information
                </p>

                <p className="mt-1 leading-6">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================= */}
        {/* SUBMIT */}
        {/* ========================= */}
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="rounded-2xl bg-slate-50 p-5">
            <h3 className="font-bold">
              Ready to plan your Lombok trip?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Setelah kamu membuat perjalanan, detail perjalanan akan
              ditampilkan di halaman My Trip. Jika kamu memilih airport
              pickup dari FunTravel, request driver akan dikirim otomatis
              kepada driver yang sudah disetujui. Jika kamu membutuhkan Tour
              Guide, request Guide juga akan dikirim otomatis kepada Guide
              yang sudah disetujui. Driver dan Guide masing-masing dapat
              menerima atau menolak request mereka.
            </p>
          </div>

          <button
            type="button"
            onClick={generateTrip}
            disabled={generating}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Creating Your Trip...
              </>
            ) : (
              <>Create My Lombok Trip →</>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-400">
            Your trip will be created specifically for Lombok, Indonesia.
          </p>
        </section>
      </div>

      {/* ========================= */}
      {/* CUSTOMER SERVICE */}
      {/* ========================= */}
      <CustomerService />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
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

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading planner...
            </p>
          </div>
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}