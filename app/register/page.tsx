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

  function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }

    if (!cleanEmail) {
      setError("Silakan masukkan email.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Password dan konfirmasi password tidak sama."
      );
      return;
    }

    const savedUsers =
      localStorage.getItem("funtravel_users");

    let users: User[] = [];

    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);

        if (!Array.isArray(parsedUsers)) {
          throw new Error("Invalid users data");
        }

        users = parsedUsers;
      } catch {
        setError(
          "Data akun bermasalah. Silakan coba lagi."
        );
        return;
      }
    }

    const existingUser = users.find(
      (user) =>
        user.email?.trim().toLowerCase() === cleanEmail
    );

    if (existingUser) {
      setError(
        "Email tersebut sudah terdaftar. Silakan gunakan email lain."
      );
      return;
    }

    const newUser: User = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: cleanName,
      email: cleanEmail,
      password,
    };

    const updatedUsers = [
      ...users,
      newUser,
    ];

    localStorage.setItem(
      "funtravel_users",
      JSON.stringify(updatedUsers)
    );

    setIsRegistering(true);

    window.setTimeout(() => {
      router.push("/login?registered=true");
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
            Create your account
          </h1>

          <p className="mt-2 text-gray-500">
            Start planning your perfect Lombok trip.
          </p>
        </div>

        {/* Register Card */}
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
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Your name"
                autoComplete="name"
                minLength={2}
                required
                disabled={isRegistering}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md disabled:cursor-not-allowed disabled:bg-gray-50"
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
                disabled={isRegistering}
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
                animationDelay: "500ms",
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
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={isRegistering}
                className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:shadow-md disabled:cursor-not-allowed disabled:bg-gray-50"
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
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={6}
                required
                disabled={isRegistering}
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
                animationDelay: "700ms",
                opacity: pageLoaded ? undefined : 0,
              }}
            >
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
            className="mt-6 text-center"
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