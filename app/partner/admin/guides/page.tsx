"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Guide = {
  id: string;
  name: string;
  email: string;
  password?: string;
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

type FilterType = "all" | "pending" | "approved" | "rejected";

export default function AdminGuidesPage() {
  const router = useRouter();

  const [guides, setGuides] = useState<Guide[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedGuide, setSelectedGuide] =
    useState<Guide | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_admin_logged_in"
    );

    if (loggedIn !== "true") {
      router.replace("/partner/admin/login");
      return;
    }

    loadGuides();
  }, [router]);

  const loadGuides = () => {
    try {
      const stored = localStorage.getItem(
        "funtravel_guides"
      );

      if (!stored) {
        setGuides([]);
        return;
      }

      const parsed: Guide[] = JSON.parse(stored);

      setGuides(parsed);
    } catch {
      setError("Unable to load guide applications.");
    }
  };

  const updateGuideStatus = (
    guideId: string,
    status: Guide["status"]
  ) => {
    try {
      const updatedGuides = guides.map((guide) =>
        guide.id === guideId
          ? {
              ...guide,
              status,
            }
          : guide
      );

      localStorage.setItem(
        "funtravel_guides",
        JSON.stringify(updatedGuides)
      );

      setGuides(updatedGuides);

      if (selectedGuide?.id === guideId) {
        setSelectedGuide({
          ...selectedGuide,
          status,
        });
      }

      if (status === "approved") {
        setMessage(
          "Guide has been approved successfully."
        );
      } else if (status === "rejected") {
        setMessage(
          "Guide application has been rejected."
        );
      } else {
        setMessage(
          "Guide status has been changed to pending."
        );
      }

      setError("");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch {
      setError("Unable to update guide status.");
    }
  };

  const filteredGuides = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return guides
      .filter((guide) => {
        if (filter === "all") return true;

        return guide.status === filter;
      })
      .filter((guide) => {
        if (!keyword) return true;

        return (
          guide.name.toLowerCase().includes(keyword) ||
          guide.email.toLowerCase().includes(keyword) ||
          guide.phone.toLowerCase().includes(keyword) ||
          guide.specialties
            .toLowerCase()
            .includes(keyword) ||
          guide.areas
            .toLowerCase()
            .includes(keyword)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [guides, filter, search]);

  const counts = useMemo(() => {
    return {
      all: guides.length,
      pending: guides.filter(
        (guide) => guide.status === "pending"
      ).length,
      approved: guides.filter(
        (guide) => guide.status === "approved"
      ).length,
      rejected: guides.filter(
        (guide) => guide.status === "rejected"
      ).length,
    };
  }, [guides]);

  const formatDate = (date: string) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (
    status: Guide["status"]
  ) => {
    if (status === "approved") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  const logout = () => {
    localStorage.removeItem(
      "funtravel_admin_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_admin"
    );

    router.push("/partner/admin/login");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              FunTravel Admin
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-900">
              Guide Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and approve Lombok guide applications.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* NAVIGATION */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/admin/drivers"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            🚗 Drivers
          </Link>

          <Link
            href="/partner/admin/guides"
            className="whitespace-nowrap border-b-2 border-blue-600 px-4 py-3 text-sm font-bold text-blue-600"
          >
            🧭 Guides
          </Link>

          <Link
            href="/partner/admin/trips"
            className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            🧳 Trip Assignments
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* MESSAGES */}
        {message && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              All Guides
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {counts.all}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left transition hover:border-amber-400"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
              Pending
            </p>

            <p className="mt-2 text-3xl font-black text-amber-700">
              {counts.pending}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("approved")}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition hover:border-emerald-400"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Approved
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-700">
              {counts.approved}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-left transition hover:border-red-400"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-red-600">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-black text-red-700">
              {counts.rejected}
            </p>
          </button>
        </div>

        {/* SEARCH */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search guide by name, email, phone, specialty, or area..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* FILTER */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ] as [FilterType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* GUIDE LIST */}
        <div className="mt-6 space-y-4">
          {filteredGuides.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="text-5xl">🧭</div>

              <h2 className="mt-4 text-lg font-black text-slate-900">
                No guide applications found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                New Lombok guide registrations will appear
                here.
              </p>
            </div>
          ) : (
            filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                      🧭
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          {guide.name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                            guide.status
                          )}`}
                        >
                          {guide.status}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {guide.email}
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        📱 {guide.phone}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {guide.experience}
                        </span>

                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {guide.areas}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedGuide(guide)
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      View Details
                    </button>

                    {guide.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            updateGuideStatus(
                              guide.id,
                              "approved"
                            )
                          }
                          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                          ✓ Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateGuideStatus(
                              guide.id,
                              "rejected"
                            )
                          }
                          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {guide.status === "approved" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateGuideStatus(
                            guide.id,
                            "rejected"
                          )
                        }
                        className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Reject
                      </button>
                    )}

                    {guide.status === "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateGuideStatus(
                            guide.id,
                            "pending"
                          )
                        }
                        className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100"
                      >
                        Move to Pending
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Languages
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {guide.languages || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Specialties
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {guide.specialties || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Lombok Areas
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {guide.areas || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Application Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(guide.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
                  Guide Application
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {selectedGuide.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedGuide(null)
                }
                className="rounded-xl bg-slate-100 px-3 py-2 text-lg font-bold text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-5">
              {/* STATUS */}
              <div
                className={`rounded-2xl p-4 ${
                  selectedGuide.status === "approved"
                    ? "bg-emerald-50"
                    : selectedGuide.status ===
                      "rejected"
                    ? "bg-red-50"
                    : "bg-amber-50"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Application Status
                </p>

                <p className="mt-1 text-lg font-black capitalize text-slate-900">
                  {selectedGuide.status}
                </p>
              </div>

              {/* PERSONAL */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Personal Information
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-900">
                      {selectedGuide.email}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.phone}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      WhatsApp
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.whatsapp}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs text-slate-500">
                      Address
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.address}
                    </p>
                  </div>
                </div>
              </section>

              {/* GUIDE INFORMATION */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Guide Information
                </h3>

                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="text-xs font-bold text-purple-600">
                      Experience
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.experience}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-50 p-4">
                    <p className="text-xs font-bold text-blue-600">
                      Languages
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {selectedGuide.languages}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold text-emerald-600">
                      Specialties
                    </p>

                    <p className="mt-1 text-sm font-bold leading-6 text-slate-900">
                      {selectedGuide.specialties}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-600">
                      Lombok Areas
                    </p>

                    <p className="mt-1 text-sm font-bold leading-6 text-slate-900">
                      {selectedGuide.areas}
                    </p>
                  </div>
                </div>
              </section>

              {/* ACTIONS */}
              <section>
                <h3 className="text-sm font-black text-slate-900">
                  Admin Action
                </h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {selectedGuide.status !==
                    "approved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateGuideStatus(
                          selectedGuide.id,
                          "approved"
                        )
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                    >
                      ✓ Approve Guide
                    </button>
                  )}

                  {selectedGuide.status !==
                    "rejected" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateGuideStatus(
                          selectedGuide.id,
                          "rejected"
                        )
                      }
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                    >
                      Reject Guide
                    </button>
                  )}

                  {selectedGuide.status ===
                    "rejected" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateGuideStatus(
                          selectedGuide.id,
                          "pending"
                        )
                      }
                      className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600"
                    >
                      Move to Pending
                    </button>
                  )}
                </div>
              </section>
            </div>

            <div className="border-t border-slate-200 p-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedGuide(null)
                }
                className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}