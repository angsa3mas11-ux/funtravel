"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

function DriverLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    setPageReady(true);

    const registered = searchParams.get("registered");

    if (registered === "true") {
      setSuccess(
        "Registration successful. Your driver account is waiting for approval."
      );
    }
  }, [searchParams]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const storedDrivers = localStorage.getItem("funtravel_drivers");

      if (!storedDrivers) {
        setError("Driver account not found. Please register first.");
        setLoading(false);
        return;
      }

      const drivers: Driver[] = JSON.parse(storedDrivers);

      const driver = drivers.find(
        (item) =>
          item.email.toLowerCase() === cleanEmail &&
          item.password === password
      );

      if (!driver) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      if (driver.status === "pending") {
        setError(
          "Your driver account is still waiting for approval from FunTravel."
        );
        setLoading(false);
        return;
      }

      if (driver.status === "rejected") {
        setError(
          "Your driver application has been rejected. Please contact FunTravel."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("funtravel_driver_logged_in", "true");

      localStorage.setItem(
        "funtravel_current_driver",
        JSON.stringify({
          id: driver.id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          whatsapp: driver.whatsapp,
          address: driver.address,
          vehicleType: driver.vehicleType,
          vehicleModel: driver.vehicleModel,
          vehiclePlate: driver.vehiclePlate,
          experience: driver.experience,
          languages: driver.languages,
          status: driver.status,
          createdAt: driver.createdAt,
        })
      );

      setSuccess("Login successful. Redirecting...");

      setTimeout(() => {
        router.push("/partner/driver/dashboard");
      }, 700);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!pageReady) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              ← Back to FunTravel
            </Link>

            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg shadow-blue-200">
              🚗
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Driver Partner Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to manage your FunTravel driver assignments in Lombok.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
            {success && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="driver@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In as Driver"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                DRIVER PARTNER
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-center text-xs leading-5 text-slate-500">
                Your account must be approved by FunTravel before you can
                access the driver dashboard.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have a driver account?{" "}
              <Link
                href="/partner/driver/register"
                className="font-bold text-blue-600 transition hover:text-blue-700"
              >
                Register as Driver
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            FunTravel Driver Partner · Lombok, Indonesia
          </p>
        </div>
      </div>
    </main>
  );
}

export default function DriverLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-sm text-slate-500">Loading...</div>
        </main>
      }
    >
      <DriverLoginContent />
    </Suspense>
  );
}