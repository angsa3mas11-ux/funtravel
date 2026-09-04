"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] =
    useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const savedUser = localStorage.getItem(
      "funtravel_current_user"
    );

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  function isActive(path: string) {
    return pathname === path;
  }

  function handleLogout() {
    localStorage.removeItem(
      "funtravel_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_user"
    );

    setUser(null);
    setMobileOpen(false);

    router.push("/login");
  }

  function getInitials(name: string) {
    if (!name) return "U";

    const words = name
      .trim()
      .split(/\s+/);

    if (words.length === 1) {
      return words[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Make a Plan",
      href: "/planner",
    },
    {
      label: "My Trips",
      href: "/trips",
    },
    {
      label: "Explore",
      href: "/explore",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          href="/"
          className="flex h-10 items-center shrink-0"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          <span className="text-2xl font-extrabold tracking-tight text-blue-600">
            FunTravel
          </span>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <div className="hidden md:flex items-center">

          <div className="flex h-10 items-center gap-8">

            {navItems.map((item) => {
              const active = isActive(
                item.href
              );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center text-sm font-semibold whitespace-nowrap transition ${
                    active
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

          </div>

          {/* =========================
              USER AREA
          ========================= */}

          <div className="ml-8 flex h-10 items-center">

            {mounted && user ? (
              <>
                {/* User Information */}

                <div className="mr-4 flex h-10 flex-col justify-center text-right leading-tight">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {user.email}
                  </p>
                </div>

                {/* Avatar */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {getInitials(
                    user.name
                  )}
                </div>

                {/* Logout */}

                <button
                  onClick={handleLogout}
                  className="ml-4 flex h-10 items-center rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Public User Area */}

                <Link
                  href="/login"
                  className="flex h-10 items-center px-3 text-sm font-semibold text-gray-600 transition hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="ml-2 flex h-10 items-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>

        </div>

        {/* =========================
            MOBILE BUTTON
        ========================= */}

        <button
          type="button"
          aria-label="Open menu"
          onClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-xl text-gray-700 md:hidden"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">

          <div className="mx-auto w-full max-w-7xl px-6 py-4">

            <div className="flex flex-col gap-1">

              {/* User */}

              {mounted && user && (
                <div className="mb-2 flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                    {getInitials(
                      user.name
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                </div>
              )}

              {/* Navigation */}

              {navItems.map((item) => {
                const active = isActive(
                  item.href
                );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`flex h-12 items-center rounded-xl px-4 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Public Buttons */}

              {mounted && !user && (
                <>
                  <Link
                    href="/login"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="mt-2 flex h-12 items-center rounded-xl px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Logout */}

              {mounted && user && (
                <>
                  <div className="my-2 border-t border-gray-100" />

                  <button
                    onClick={handleLogout}
                    className="flex h-12 items-center rounded-xl px-4 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}

            </div>

          </div>

        </div>
      )}
    </nav>
  );
}