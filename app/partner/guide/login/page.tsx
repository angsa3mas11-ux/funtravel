"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

function GuideLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_guide_logged_in"
    );

    if (loggedIn === "true") {
      router.replace("/partner/guide/dashboard");
      return;
    }

    if (searchParams.get("registered") === "true") {
      setSuccess(
        "Registration successful. Your guide account is now waiting for FunTravel approval."
      );
    }
  }, [router, searchParams]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const storedGuides =
        localStorage.getItem("funtravel_guides");

      if (!storedGuides) {
        setError(
          "No guide account was found. Please register first."
        );
        setLoading(false);
        return;
      }

      const guides: Guide[] = JSON.parse(
        storedGuides
      );

      const guide = guides.find(
        (item) =>
          item.email.toLowerCase() === cleanEmail
      );

      if (!guide) {
        setError(
          "Guide account not found. Please check your email."
        );
        setLoading(false);
        return;
      }

      if (guide.password !== password) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }

      if (guide.status === "pending") {
        setError(
          "Your guide account is still waiting for approval from FunTravel."
        );
        setLoading(false);
        return;
      }

      if (guide.status === "rejected") {
        setError(
          "Your guide application has been rejected by FunTravel."
        );
        setLoading(false);
        return;
      }

      if (guide.status !== "approved") {
        setError(
          "Your guide account is not available for login."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "funtravel_guide_logged_in",
        "true"
      );

      localStorage.setItem(
        "funtravel_current_guide",
        JSON.stringify({
          id: guide.id,
          name: guide.name,
          email: guide.email,
          phone: guide.phone,
          whatsapp: guide.whatsapp,
          address: guide.address,
          experience: guide.experience,
          languages: guide.languages,
          specialties: guide.specialties,
          areas: guide.areas,
          status: guide.status,
          createdAt: guide.createdAt,
        })
      );

      setSuccess("Login successful. Welcome to FunTravel.");

      setTimeout(() => {
        router.push("/partner/guide/dashboard");
      }, 500);
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg shadow-blue-200">
              🧭
            </div>

            <h1 className="text-3xl font-black text-slate-900">
              Guide Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your Lombok guiding
              assignments.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            {/* Success */}
            {success && (
              <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    ✓
                  </span>

                  <p className="text-sm font-semibold leading-6 text-green-700">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    ⚠️
                  </span>

                  <p className="text-sm font-semibold leading-6 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign In as Guide"}
              </button>
            </form>

            {/* Status information */}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">
                  ℹ️
                </span>

                <div>
                  <p className="text-xs font-bold text-blue-800">
                    Account Approval
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    New guide accounts must be approved
                    by FunTravel before they can log in.
                  </p>
                </div>
              </div>
            </div>

            {/* Register */}
            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have a guide account?
              </p>

              <Link
                href="/partner/guide/register"
                className="mt-1 inline-block text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                Register as Guide →
              </Link>
            </div>

            {/* Driver */}
            <div className="mt-5 text-center">
              <Link
                href="/partner/driver/login"
                className="text-xs font-semibold text-slate-400 transition hover:text-blue-600"
              >
                Are you a Driver? Sign in here
              </Link>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              ← Back to FunTravel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GuideLoginPage() {
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
      <GuideLoginForm />
    </Suspense>
  );
}