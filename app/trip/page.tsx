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

type RequestStatus = "pending" | "accepted" | "declined";

type PartnerRequest = {
  partnerId: string;
  status: RequestStatus;
  respondedAt?: string;
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

  hasFlight?: string;

  arrivalFlight?: string;
  arrivalDate?: string;
  arrivalTime?: string;

  departureFlight?: string;
  departureDate?: string;
  departureTime?: string;

  airportPickup?: string;

  accommodationType?: string;
  hotelName?: string;
  hotelAddress?: string;
  bookingNumber?: string;

  guideRequired?: boolean;

  driverRequests?: PartnerRequest[];
  guideRequests?: PartnerRequest[];

  driverId?: string;
  driverName?: string;
  driverPhoto?: string;
  driverPhone?: string;
  driverWhatsapp?: string;
  driverRating?: string;
  vehicle?: string;
  plateNumber?: string;
  meetingPoint?: string;

  driverStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Guest picked up"
    | "Completed";

  guideId?: string;

  guideStatus?:
    | "pending"
    | "accepted"
    | "declined"
    | "Assigned"
    | "On the way"
    | "Arrived"
    | "Tour started"
    | "Completed";
};

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

type Guide = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  whatsapp: string;
  address: string;
  experience: string;
  languages: string;
  specialties: string;
  areas: string;
  status: "pending" | "approved" | "rejected";
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

  const tripId = searchParams.get("tripId") || "";

  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const [destinationPhoto, setDestinationPhoto] =
    useState<DestinationPhoto | null>(null);

  const [dayPhotos, setDayPhotos] = useState<DayPhotos>({});

  const [activeGallery, setActiveGallery] = useState<DestinationPhoto[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // =========================================================
  // ASSIGNED DRIVER & GUIDE
  // =========================================================

  const [assignedDriver, setAssignedDriver] =
    useState<Driver | null>(null);

  const [assignedGuide, setAssignedGuide] =
    useState<Guide | null>(null);

  const [currentDriverStatus, setCurrentDriverStatus] =
    useState<Trip["driverStatus"]>();

  const [currentGuideStatus, setCurrentGuideStatus] =
    useState<Trip["guideStatus"]>();

  // =========================================================
  // READ URL DATA
  // =========================================================

  const destination =
    searchParams.get("destination") || "Lombok, Indonesia";

  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  const travelers = searchParams.get("travelers") || "1";
  const budget = searchParams.get("budget") || "";
  const interests = searchParams.get("interests") || "";
  const travelStyle = searchParams.get("travelStyle") || "";
  const specialRequest = searchParams.get("specialRequest") || "";

  const hasFlight = searchParams.get("hasFlight") === "true";

  const arrivalFlight = searchParams.get("arrivalFlight") || "";
  const arrivalDate = searchParams.get("arrivalDate") || "";
  const arrivalTime = searchParams.get("arrivalTime") || "";

  const departureFlight = searchParams.get("departureFlight") || "";
  const departureDate = searchParams.get("departureDate") || "";
  const departureTime = searchParams.get("departureTime") || "";

  const airportPickup = searchParams.get("airportPickup") || "";

  const accommodationType =
    searchParams.get("accommodationType") || "";

  const hotelName = searchParams.get("hotelName") || "";
  const hotelAddress = searchParams.get("hotelAddress") || "";
  const bookingNumber = searchParams.get("bookingNumber") || "";

  const guideRequired =
    searchParams.get("guideRequired") === "true" ||
    searchParams.get("needsGuide") === "true" ||
    searchParams.get("guide") === "true";

  const driverId = searchParams.get("driverId") || "";
  const driverName = searchParams.get("driverName") || "";
  const driverPhoto = searchParams.get("driverPhoto") || "";
  const driverPhone = searchParams.get("driverPhone") || "";
  const driverWhatsapp = searchParams.get("driverWhatsapp") || "";
  const driverRating = searchParams.get("driverRating") || "";
  const vehicle = searchParams.get("vehicle") || "";
  const plateNumber = searchParams.get("plateNumber") || "";
  const meetingPoint = searchParams.get("meetingPoint") || "";

  // =========================================================
  // AUTH
  // =========================================================

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
      setLoading(false);
    } catch {
      localStorage.removeItem("funtravel_logged_in");
      localStorage.removeItem("funtravel_current_user");
      router.push("/login");
    }
  }, [router]);

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const formatDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    const difference = end.getTime() - start.getTime();

    return Math.max(
      1,
      Math.ceil(difference / (1000 * 60 * 60 * 24)) + 1
    );
  }, [startDate, endDate]);

  // =========================================================
  // SAVE TRIP + AUTOMATIC PARTNER REQUESTS
  // =========================================================

  useEffect(() => {
    if (!user) return;

    const currentTripId =
      tripId ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const stored = localStorage.getItem("funtravel_trips");

      let trips: Trip[] = [];

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          trips = parsed;
        }
      }

      const existingIndex = trips.findIndex(
        (item) => item.id === currentTripId
      );

      const existingTrip =
        existingIndex >= 0 ? trips[existingIndex] : undefined;

      // =====================================================
      // LOAD APPROVED DRIVERS
      // =====================================================

      let approvedDrivers: Driver[] = [];

      try {
        const storedDrivers =
          localStorage.getItem("funtravel_drivers");

        if (storedDrivers) {
          const parsedDrivers = JSON.parse(storedDrivers);

          if (Array.isArray(parsedDrivers)) {
            approvedDrivers = parsedDrivers.filter(
              (driver: Driver) =>
                driver.status === "approved"
            );
          }
        }
      } catch {
        approvedDrivers = [];
      }

      // =====================================================
      // LOAD APPROVED GUIDES
      // =====================================================

      let approvedGuides: Guide[] = [];

      try {
        const storedGuides =
          localStorage.getItem("funtravel_guides");

        if (storedGuides) {
          const parsedGuides = JSON.parse(storedGuides);

          if (Array.isArray(parsedGuides)) {
            approvedGuides = parsedGuides.filter(
              (guide: Guide) =>
                guide.status === "approved"
            );
          }
        }
      } catch {
        approvedGuides = [];
      }

      // =====================================================
      // DRIVER REQUESTS
      // =====================================================

      let driverRequests: PartnerRequest[] =
        existingTrip?.driverRequests || [];

      if (airportPickup === "funtravel") {
        const existingDriverIds = new Set(
          driverRequests.map(
            (request) => request.partnerId
          )
        );

        const newDriverRequests =
          approvedDrivers
            .filter(
              (driver) =>
                !existingDriverIds.has(driver.id)
            )
            .map((driver) => ({
              partnerId: driver.id,
              status: "pending" as RequestStatus,
            }));

        driverRequests = [
          ...driverRequests,
          ...newDriverRequests,
        ];
      } else {
        driverRequests = [];
      }

      // =====================================================
      // GUIDE REQUESTS
      // =====================================================

      let guideRequests: PartnerRequest[] =
        existingTrip?.guideRequests || [];

      if (guideRequired) {
        const existingGuideIds = new Set(
          guideRequests.map(
            (request) => request.partnerId
          )
        );

        const newGuideRequests =
          approvedGuides
            .filter(
              (guide) =>
                !existingGuideIds.has(guide.id)
            )
            .map((guide) => ({
              partnerId: guide.id,
              status: "pending" as RequestStatus,
            }));

        guideRequests = [
          ...guideRequests,
          ...newGuideRequests,
        ];
      } else {
        guideRequests = [];
      }

      // =====================================================
      // PRESERVE EXISTING PARTNER DATA
      // =====================================================

      const trip: Trip = {
        ...(existingTrip || {}),

        id: currentTripId,

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
          existingTrip?.createdAt ||
          new Date().toISOString(),

        hasFlight: String(hasFlight),

        arrivalFlight,
        arrivalDate,
        arrivalTime,

        departureFlight,
        departureDate,
        departureTime,

        airportPickup,

        accommodationType,
        hotelName,
        hotelAddress,
        bookingNumber,

        guideRequired,

        driverRequests,
        guideRequests,

        driverId:
          existingTrip?.driverId || driverId || undefined,

        driverName:
          existingTrip?.driverName || driverName || undefined,

        driverPhoto:
          existingTrip?.driverPhoto || driverPhoto || undefined,

        driverPhone:
          existingTrip?.driverPhone || driverPhone || undefined,

        driverWhatsapp:
          existingTrip?.driverWhatsapp ||
          driverWhatsapp ||
          undefined,

        driverRating:
          existingTrip?.driverRating ||
          driverRating ||
          undefined,

        vehicle:
          existingTrip?.vehicle || vehicle || undefined,

        plateNumber:
          existingTrip?.plateNumber ||
          plateNumber ||
          undefined,

        meetingPoint:
          existingTrip?.meetingPoint ||
          meetingPoint ||
          undefined,

        driverStatus:
          existingTrip?.driverStatus ||
          (airportPickup === "funtravel"
            ? "pending"
            : undefined),

        guideId:
          existingTrip?.guideId || undefined,

        guideStatus:
          existingTrip?.guideStatus ||
          (guideRequired ? "pending" : undefined),
      };

      if (existingIndex >= 0) {
        trips[existingIndex] = trip;
      } else {
        trips.push(trip);
      }

      localStorage.setItem(
        "funtravel_trips",
        JSON.stringify(trips)
      );

      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [
    user,
    tripId,
    destination,
    startDate,
    endDate,
    travelers,
    budget,
    interests,
    travelStyle,
    specialRequest,
    hasFlight,
    arrivalFlight,
    arrivalDate,
    arrivalTime,
    departureFlight,
    departureDate,
    departureTime,
    airportPickup,
    accommodationType,
    hotelName,
    hotelAddress,
    bookingNumber,
    guideRequired,
    driverId,
    driverName,
    driverPhoto,
    driverPhone,
    driverWhatsapp,
    driverRating,
    vehicle,
    plateNumber,
    meetingPoint,
  ]);

  // =========================================================
  // LOAD ASSIGNED DRIVER & GUIDE DETAILS
  // =========================================================

  useEffect(() => {
    if (!user) return;

    const loadAssignedPartners = () => {
      try {
        const storedTrips =
          localStorage.getItem("funtravel_trips");

        if (!storedTrips) {
          setAssignedDriver(null);
          setAssignedGuide(null);
          return;
        }

        const trips: Trip[] = JSON.parse(storedTrips);

        if (!Array.isArray(trips)) {
          return;
        }

        let currentTrip: Trip | undefined;

        // Prioritas pertama: tripId
        if (tripId) {
          currentTrip = trips.find(
            (trip) => trip.id === tripId
          );
        }

        // Fallback jika tripId tidak tersedia
        if (!currentTrip) {
          currentTrip = trips.find(
            (trip) =>
              trip.userEmail === user.email &&
              trip.destination === destination &&
              trip.startDate === startDate &&
              trip.endDate === endDate
          );
        }

        if (!currentTrip) {
          setAssignedDriver(null);
          setAssignedGuide(null);
          return;
        }

        // ===================================================
        // DRIVER STATUS
        // ===================================================

        setCurrentDriverStatus(
          currentTrip.driverStatus
        );

        // ===================================================
        // FIND ASSIGNED DRIVER
        // ===================================================

        if (currentTrip.driverId) {
          const storedDrivers =
            localStorage.getItem("funtravel_drivers");

          if (storedDrivers) {
            const drivers: Driver[] =
              JSON.parse(storedDrivers);

            if (Array.isArray(drivers)) {
              const driver = drivers.find(
                (item) =>
                  item.id === currentTrip?.driverId &&
                  item.status === "approved"
              );

              setAssignedDriver(driver || null);
            }
          }
        } else {
          setAssignedDriver(null);
        }

        // ===================================================
        // GUIDE STATUS
        // ===================================================

        setCurrentGuideStatus(
          currentTrip.guideStatus
        );

        // ===================================================
        // FIND ASSIGNED GUIDE
        // ===================================================

        if (currentTrip.guideId) {
          const storedGuides =
            localStorage.getItem("funtravel_guides");

          if (storedGuides) {
            const guides: Guide[] =
              JSON.parse(storedGuides);

            if (Array.isArray(guides)) {
              const guide = guides.find(
                (item) =>
                  item.id === currentTrip?.guideId &&
                  item.status === "approved"
              );

              setAssignedGuide(guide || null);
            }
          }
        } else {
          setAssignedGuide(null);
        }
      } catch {
        setAssignedDriver(null);
        setAssignedGuide(null);
      }
    };

    loadAssignedPartners();

    // Refresh otomatis supaya perubahan Accept/Decline
    // dari Driver atau Guide segera terlihat.
    const interval = setInterval(
      loadAssignedPartners,
      2000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    user,
    tripId,
    destination,
    startDate,
    endDate,
  ]);

  // =========================================================
  // WIKIMEDIA IMAGE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadMainPhoto = async () => {
      try {
        const query = encodeURIComponent(
          `${destination} Lombok Indonesia`
        );

        const response = await fetch(
          `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url&iiurlwidth=1400&format=json&origin=*`
        );

        if (!response.ok) return;

        const data = await response.json();

        const pages = data?.query?.pages
          ? Object.values(data.query.pages)
          : [];

        const first = pages[0] as any;

        const url =
          first?.imageinfo?.[0]?.thumburl ||
          first?.imageinfo?.[0]?.url;

        if (!cancelled && url) {
          setDestinationPhoto({
            url,
            title:
              first.title?.replace("File:", "") ||
              destination,
          });
        }
      } catch {
        // Ignore image errors.
      }
    };

    loadMainPhoto();

    return () => {
      cancelled = true;
    };
  }, [destination]);

  // =========================================================
  // DAY PLANS
  // =========================================================

  const dayPlans = useMemo<DayPlan[]>(() => {
    const plans: DayPlan[] = [];

    for (let day = 1; day <= totalDays; day++) {
      if (day === 1) {
        plans.push({
          title: "Arrival & Lombok Introduction",
          morning:
            "Arrive in Lombok and complete your airport arrival process.",
          afternoon:
            "Transfer to your accommodation and take some time to relax.",
          evening:
            "Enjoy your first evening in Lombok and explore the local area.",
          photoQuery: `${destination} Lombok beach`,
        });
      } else if (day === totalDays && totalDays > 1) {
        plans.push({
          title: "Relax & Departure",
          morning:
            "Enjoy a relaxed morning and prepare your belongings.",
          afternoon:
            "Check out and continue your final Lombok activities if time allows.",
          evening:
            "Head to Lombok International Airport for your departure.",
          photoQuery: `${destination} Lombok Indonesia`,
        });
      } else {
        plans.push({
          title: `Explore Lombok — Day ${day}`,
          morning:
            "Start your day with breakfast and continue exploring Lombok.",
          afternoon:
            "Enjoy your selected activities, nature, beaches, culture or adventure.",
          evening:
            "Relax and enjoy the evening before returning to your accommodation.",
          photoQuery: `${destination} Lombok Indonesia`,
        });
      }
    }

    return plans;
  }, [totalDays, destination]);

  // =========================================================
  // LOAD DAY PHOTOS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadPhotos = async () => {
      const result: DayPhotos = {};

      for (let index = 0; index < dayPlans.length; index++) {
        const day = index + 1;
        const plan = dayPlans[index];

        try {
          const query = encodeURIComponent(
            plan.photoQuery
          );

          const response = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`
          );

          if (!response.ok) continue;

          const data = await response.json();

          const pages = data?.query?.pages
            ? Object.values(data.query.pages)
            : [];

          result[day] = pages
            .map((page: any) => {
              const info = page?.imageinfo?.[0];

              const url =
                info?.thumburl || info?.url;

              if (!url) return null;

              return {
                url,
                title:
                  page.title?.replace("File:", "") ||
                  destination,
              };
            })
            .filter(Boolean)
            .slice(0, 5) as DestinationPhoto[];
        } catch {
          // Ignore individual image errors.
        }
      }

      if (!cancelled) {
        setDayPhotos(result);
      }
    };

    loadPhotos();

    return () => {
      cancelled = true;
    };
  }, [dayPlans, destination]);

  // =========================================================
  // BUDGET
  // =========================================================

  const budgetAmount = useMemo<BudgetAmount>(() => {
    const people = Math.max(
      1,
      Number(travelers) || 1
    );

    const days = Math.max(1, totalDays);

    if (budget === "under-2m") {
      return {
        accommodation:
          250000 * days * people,
        food:
          150000 * days * people,
        transportation:
          100000 * days,
        activities:
          100000 * days * people,
      };
    }

    if (budget === "above-20m") {
      return {
        accommodation:
          1500000 * days * people,
        food:
          500000 * days * people,
        transportation:
          400000 * days,
        activities:
          500000 * days * people,
      };
    }

    return {
      accommodation:
        600000 * days * people,
      food:
        250000 * days * people,
      transportation:
        200000 * days,
      activities:
        250000 * days * people,
    };
  }, [budget, travelers, totalDays]);

  const totalBudget =
    budgetAmount.accommodation +
    budgetAmount.food +
    budgetAmount.transportation +
    budgetAmount.activities;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // =========================================================
  // LABEL HELPERS
  // =========================================================

  const budgetLabel = () => {
    const labels: Record<string, string> = {
      "under-2m": "Under Rp 2.000.000",
      "2m-5m": "Rp 2.000.000 - Rp 5.000.000",
      "5m-10m": "Rp 5.000.000 - Rp 10.000.000",
      "10m-20m": "Rp 10.000.000 - Rp 20.000.000",
      "above-20m": "Above Rp 20.000.000",
      flexible: "Flexible",
    };

    return labels[budget] || "Not specified";
  };

  const travelStyleLabel = () => {
    const labels: Record<string, string> = {
      relaxed: "Relaxed & Slow",
      balanced: "Balanced",
      adventure: "Adventure",
      luxury: "Luxury",
      budget: "Budget Friendly",
      family: "Family Trip",
      couple: "Couple Trip",
      solo: "Solo Travel",
    };

    return labels[travelStyle] || "Not specified";
  };

  const interestList = interests
    ? interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  // =========================================================
  // GALLERY
  // =========================================================

  const openGallery = (
    photos: DestinationPhoto[],
    index = 0
  ) => {
    if (!photos.length) return;

    setActiveGallery(photos);
    setActivePhotoIndex(index);
    setGalleryOpen(true);
  };

  const nextPhoto = () => {
    if (!activeGallery.length) return;

    setActivePhotoIndex((current) =>
      current === activeGallery.length - 1
        ? 0
        : current + 1
    );
  };

  const previousPhoto = () => {
    if (!activeGallery.length) return;

    setActivePhotoIndex((current) =>
      current === 0
        ? activeGallery.length - 1
        : current - 1
    );
  };

  useEffect(() => {
    if (!galleryOpen) return;

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setGalleryOpen(false);
      }

      if (event.key === "ArrowRight") {
        nextPhoto();
      }

      if (event.key === "ArrowLeft") {
        previousPhoto();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [galleryOpen, activeGallery.length]);

  // =========================================================
  // DELETE
  // =========================================================

  const deleteTrip = () => {
    try {
      const stored =
        localStorage.getItem("funtravel_trips");

      if (stored) {
        const trips: Trip[] = JSON.parse(stored);

        const filtered = trips.filter((trip) => {
          if (tripId) {
            return trip.id !== tripId;
          }

          return !(
            trip.userEmail === user?.email &&
            trip.destination === destination &&
            trip.startDate === startDate &&
            trip.endDate === endDate
          );
        });

        localStorage.setItem(
          "funtravel_trips",
          JSON.stringify(filtered)
        );
      }
    } catch {
      // Ignore localStorage errors.
    }

    router.push("/trips");
  };

  // =========================================================
  // PRINT
  // =========================================================

  const printTrip = () => {
    window.print();
  };

  // =========================================================
  // DRIVER / GUIDE STATUS
  // =========================================================

  const driverAssigned = Boolean(
    assignedDriver || driverName || driverId
  );

  const guideAssigned = Boolean(
    assignedGuide ||
      searchParams.get("guideId")
  );

  // =========================================================
  // STATUS LABELS
  // =========================================================

  const getDriverStatusLabel = () => {
    if (!currentDriverStatus) {
      return driverAssigned
        ? "Assigned"
        : "Waiting for driver";
    }

    if (currentDriverStatus === "accepted") {
      return "Accepted";
    }

    return currentDriverStatus;
  };

  const getGuideStatusLabel = () => {
    if (!currentGuideStatus) {
      return guideAssigned
        ? "Assigned"
        : "Waiting for guide";
    }

    if (currentGuideStatus === "accepted") {
      return "Accepted";
    }

    return currentGuideStatus;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Loading your Lombok trip...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================= */}
        {/* TOP */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/trips"
            className="inline-flex items-center font-medium text-blue-600 transition hover:text-blue-700"
          >
            ← My Trips
          </Link>

          <div className="flex gap-2">
            <button
              onClick={printTrip}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
            >
              🖨️ Print
            </button>

            <button
              onClick={() =>
                setShowDeleteModal(true)
              }
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <div className="relative h-[300px] sm:h-[380px]">
            {destinationPhoto ? (
              <img
                src={destinationPhoto.url}
                alt={destination}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-700 to-cyan-600 text-7xl">
                🏝️
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <div className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
                🇮🇩 LOMBOK
              </div>

              <h1 className="text-3xl font-bold sm:text-5xl">
                Your Personalized Trip
              </h1>

              <p className="mt-2 text-lg text-white/90">
                {destination}
              </p>

              <p className="mt-2 text-sm text-white/75">
                {formatShortDate(startDate)} —{" "}
                {formatShortDate(endDate)}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* SAVE STATUS */}
        {/* ================================================= */}

        {saved && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 print:hidden">
            <strong>
              ✓ Trip saved successfully.
            </strong>{" "}
            This Lombok trip is now available in your
            My Trips page.
          </div>
        )}

        {/* ================================================= */}
        {/* OVERVIEW */}
        {/* ================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">
              📅
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Duration
            </p>

            <p className="mt-1 text-xl font-bold">
              {totalDays}{" "}
              {totalDays === 1
                ? "Day"
                : "Days"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">
              👥
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Travelers
            </p>

            <p className="mt-1 text-xl font-bold">
              {travelers}{" "}
              {Number(travelers) === 1
                ? "Person"
                : "People"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">
              💰
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Budget
            </p>

            <p className="mt-1 text-sm font-bold">
              {budgetLabel()}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="mb-2 text-2xl">
              📍
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Destination
            </p>

            <p className="mt-1 text-xl font-bold">
              Lombok
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* TRIP PREPARATION STATUS */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Trip Status
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {driverAssigned || guideAssigned
                ? "Trip Partners Assigned"
                : airportPickup === "funtravel" ||
                  guideRequired
                ? "Preparing Your Trip"
                : "Trip Ready"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your Lombok journey is being organized from
              arrival to departure.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-green-50 p-4">
              <div className="text-2xl">
                ✓
              </div>

              <p className="mt-2 font-bold text-green-800">
                Trip Planned
              </p>

              <p className="mt-1 text-xs text-green-700">
                Your trip details are saved.
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                hasFlight
                  ? "bg-green-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-2xl">
                {hasFlight ? "✓" : "○"}
              </div>

              <p className="mt-2 font-bold">
                Flight
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {hasFlight
                  ? "Flight information added."
                  : "Flight not added yet."}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                airportPickup === "funtravel"
                  ? driverAssigned
                    ? "bg-green-50"
                    : "bg-blue-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-2xl">
                {driverAssigned
                  ? "✓"
                  : "🚗"}
              </div>

              <p className="mt-2 font-bold">
                Airport Pickup
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {airportPickup ===
                "funtravel"
                  ? driverAssigned
                    ? "Driver assigned."
                    : "Driver request sent."
                  : "Own transportation."}
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 ${
                guideRequired
                  ? guideAssigned
                    ? "bg-green-50"
                    : "bg-purple-50"
                  : "bg-slate-50"
              }`}
            >
              <div className="text-2xl">
                {guideAssigned
                  ? "✓"
                  : guideRequired
                  ? "🧑‍🏫"
                  : "🏝️"}
              </div>

              <p className="mt-2 font-bold">
                Guide
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {guideRequired
                  ? guideAssigned
                    ? "Guide assigned."
                    : "Guide request sent."
                  : "No guide requested."}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FLIGHT */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              ✈️
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Flight Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your arrival and departure details.
              </p>
            </div>
          </div>

          {!hasFlight ? (
            <div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">
              <strong>
                Flight information not added yet.
              </strong>

              <p className="mt-1">
                You can arrange your flight details
                later.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {/* ARRIVAL */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-bold">
                    Arrival
                  </h3>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    ARRIVAL
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Flight
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {arrivalFlight || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatDate(arrivalDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 font-semibold">
                        {arrivalTime || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-400">
                      Arrival
                    </p>

                    <p className="mt-1 font-bold">
                      Lombok International Airport
                    </p>

                    <p className="text-sm text-slate-500">
                      Lombok, Indonesia
                    </p>
                  </div>
                </div>
              </div>

              {/* DEPARTURE */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-bold">
                    Departure
                  </h3>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    DEPARTURE
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Flight
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {departureFlight || "-"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatDate(departureDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 font-semibold">
                        {departureTime || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-400">
                      Departure
                    </p>

                    <p className="mt-1 font-bold">
                      Lombok International Airport
                    </p>

                    <p className="text-sm text-slate-500">
                      Lombok, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* AIRPORT PICKUP */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              🚗
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Airport Pickup
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your transportation from Lombok
                International Airport.
              </p>
            </div>
          </div>

          {airportPickup === "own" ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">
                  🚕
                </div>

                <div>
                  <h3 className="font-bold">
                    You&apos;ll arrange your own
                    transportation
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    FunTravel will not assign a driver
                    for your airport transfer.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">

              <div className="rounded-2xl bg-blue-50 p-5">
                <h3 className="font-bold text-blue-900">
                  FunTravel Airport Pickup
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  Your request has been sent automatically
                  to approved FunTravel drivers.
                </p>
              </div>

              {/* DRIVER DETAILS */}

              {assignedDriver ? (
                <div className="overflow-hidden rounded-3xl border border-green-200 bg-green-50">

                  <div className="border-b border-green-200 bg-green-100 p-5">
                    <div className="flex items-center gap-4">

                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                        👨‍✈️
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                          Driver Assigned
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-green-950">
                          {assignedDriver.name}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-green-700">
                          {getDriverStatusLabel()}
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="space-y-4 p-5">

                    {/* CONTACT */}

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 font-bold">
                          {assignedDriver.phone || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          WhatsApp
                        </p>

                        <p className="mt-1 font-bold">
                          {assignedDriver.whatsapp || "-"}
                        </p>
                      </div>

                    </div>

                    {/* VEHICLE */}

                    <div className="rounded-2xl bg-white p-5">

                      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Vehicle Information
                      </p>

                      <div className="grid gap-4 sm:grid-cols-3">

                        <div>
                          <p className="text-xs text-slate-400">
                            Vehicle Type
                          </p>

                          <p className="mt-1 font-bold">
                            {assignedDriver.vehicleType || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Vehicle Model
                          </p>

                          <p className="mt-1 font-bold">
                            {assignedDriver.vehicleModel || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Plate Number
                          </p>

                          <p className="mt-1 font-bold">
                            {assignedDriver.vehiclePlate || "-"}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* EXPERIENCE */}

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Experience
                        </p>

                        <p className="mt-1 font-semibold">
                          {assignedDriver.experience || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Languages
                        </p>

                        <p className="mt-1 font-semibold">
                          {assignedDriver.languages || "-"}
                        </p>
                      </div>

                    </div>

                    {/* ADDRESS */}

                    {assignedDriver.address && (
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Address
                        </p>

                        <p className="mt-1 text-sm leading-6 font-semibold">
                          {assignedDriver.address}
                        </p>
                      </div>
                    )}

                    {/* BUTTONS */}

                    <div className="flex flex-wrap gap-3">

                      {assignedDriver.phone && (
                        <a
                          href={`tel:${assignedDriver.phone}`}
                          className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                        >
                          📞 Call Driver
                        </a>
                      )}

                      {assignedDriver.whatsapp && (
                        <a
                          href={`https://wa.me/${assignedDriver.whatsapp.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                        >
                          💬 WhatsApp Driver
                        </a>
                      )}

                    </div>

                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white p-6">
                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl">
                      👨‍✈️
                    </div>

                    <div>
                      <h3 className="font-bold">
                        Driver request sent
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Your airport pickup request has
                        been automatically sent to approved
                        FunTravel drivers. A driver will
                        appear here after accepting your
                        trip.
                      </p>

                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">

                        <strong>
                          Driver request process:
                        </strong>

                        <ul className="mt-2 list-inside list-disc space-y-1">
                          <li>
                            Approved drivers receive the
                            trip request.
                          </li>

                          <li>
                            A driver can Accept or Decline.
                          </li>

                          <li>
                            The first accepted driver
                            becomes assigned to your trip.
                          </li>

                          <li>
                            Driver details will appear here
                            automatically.
                          </li>
                        </ul>

                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* GUIDE */}
        {/* ================================================= */}

        {guideRequired && (
          <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <div className="mb-6 flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                🧑‍🏫
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Lombok Guide
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your guide request is being processed.
                </p>
              </div>

            </div>

            {/* GUIDE DETAILS */}

            {assignedGuide ? (
              <div className="overflow-hidden rounded-3xl border border-purple-200 bg-purple-50">

                <div className="border-b border-purple-200 bg-purple-100 p-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                      🧑‍🏫
                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wide text-purple-700">
                        Tour Guide Assigned
                      </p>

                      <h3 className="mt-1 text-2xl font-bold text-purple-950">
                        {assignedGuide.name}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-purple-700">
                        {getGuideStatusLabel()}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="space-y-4 p-5">

                  {/* CONTACT */}

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 font-bold">
                        {assignedGuide.phone || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        WhatsApp
                      </p>

                      <p className="mt-1 font-bold">
                        {assignedGuide.whatsapp || "-"}
                      </p>
                    </div>

                  </div>

                  {/* EXPERIENCE */}

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Experience
                      </p>

                      <p className="mt-1 font-semibold">
                        {assignedGuide.experience || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Languages
                      </p>

                      <p className="mt-1 font-semibold">
                        {assignedGuide.languages || "-"}
                      </p>
                    </div>

                  </div>

                  {/* SPECIALTIES */}

                  {assignedGuide.specialties && (
                    <div className="rounded-2xl bg-white p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Specialties
                      </p>

                      <p className="mt-1 text-sm leading-6 font-semibold">
                        {assignedGuide.specialties}
                      </p>

                    </div>
                  )}

                  {/* LOMBOK AREAS */}

                  {assignedGuide.areas && (
                    <div className="rounded-2xl bg-white p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Lombok Areas
                      </p>

                      <p className="mt-1 text-sm leading-6 font-semibold">
                        {assignedGuide.areas}
                      </p>

                    </div>
                  )}

                  {/* ADDRESS */}

                  {assignedGuide.address && (
                    <div className="rounded-2xl bg-white p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm leading-6 font-semibold">
                        {assignedGuide.address}
                      </p>

                    </div>
                  )}

                  {/* BUTTONS */}

                  <div className="flex flex-wrap gap-3">

                    {assignedGuide.phone && (
                      <a
                        href={`tel:${assignedGuide.phone}`}
                        className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                      >
                        📞 Call Guide
                      </a>
                    )}

                    {assignedGuide.whatsapp && (
                      <a
                        href={`https://wa.me/${assignedGuide.whatsapp.replace(
                          /\D/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                      >
                        💬 WhatsApp Guide
                      </a>
                    )}

                  </div>

                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-2xl">
                    🧑‍🏫
                  </div>

                  <div>

                    <h3 className="font-bold text-purple-900">
                      Guide request sent
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-purple-800">
                      Your request has been automatically
                      sent to approved FunTravel guides.
                      A guide will appear here after
                      accepting your trip.
                    </p>

                    <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">

                      <strong>
                        Guide request process:
                      </strong>

                      <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>
                          Approved guides receive the trip
                          request.
                        </li>

                        <li>
                          A guide can Accept or Decline.
                        </li>

                        <li>
                          The accepted guide becomes assigned
                          to your trip.
                        </li>

                        <li>
                          Guide information will appear here
                          automatically.
                        </li>
                      </ul>

                    </div>

                  </div>

                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* ACCOMMODATION */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <div className="mb-6 flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              🏨
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Accommodation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your hotel information in Lombok.
              </p>

            </div>

          </div>

          {accommodationType === "own" &&
          hotelName ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-start gap-4">

                <div className="text-3xl">
                  🏨
                </div>

                <div className="flex-1">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Your Hotel
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {hotelName}
                  </h3>

                  {hotelAddress && (
                    <p className="mt-2 text-sm text-slate-600">
                      📍 {hotelAddress}
                    </p>
                  )}

                  {bookingNumber && (
                    <div className="mt-4 rounded-xl bg-white p-4">

                      <p className="text-xs text-slate-400">
                        Booking Number
                      </p>

                      <p className="mt-1 font-bold">
                        {bookingNumber}
                      </p>

                    </div>
                  )}

                </div>

              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-amber-50 p-5">

              <div className="flex items-start gap-4">

                <div className="text-3xl">
                  🗓️
                </div>

                <div>

                  <h3 className="font-bold text-amber-900">
                    Accommodation not selected yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    You decided to arrange your hotel
                    later. Your accommodation information
                    can be added once you have made your
                    booking.
                  </p>

                </div>

              </div>

            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* ITINERARY */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <div className="mb-8 flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              📋
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Your Lombok Itinerary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A simple day-by-day plan for your Lombok
                journey.
              </p>

            </div>

          </div>

          <div className="space-y-8">

            {/* ================================================= */}
            {/* DRIVER & GUIDE INSIDE ITINERARY */}
            {/* ================================================= */}

            {(assignedDriver || assignedGuide) && (
              <div>

                <div className="mb-5">

                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Your Travel Team
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Driver & Tour Guide
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Partner details for your Lombok journey.
                  </p>

                </div>

                <div className="grid gap-5 md:grid-cols-2">

                  {/* ================= DRIVER ================= */}

                  {assignedDriver && (
                    <div className="overflow-hidden rounded-3xl border border-green-200 bg-green-50">

                      <div className="border-b border-green-200 bg-green-100 p-5">

                        <div className="flex items-center gap-4">

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                            👨‍✈️
                          </div>

                          <div>

                            <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                              Driver
                            </p>

                            <h4 className="mt-1 text-xl font-bold text-green-950">
                              {assignedDriver.name}
                            </h4>

                            <span className="mt-2 inline-flex rounded-full bg-green-200 px-3 py-1 text-xs font-bold text-green-800">
                              {getDriverStatusLabel()}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="space-y-4 p-5">

                        <div className="grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Phone
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {assignedDriver.phone || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              WhatsApp
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {assignedDriver.whatsapp || "-"}
                            </p>
                          </div>

                        </div>

                        <div className="rounded-2xl bg-white p-4">

                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                            Vehicle
                          </p>

                          <div className="space-y-2 text-sm">

                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">
                                Type
                              </span>

                              <span className="font-semibold text-right">
                                {assignedDriver.vehicleType || "-"}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">
                                Model
                              </span>

                              <span className="font-semibold text-right">
                                {assignedDriver.vehicleModel || "-"}
                              </span>
                            </div>

                            <div className="flex justify-between gap-4">
                              <span className="text-slate-500">
                                Plate
                              </span>

                              <span className="font-bold text-right">
                                {assignedDriver.vehiclePlate || "-"}
                              </span>
                            </div>

                          </div>

                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Experience
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedDriver.experience || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Languages
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedDriver.languages || "-"}
                            </p>
                          </div>

                        </div>

                        <div className="flex flex-wrap gap-3">

                          {assignedDriver.phone && (
                            <a
                              href={`tel:${assignedDriver.phone}`}
                              className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                            >
                              📞 Call
                            </a>
                          )}

                          {assignedDriver.whatsapp && (
                            <a
                              href={`https://wa.me/${assignedDriver.whatsapp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                            >
                              💬 WhatsApp
                            </a>
                          )}

                        </div>

                      </div>
                    </div>
                  )}

                  {/* ================= GUIDE ================= */}

                  {assignedGuide && (
                    <div className="overflow-hidden rounded-3xl border border-purple-200 bg-purple-50">

                      <div className="border-b border-purple-200 bg-purple-100 p-5">

                        <div className="flex items-center gap-4">

                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                            🧑‍🏫
                          </div>

                          <div>

                            <p className="text-xs font-bold uppercase tracking-wide text-purple-700">
                              Tour Guide
                            </p>

                            <h4 className="mt-1 text-xl font-bold text-purple-950">
                              {assignedGuide.name}
                            </h4>

                            <span className="mt-2 inline-flex rounded-full bg-purple-200 px-3 py-1 text-xs font-bold text-purple-800">
                              {getGuideStatusLabel()}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="space-y-4 p-5">

                        <div className="grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Phone
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {assignedGuide.phone || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              WhatsApp
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {assignedGuide.whatsapp || "-"}
                            </p>
                          </div>

                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Experience
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedGuide.experience || "-"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Languages
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedGuide.languages || "-"}
                            </p>
                          </div>

                        </div>

                        {assignedGuide.specialties && (
                          <div className="rounded-2xl bg-white p-4">

                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Specialties
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedGuide.specialties}
                            </p>

                          </div>
                        )}

                        {assignedGuide.areas && (
                          <div className="rounded-2xl bg-white p-4">

                            <p className="text-xs font-semibold uppercase text-slate-400">
                              Lombok Areas
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {assignedGuide.areas}
                            </p>

                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">

                          {assignedGuide.phone && (
                            <a
                              href={`tel:${assignedGuide.phone}`}
                              className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                            >
                              📞 Call
                            </a>
                          )}

                          {assignedGuide.whatsapp && (
                            <a
                              href={`https://wa.me/${assignedGuide.whatsapp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                            >
                              💬 WhatsApp
                            </a>
                          )}

                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* DAY PLANS */}
            {/* ================================================= */}

            {dayPlans.map((plan, index) => {
              const day = index + 1;
              const photos =
                dayPhotos[day] || [];

              return (
                <div
                  key={day}
                  className="overflow-hidden rounded-3xl border border-slate-200"
                >

                  <div className="border-b border-slate-200 bg-slate-50 p-5">

                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <div>

                        <p className="text-sm font-bold text-blue-600">
                          DAY {day}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {plan.title}
                        </h3>

                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                        {day === 1
                          ? formatDate(startDate)
                          : day === totalDays
                          ? formatDate(endDate)
                          : `Day ${day}`}
                      </span>

                    </div>

                  </div>

                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">

                      {photos
                        .slice(0, 3)
                        .map(
                          (
                            photo,
                            photoIndex
                          ) => (
                            <button
                              key={`${photo.url}-${photoIndex}`}
                              type="button"
                              onClick={() =>
                                openGallery(
                                  photos,
                                  photoIndex
                                )
                              }
                              className="group relative h-40 overflow-hidden rounded-2xl sm:h-48"
                            >

                              <img
                                src={photo.url}
                                alt={photo.title}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />

                              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                            </button>
                          )
                        )}

                    </div>
                  )}

                  <div className="grid gap-4 p-5 md:grid-cols-3">

                    <div className="rounded-2xl bg-amber-50 p-4">

                      <div className="mb-2 text-2xl">
                        🌅
                      </div>

                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        Morning
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {plan.morning}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4">

                      <div className="mb-2 text-2xl">
                        ☀️
                      </div>

                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        Afternoon
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {plan.afternoon}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-indigo-50 p-4">

                      <div className="mb-2 text-2xl">
                        🌙
                      </div>

                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                        Evening
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {plan.evening}
                      </p>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================= */}
        {/* BUDGET */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <div className="mb-6 flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
              💰
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Estimated Trip Budget
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Estimated spending based on your selected
                travel style.
              </p>

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Accommodation
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatRupiah(
                  budgetAmount.accommodation
                )}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Food
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatRupiah(
                  budgetAmount.food
                )}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Transportation
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatRupiah(
                  budgetAmount.transportation
                )}
              </p>

            </div>

            <div className="rounded-2xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Activities
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatRupiah(
                  budgetAmount.activities
                )}
              </p>

            </div>

          </div>

          <div className="mt-5 rounded-2xl bg-blue-600 p-6 text-white">

            <p className="text-sm text-blue-100">
              Estimated Total
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatRupiah(totalBudget)}
            </p>

            <p className="mt-2 text-xs text-blue-100">
              This is an estimate and actual costs may vary.
            </p>

          </div>
        </section>

        {/* ================================================= */}
        {/* PREFERENCES */}
        {/* ================================================= */}

        <section className="mb-8 grid gap-6 lg:grid-cols-2">

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <h2 className="text-xl font-bold">
              Your Preferences
            </h2>

            <div className="mt-5 space-y-4">

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400">
                  Travel Style
                </p>

                <p className="mt-1 font-semibold">
                  {travelStyleLabel()}
                </p>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400">
                  Budget
                </p>

                <p className="mt-1 font-semibold">
                  {budgetLabel()}
                </p>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400">
                  Interests
                </p>

                {interestList.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">

                    {interestList.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                        >
                          {interest}
                        </span>
                      )
                    )}

                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No interests specified.
                  </p>
                )}

              </div>

            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <h2 className="text-xl font-bold">
              Special Requests
            </h2>

            {specialRequest ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {specialRequest}
                </p>

              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                No special requests were added.
              </div>
            )}

          </div>

        </section>

        {/* ================================================= */}
        {/* TRIP FLOW */}
        {/* ================================================= */}

        <section className="mb-8 rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-600 p-6 text-white shadow-xl sm:p-8">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Your Lombok Journey
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            From arrival to departure
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="text-2xl">
                ✈️
              </div>

              <p className="mt-3 font-bold">
                Arrival
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Arrive at Lombok International Airport.
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="text-2xl">
                🚗
              </div>

              <p className="mt-3 font-bold">
                Pickup
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Continue to your accommodation.
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="text-2xl">
                🏨
              </div>

              <p className="mt-3 font-bold">
                Stay
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Check in and settle into your stay.
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="text-2xl">
                🏝️
              </div>

              <p className="mt-3 font-bold">
                Explore
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Enjoy your Lombok itinerary.
              </p>

            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">

              <div className="text-2xl">
                🛫
              </div>

              <p className="mt-3 font-bold">
                Departure
              </p>

              <p className="mt-1 text-xs text-blue-100">
                Return to the airport for your flight
                home.
              </p>

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <section className="mb-10 grid gap-4 sm:grid-cols-3 print:hidden">

          <Link
            href="/planner"
            className="rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Plan Another Trip
          </Link>

          <Link
            href="/trips"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-bold text-slate-700 transition hover:bg-slate-50"
          >
            My Trips
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-center font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>

        </section>

        {/* ================================================= */}
        {/* TRAVEL TIP */}
        {/* ================================================= */}

        <section className="mb-10 rounded-3xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex items-start gap-4">

            <div className="text-3xl">
              💡
            </div>

            <div>

              <h3 className="font-bold text-blue-900">
                Lombok Travel Tip
              </h3>

              <p className="mt-2 text-sm leading-7 text-blue-800">
                Simpan informasi penerbangan, hotel,
                driver dan meeting point di halaman ini.
                Jika driver atau Tour Guide sudah menerima
                request perjalananmu, detail mereka akan
                muncul di bagian Travel Team pada itinerary.
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* CUSTOMER SERVICE */}
        {/* ================================================= */}

        <CustomerService tripId={tripId} />

      </div>

      {/* =================================================== */}
      {/* DELETE MODAL */}
      {/* =================================================== */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="mb-4 text-4xl">
              🗑️
            </div>

            <h2 className="text-2xl font-bold">
              Delete this trip?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will remove this Lombok trip from
              your My Trips list. This action cannot be
              undone.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowDeleteModal(false)
                }
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={deleteTrip}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
              >
                Delete Trip
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* FULLSCREEN GALLERY */}
      {/* =================================================== */}

      {galleryOpen &&
        activeGallery.length > 0 && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">

            <button
              type="button"
              onClick={() =>
                setGalleryOpen(false)
              }
              className="absolute right-5 top-5 z-10 rounded-full bg-white/10 px-4 py-3 text-2xl text-white backdrop-blur transition hover:bg-white/20"
            >
              ×
            </button>

            <button
              type="button"
              onClick={previousPhoto}
              className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
            >
              ‹
            </button>

            <div className="flex max-h-[90vh] max-w-6xl flex-col items-center">

              <img
                src={
                  activeGallery[
                    activePhotoIndex
                  ].url
                }
                alt={
                  activeGallery[
                    activePhotoIndex
                  ].title
                }
                className="max-h-[78vh] max-w-full rounded-2xl object-contain"
              />

              <p className="mt-4 max-w-xl text-center text-sm text-white/80">
                {
                  activeGallery[
                    activePhotoIndex
                  ].title
                }
              </p>

              <p className="mt-2 text-xs text-white/50">
                {activePhotoIndex + 1} /{" "}
                {activeGallery.length}
              </p>

            </div>

            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
            >
              ›
            </button>

          </div>
        )}

      {/* =================================================== */}
      {/* PRINT CSS */}
      {/* =================================================== */}

      <style jsx global>{`
        @media print {
          nav,
          header,
          footer,
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

          section {
            break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}

export default function TripPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">

            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Loading your trip...
            </p>

          </div>
        </main>
      }
    >
      <TripContent />
    </Suspense>
  );
}