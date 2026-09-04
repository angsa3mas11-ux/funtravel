"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CustomerService from "../../components/CustomerService";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageLoaded(true);
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setError("Silakan masukkan email.");
      return;
    }

    if (!cleanPassword) {
      setError("Silakan masukkan password.");
      return;
    }

    const savedUsers = localStorage.getItem("funtravel_users");

    if (!savedUsers) {
      setError(
        "Belum ada akun yang terdaftar. Silakan register terlebih dahulu."
      );
      return;
    }

    let users: User[] = [];

    try {
      const parsedUsers = JSON.parse(savedUsers);

      if (!Array.isArray(parsedUsers)) {
        throw new Error("Invalid users data");
      }

      users = parsedUsers;
    } catch {
      setError("Data akun bermasalah. Silakan register kembali.");
      return;
    }

    const user = users.find(
      (item) =>
        item.email?.trim().toLowerCase() === cleanEmail &&
        item.password === cleanPassword
    );

    if (!user) {
      setError("Email atau password salah.");
      return;
    }

    setIsLoggingIn(true);

    /*
     * Password sengaja TIDAK disimpan
     * ke current user.
     */
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    localStorage.setItem("funtravel_logged_in", "true");

    localStorage.setItem(
      "funtravel_current_user",
      JSON.stringify(currentUser)
    );

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div
          className="mb-8 text-center"
          style={{
            animationName: pageLoaded ? "fadeUp" : "none",
            animationDuration: "0.7s",
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            opacity: pageLoaded ? undefined : 0,
          }}
        >
          <Link
            href="/"
            className="inline-block text-3xl font-bold text-blue-600 transition duration-300 hover:scale-105"
          >
            FunTravel
          </Link>

          <h1 className="mt-8 text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to continue your Lombok journey.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg"
          style={{
            animationName: pageLoaded ? "scaleIn" : "none",
            animationDuration: "0.7s",
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            animationDelay: "150ms",
            opacity: pageLoaded ? undefined : 0,
          }}
        >

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              style={{
                animationName: "shake",
                animationDuration: "0.4s",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div
              style={{
                animationName: pageLoaded ? "fadeUp" : "none",
                animationDuration: "0.6s",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                animationDelay: "300ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={isLoggingIn}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* Password */}
            <div
              style={{
                animationName: pageLoaded ? "fadeUp" : "none",
                animationDuration: "0.6s",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                animationDelay: "400ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Your password"
                autoComplete="current-password"
                required
                disabled={isLoggingIn}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* Button */}
            <div
              style={{
                animationName: pageLoaded ? "fadeUp" : "none",
                animationDuration: "0.6s",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                animationDelay: "500ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

          </form>

          {/* Register */}
          <div
            className="mt-6 text-center"
            style={{
              animationName: pageLoaded ? "fadeUp" : "none",
              animationDuration: "0.6s",
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards",
              animationDelay: "600ms",
              opacity: pageLoaded ? undefined : 0,
            }}
          >
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                href="/register"
                className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
              >
                Create account
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Customer Service */}
      <CustomerService />

      {/* Animations */}
      <style jsx>{`
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(15px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }

          20% {
            transform: translateX(-6px);
          }

          40% {
            transform: translateX(6px);
          }

          60% {
            transform: translateX(-4px);
          }

          80% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </main>
  );
}