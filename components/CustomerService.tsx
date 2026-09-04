"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CustomerServiceProps = {
  tripId?: string;
};

type HelpOption = {
  icon: string;
  title: string;
  description: string;
};

const helpOptions: HelpOption[] = [
  {
    icon: "🚗",
    title: "I can't find my driver",
    description: "Get help finding your airport pickup driver.",
  },
  {
    icon: "🏨",
    title: "Hotel problem",
    description: "Get help with your accommodation.",
  },
  {
    icon: "🗺️",
    title: "Itinerary help",
    description: "Need help with your Lombok itinerary?",
  },
  {
    icon: "✈️",
    title: "Flight / airport problem",
    description: "Get help with your flight or airport arrival.",
  },
];

export default function CustomerService({
  tripId,
}: CustomerServiceProps) {
  const [open, setOpen] = useState(false);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [selectedHelp, setSelectedHelp] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(
        "funtravel_current_user"
      );

      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      if (user?.email) {
        setUserEmail(user.email);
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  const handleHelpClick = (title: string) => {
    setSelectedHelp(title);
  };

  const whatsappMessage = selectedHelp
    ? `Hi FunTravel, I need help with: ${selectedHelp}. My trip is in Lombok.`
    : "Hi FunTravel, I need help with my Lombok trip.";

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const emailSubject = selectedHelp
    ? `FunTravel Help - ${selectedHelp}`
    : "FunTravel Customer Support";

  const emailBody = selectedHelp
    ? `Hi FunTravel,

I need help with: ${selectedHelp}.

My trip is in Lombok.

Thank you.`
    : `Hi FunTravel,

I need help with my Lombok trip.

Thank you.`;

  const emailUrl = `mailto:support@funtravel.com?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;

  return (
    <>
      {/* ================================================= */}
      {/* FLOATING CUSTOMER SERVICE BUTTON */}
      {/* ================================================= */}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open FunTravel Customer Service"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-xl shadow-blue-300 transition hover:scale-105 hover:bg-blue-700 sm:bottom-6 sm:right-6"
      >
        {open ? "×" : "💬"}
      </button>

      {/* ================================================= */}
      {/* CUSTOMER SERVICE PANEL */}
      {/* ================================================= */}

      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 sm:right-6">
          {/* HEADER */}

          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
                  💬
                </div>

                <h2 className="text-lg font-bold">
                  Hi! How can we help you?
                </h2>

                <p className="mt-1 text-xs leading-5 text-blue-50">
                  Our team is here to help with your Lombok
                  journey.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-xl text-white/80 transition hover:bg-white/10 hover:text-white"
                aria-label="Close customer service"
              >
                ×
              </button>
            </div>
          </div>

          {/* CONTENT */}

          <div className="max-h-[70vh] overflow-y-auto p-4">
            {!showHelpOptions ? (
              <>
                {/* QUICK ACTIONS */}

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpOptions(true)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg">
                      🆘
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-800">
                        I need help with my trip
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-500">
                        Choose a problem and we'll help you.
                      </span>
                    </span>

                    <span className="text-slate-400">
                      →
                    </span>
                  </button>

                  {/* MY TRIP */}

                  <Link
                    href={
                      tripId
                        ? `/trip?tripId=${encodeURIComponent(
                            tripId
                          )}`
                        : "/trips"
                    }
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                      🧳
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-800">
                        My Trip
                      </span>

                      <span className="mt-0.5 block text-xs text-slate-500">
                        View your Lombok trip details.
                      </span>
                    </span>

                    <span className="text-slate-400">
                      →
                    </span>
                  </Link>
                </div>

                {/* CONTACT OPTIONS */}

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contact FunTravel
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-green-200 bg-green-50 p-3 transition hover:bg-green-100"
                  >
                    <div className="text-xl">
                      📱
                    </div>

                    <p className="mt-1 text-sm font-bold text-green-800">
                      WhatsApp
                    </p>

                    <p className="mt-0.5 text-[11px] text-green-700">
                      Chat with us
                    </p>
                  </a>

                  <a
                    href={emailUrl}
                    className="rounded-2xl border border-blue-200 bg-blue-50 p-3 transition hover:bg-blue-100"
                  >
                    <div className="text-xl">
                      ✉️
                    </div>

                    <p className="mt-1 text-sm font-bold text-blue-800">
                      Email
                    </p>

                    <p className="mt-0.5 truncate text-[11px] text-blue-700">
                      {userEmail || "Contact support"}
                    </p>
                  </a>
                </div>

                {/* NOTE */}

                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <p className="text-center text-[11px] leading-5 text-slate-500">
                    FunTravel customer service is here to help
                    make your Lombok journey easier.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* HELP OPTIONS */}

                <button
                  type="button"
                  onClick={() => {
                    setShowHelpOptions(false);
                    setSelectedHelp(null);
                  }}
                  className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  ← Back
                </button>

                <h3 className="mb-1 text-lg font-bold text-slate-900">
                  What do you need help with?
                </h3>

                <p className="mb-4 text-xs leading-5 text-slate-500">
                  Select an issue related to your Lombok trip.
                </p>

                <div className="space-y-2">
                  {helpOptions.map((option) => (
                    <button
                      key={option.title}
                      type="button"
                      onClick={() =>
                        handleHelpClick(option.title)
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        selectedHelp === option.title
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                        {option.icon}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-800">
                          {option.title}
                        </span>

                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {option.description}
                        </span>
                      </span>

                      {selectedHelp === option.title ? (
                        <span className="text-blue-600">
                          ✓
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          →
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* SELECTED HELP */}

                {selectedHelp && (
                  <div className="mt-5 rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Selected issue
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedHelp}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Contact FunTravel and tell us about your
                      problem. Our team can help you with your
                      Lombok trip.
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-green-600 px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-green-700"
                      >
                        📱 WhatsApp
                      </a>

                      <a
                        href={emailUrl}
                        className="rounded-xl bg-blue-600 px-3 py-2.5 text-center text-xs font-bold text-white transition hover:bg-blue-700"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}