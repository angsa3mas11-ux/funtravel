"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const alreadyLoggedIn = localStorage.getItem("funtravel_admin_logged_in");

    if (alreadyLoggedIn === "true") {
      router.replace("/partner/admin/drivers");
    }

    if (searchParams.get("logout") === "true") {
      setRegistered(false);
    }
  }, [router, searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Prototype admin account.
    // For production, this must be replaced with secure server-side authentication.
    const ADMIN_EMAIL = "admin@funtravel.com";
    const ADMIN_PASSWORD = "admin123";

    if (
      cleanEmail !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {
      setError("Invalid admin email or password.");
      setLoading(false);
      return;
    }

    localStorage.setItem("funtravel_admin_logged_in", "true");

    localStorage.setItem(
      "funtravel_current_admin",
      JSON.stringify({
        name: "FunTravel Admin",
        email: ADMIN_EMAIL,
      })
    );

    setTimeout(() => {
      router.push("/partner/admin/drivers");
    }, 500);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg shadow-blue-200">
              🛡️
            </div>

            <h1 className="text-3xl font-black text-slate-900">
              FunTravel Admin
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage FunTravel partners.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Admin Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@funtravel.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In as Admin"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-800">
                Prototype Admin Account
              </p>

              <p className="mt-2 text-xs text-amber-700">
                Email: admin@funtravel.com
              </p>

              <p className="mt-1 text-xs text-amber-700">
                Password: admin123
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <Link
                href="/partner/driver/login"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                ← Back to Driver Login
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            FunTravel Admin Panel
            <br />
            Manage Lombok travel partners securely.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}