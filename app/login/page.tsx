"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

    const savedUsers = localStorage.getItem("funtravel_users");

    if (!savedUsers) {
      setError(
        "Belum ada akun yang terdaftar. Silakan register terlebih dahulu."
      );
      return;
    }

    let users: User[] = [];

    try {
      users = JSON.parse(savedUsers);
    } catch {
      setError("Data akun bermasalah. Silakan register kembali.");
      return;
    }

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === cleanEmail &&
        item.password === password
    );

    if (!user) {
      setError("Email atau password salah.");
      return;
    }

    setIsLoggingIn(true);

    localStorage.setItem("funtravel_logged_in", "true");

    localStorage.setItem(
      "funtravel_current_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
      })
    );

    window.setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12 overflow-hidden">
      <div className="w-full max-w-md">

        {/* Header */}
        <div
          className="text-center mb-8"
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

          <h1 className="text-3xl font-bold mt-8">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2">
            Sign in to continue your travel journey.
          </p>
        </div>

        {/* Login Card */}
        <div
          className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8"
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
              className="mb-5 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md"
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
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold transition-all duration-200 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
            className="text-center mt-6"
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