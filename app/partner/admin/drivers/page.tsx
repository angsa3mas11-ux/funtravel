"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DriverStatus = "pending" | "approved" | "rejected";

type Driver = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  whatsapp: string;
  address: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  experience: string;
  languages: string;
  status: DriverStatus;
  createdAt: string;
};

type FilterType = "all" | "pending" | "approved" | "rejected";

export default function AdminDriversPage() {
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filter, setFilter] =
    useState<FilterType>("pending");
  const [selectedDriver, setSelectedDriver] =
    useState<Driver | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_admin_logged_in"
    );

    if (loggedIn !== "true") {
      router.replace("/partner/admin/login");
      return;
    }

    try {
      const storedDrivers =
        localStorage.getItem("funtravel_drivers");

      if (storedDrivers) {
        const parsedDrivers = JSON.parse(storedDrivers);

        if (Array.isArray(parsedDrivers)) {
          setDrivers(parsedDrivers);
        }
      }
    } catch {
      setDrivers([]);
    }

    setLoading(false);
  }, [router]);

  const filteredDrivers = useMemo(() => {
    if (filter === "all") {
      return drivers;
    }

    return drivers.filter(
      (driver) => driver.status === filter
    );
  }, [drivers, filter]);

  const counts = useMemo(() => {
    return {
      all: drivers.length,
      pending: drivers.filter(
        (driver) => driver.status === "pending"
      ).length,
      approved: drivers.filter(
        (driver) => driver.status === "approved"
      ).length,
      rejected: drivers.filter(
        (driver) => driver.status === "rejected"
      ).length,
    };
  }, [drivers]);

  const updateDriverStatus = (
    driverId: string,
    status: DriverStatus
  ) => {
    setActionLoading(driverId);
    setMessage("");

    try {
      const storedDrivers =
        localStorage.getItem("funtravel_drivers");

      if (!storedDrivers) {
        setMessage("Driver data could not be found.");
        setActionLoading("");
        return;
      }

      const currentDrivers: Driver[] =
        JSON.parse(storedDrivers);

      const updatedDrivers = currentDrivers.map(
        (driver) =>
          driver.id === driverId
            ? {
                ...driver,
                status,
              }
            : driver
      );

      localStorage.setItem(
        "funtravel_drivers",
        JSON.stringify(updatedDrivers)
      );

      setDrivers(updatedDrivers);

      if (
        selectedDriver &&
        selectedDriver.id === driverId
      ) {
        setSelectedDriver({
          ...selectedDriver,
          status,
        });
      }

      if (status === "approved") {
        setMessage(
          "Driver has been approved successfully. The driver can now log in."
        );
      } else if (status === "rejected") {
        setMessage(
          "Driver application has been rejected."
        );
      } else {
        setMessage(
          "Driver status has been changed to pending."
        );
      }
    } catch {
      setMessage(
        "Something went wrong while updating the driver."
      );
    }

    setTimeout(() => {
      setActionLoading("");
    }, 400);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "funtravel_admin_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_admin"
    );

    router.push("/partner/admin/login");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    try {
      return new Date(dateString).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return dateString;
    }
  };

  const statusLabel = (status: DriverStatus) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const statusClass = (status: DriverStatus) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading admin panel...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/partner/admin"
              className="flex shrink-0 items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
                🛡️
              </div>

              <div className="hidden sm:block">
                <h1 className="text-lg font-black text-slate-900">
                  FunTravel Admin
                </h1>

                <p className="text-xs text-slate-500">
                  Lombok Travel Management
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 overflow-x-auto">
              <AdminNavLink
                href="/partner/admin"
                icon="📊"
                label="Dashboard"
              />

              <AdminNavLink
                href="/partner/admin/drivers"
                icon="🚗"
                label="Drivers"
                active
              />

              <AdminNavLink
                href="/partner/admin/guides"
                icon="🧭"
                label="Guides"
              />

              <AdminNavLink
                href="/partner/admin/trips"
                icon="🧳"
                label="Trip Assignments"
              />
            </nav>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:block"
            >
              Logout
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="border-t border-slate-100 py-2 md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              <MobileAdminNavLink
                href="/partner/admin"
                icon="📊"
                label="Dashboard"
              />

              <MobileAdminNavLink
                href="/partner/admin/drivers"
                icon="🚗"
                label="Drivers"
                active
              />

              <MobileAdminNavLink
                href="/partner/admin/guides"
                icon="🧭"
                label="Guides"
              />

              <MobileAdminNavLink
                href="/partner/admin/trips"
                icon="🧳"
                label="Trips"
              />

              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                Partner Management
              </p>

              <h2 className="text-3xl font-black text-slate-900">
                Driver Applications
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review driver applications and approve
                trusted Lombok transportation partners.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">ℹ️</span>

              <p className="text-sm font-semibold leading-6 text-blue-700">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
              filter === "all"
                ? "border-blue-500 ring-4 ring-blue-100"
                : "border-slate-200 hover:border-blue-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              All Drivers
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {counts.all}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
              filter === "pending"
                ? "border-amber-500 ring-4 ring-amber-100"
                : "border-slate-200 hover:border-amber-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-black text-amber-600">
              {counts.pending}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("approved")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
              filter === "approved"
                ? "border-green-500 ring-4 ring-green-100"
                : "border-slate-200 hover:border-green-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Approved
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {counts.approved}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("rejected")}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
              filter === "rejected"
                ? "border-red-500 ring-4 ring-red-100"
                : "border-slate-200 hover:border-red-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Rejected
            </p>

            <p className="mt-2 text-3xl font-black text-red-600">
              {counts.rejected}
            </p>
          </button>
        </div>

        {/* Driver list */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {filter === "pending"
                    ? "Pending Applications"
                    : filter === "approved"
                    ? "Approved Drivers"
                    : filter === "rejected"
                    ? "Rejected Applications"
                    : "All Drivers"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredDrivers.length} driver
                  {filteredDrivers.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value as FilterType
                  )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="all">
                  All Drivers
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>

          {filteredDrivers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🚗
              </div>

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                No drivers found
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no driver
                applications in this category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="p-5 transition hover:bg-slate-50 sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                        🚗
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-slate-900">
                            {driver.name}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${statusClass(
                              driver.status
                            )}`}
                          >
                            {statusLabel(
                              driver.status
                            )}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {driver.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            📱 {driver.phone}
                          </span>

                          <span>
                            🚘 {driver.vehicleType}
                          </span>

                          <span>
                            🔢 {driver.vehiclePlate}
                          </span>

                          <span>
                            📅{" "}
                            {formatDate(
                              driver.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDriver(driver)
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        View Details
                      </button>

                      {driver.status !==
                        "approved" && (
                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            driver.id
                          }
                          onClick={() =>
                            updateDriverStatus(
                              driver.id,
                              "approved"
                            )
                          }
                          className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ===
                          driver.id
                            ? "Updating..."
                            : "✓ Approve"}
                        </button>
                      )}

                      {driver.status !==
                        "rejected" && (
                        <button
                          type="button"
                          disabled={
                            actionLoading ===
                            driver.id
                          }
                          onClick={() =>
                            updateDriverStatus(
                              driver.id,
                              "rejected"
                            )
                          }
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDriver(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Driver Application
                </p>

                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedDriver.name}
                </h3>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                    selectedDriver.status
                  )}`}
                >
                  {statusLabel(
                    selectedDriver.status
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedDriver(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Personal */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Personal Information
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Full Name"
                    value={selectedDriver.name}
                  />

                  <InfoItem
                    label="Email"
                    value={selectedDriver.email}
                  />

                  <InfoItem
                    label="Phone"
                    value={selectedDriver.phone}
                  />

                  <InfoItem
                    label="WhatsApp"
                    value={selectedDriver.whatsapp}
                  />

                  <InfoItem
                    label="Address"
                    value={selectedDriver.address}
                    full
                  />
                </div>
              </div>

              {/* Vehicle */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Vehicle Information
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Vehicle Type"
                    value={
                      selectedDriver.vehicleType
                    }
                  />

                  <InfoItem
                    label="Vehicle Model"
                    value={
                      selectedDriver.vehicleModel
                    }
                  />

                  <InfoItem
                    label="License Plate"
                    value={
                      selectedDriver.vehiclePlate
                    }
                  />

                  <InfoItem
                    label="Experience"
                    value={
                      selectedDriver.experience
                    }
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Languages
                </h4>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedDriver.languages ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              {/* Application */}
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-400">
                  Application
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoItem
                    label="Application ID"
                    value={selectedDriver.id}
                  />

                  <InfoItem
                    label="Registered"
                    value={formatDate(
                      selectedDriver.createdAt
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex flex-col gap-2 sm:flex-row">
                  {selectedDriver.status !==
                    "approved" && (
                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        selectedDriver.id
                      }
                      onClick={() =>
                        updateDriverStatus(
                          selectedDriver.id,
                          "approved"
                        )
                      }
                      className="flex-1 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ Approve Driver
                    </button>
                  )}

                  {selectedDriver.status !==
                    "rejected" && (
                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        selectedDriver.id
                      }
                      onClick={() =>
                        updateDriverStatus(
                          selectedDriver.id,
                          "rejected"
                        )
                      }
                      className="flex-1 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      ✕ Reject Application
                    </button>
                  )}

                  {selectedDriver.status ===
                    "rejected" && (
                    <button
                      type="button"
                      disabled={
                        actionLoading ===
                        selectedDriver.id
                      }
                      onClick={() =>
                        updateDriverStatus(
                          selectedDriver.id,
                          "pending"
                        )
                      }
                      className="flex-1 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                    >
                      ↻ Move Back to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ================================
   ADMIN NAVIGATION
================================ */

function AdminNavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition lg:flex ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function MobileAdminNavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function InfoItem({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl bg-slate-50 p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}