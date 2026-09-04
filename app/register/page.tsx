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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageLoaded(true);
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    const savedUsers = localStorage.getItem("funtravel_users");

    let users: User[] = [];

    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch {
        users = [];
      }
    }

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      setError(
        "Email tersebut sudah terdaftar. Silakan gunakan email lain."
      );
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: cleanName,
      email: cleanEmail,
      password,
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem(
      "funtravel_users",
      JSON.stringify(updatedUsers)
    );

    setIsRegistering(true);

    window.setTimeout(() => {
      alert("Registrasi berhasil! Silakan login.");
      router.push("/login");
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
            Create your account
          </h1>

          <p className="text-gray-500 mt-2">
            Start planning your perfect trips.
          </p>
        </div>

        {/* Register Card */}
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
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* Name */}
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
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md"
              />
            </div>

            {/* Email */}
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
                animationDelay: "500ms",
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
                placeholder="Minimum 6 characters"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md"
              />
            </div>

            {/* Confirm Password */}
            <div
              style={{
                animationName: pageLoaded ? "fadeUp" : "none",
                animationDuration: "0.6s",
                animationTimingFunction: "ease-out",
                animationFillMode: "forwards",
                animationDelay: "600ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
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
                animationDelay: "700ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold transition-all duration-200 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>

          </form>

          {/* Login Link */}
          <div
            className="text-center mt-6"
            style={{
              animationName: pageLoaded ? "fadeUp" : "none",
              animationDuration: "0.6s",
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards",
              animationDelay: "800ms",
              opacity: pageLoaded ? undefined : 0,
            }}
          >
            <p className="text-sm text-gray-500">
              Already have an account?{" "}

              <Link
                href="/login"
                className="font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700"
              >
                Sign in
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