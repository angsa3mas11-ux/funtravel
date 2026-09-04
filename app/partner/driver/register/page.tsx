"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function DriverRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
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

  function clearError() {
    if (error) {
      setError("");
    }
  }

  function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanWhatsapp = whatsapp.trim();
    const cleanAddress = address.trim();
    const cleanVehicleType = vehicleType.trim();
    const cleanVehicleModel = vehicleModel.trim();
    const cleanVehiclePlate = vehiclePlate.trim().toUpperCase();
    const cleanExperience = experience.trim();
    const cleanLanguages = languages.trim();

    if (cleanName.length < 2) {
      setError("Nama lengkap minimal 2 karakter.");
      return;
    }

    if (!cleanEmail) {
      setError("Silakan masukkan email.");
      return;
    }

    if (!cleanPhone) {
      setError("Silakan masukkan nomor telepon.");
      return;
    }

    if (!cleanWhatsapp) {
      setError("Silakan masukkan nomor WhatsApp.");
      return;
    }

    if (!cleanAddress) {
      setError("Silakan masukkan alamat.");
      return;
    }

    if (!cleanVehicleType) {
      setError("Silakan pilih jenis kendaraan.");
      return;
    }

    if (!cleanVehicleModel) {
      setError("Silakan masukkan tipe atau model kendaraan.");
      return;
    }

    if (!cleanVehiclePlate) {
      setError("Silakan masukkan nomor plat kendaraan.");
      return;
    }

    if (!cleanExperience) {
      setError("Silakan masukkan pengalaman sebagai driver.");
      return;
    }

    if (!cleanLanguages) {
      setError("Silakan masukkan bahasa yang dikuasai.");
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

    const savedDrivers =
      localStorage.getItem("funtravel_drivers");

    let drivers: Driver[] = [];

    if (savedDrivers) {
      try {
        const parsedDrivers = JSON.parse(savedDrivers);

        if (!Array.isArray(parsedDrivers)) {
          throw new Error("Invalid driver data");
        }

        drivers = parsedDrivers;
      } catch {
        setError(
          "Data partner driver bermasalah. Silakan coba lagi."
        );
        return;
      }
    }

    const existingDriver = drivers.find(
      (driver) =>
        driver.email?.trim().toLowerCase() === cleanEmail
    );

    if (existingDriver) {
      setError(
        "Email tersebut sudah terdaftar sebagai partner driver."
      );
      return;
    }

    const existingPhone = drivers.find(
      (driver) =>
        driver.phone?.trim() === cleanPhone
    );

    if (existingPhone) {
      setError(
        "Nomor telepon tersebut sudah terdaftar."
      );
      return;
    }

    const existingPlate = drivers.find(
      (driver) =>
        driver.vehiclePlate?.trim().toUpperCase() ===
        cleanVehiclePlate
    );

    if (existingPlate) {
      setError(
        "Nomor plat kendaraan tersebut sudah terdaftar."
      );
      return;
    }

    const newDriver: Driver = {
      id: `driver-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: cleanName,
      email: cleanEmail,
      password,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      address: cleanAddress,
      vehicleType: cleanVehicleType,
      vehicleModel: cleanVehicleModel,
      vehiclePlate: cleanVehiclePlate,
      experience: cleanExperience,
      languages: cleanLanguages,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updatedDrivers = [
      ...drivers,
      newDriver,
    ];

    localStorage.setItem(
      "funtravel_drivers",
      JSON.stringify(updatedDrivers)
    );

    setIsRegistering(true);

    window.setTimeout(() => {
      router.push(
        "/partner/driver/login?registered=true"
      );
    }, 700);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

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

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              🚗 Driver Partner
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            Become a FunTravel Driver Partner
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            Bergabung menjadi partner driver FunTravel dan
            bantu wisatawan menikmati perjalanan mereka di
            Lombok dengan aman dan nyaman.
          </p>
        </div>

        {/* Register Card */}
        <div
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8"
          style={{
            animationName: pageLoaded ? "scaleIn" : "none",
            animationDuration: "0.7s",
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
            animationDelay: "150ms",
            opacity: pageLoaded ? undefined : 0,
          }}
        >

          {/* Information */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg">
                ℹ️
              </div>

              <div>
                <h2 className="font-bold text-blue-900">
                  Partner registration
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Setelah mendaftar, akun Anda akan masuk ke
                  proses review FunTravel. Status awal akun adalah
                  <strong> Pending Review</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
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
            className="space-y-8"
          >

            {/* Personal Information */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Informasi dasar untuk profil partner driver Anda.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Name */}
                <div className="sm:col-span-2">
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
                      clearError();
                    }}
                    placeholder="Your full name"
                    autoComplete="name"
                    minLength={2}
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Email */}
                <div>
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
                      clearError();
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      clearError();
                    }}
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="whatsapp"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    WhatsApp Number
                  </label>

                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(event) => {
                      setWhatsapp(event.target.value);
                      clearError();
                    }}
                    placeholder="08xxxxxxxxxx"
                    autoComplete="tel"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Address in Lombok
                  </label>

                  <textarea
                    id="address"
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      clearError();
                    }}
                    placeholder="Your address in Lombok"
                    rows={3}
                    required
                    disabled={isRegistering}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

              </div>
            </section>

            {/* Vehicle Information */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Vehicle Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Masukkan informasi kendaraan yang akan digunakan
                  untuk melayani wisatawan FunTravel.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Vehicle Type */}
                <div>
                  <label
                    htmlFor="vehicleType"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Vehicle Type
                  </label>

                  <select
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(event) => {
                      setVehicleType(event.target.value);
                      clearError();
                    }}
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="">
                      Select vehicle type
                    </option>

                    <option value="Car">
                      Car
                    </option>

                    <option value="MPV">
                      MPV
                    </option>

                    <option value="SUV">
                      SUV
                    </option>

                    <option value="Van">
                      Van
                    </option>

                    <option value="Minibus">
                      Minibus
                    </option>
                  </select>
                </div>

                {/* Vehicle Model */}
                <div>
                  <label
                    htmlFor="vehicleModel"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Vehicle Model
                  </label>

                  <input
                    id="vehicleModel"
                    type="text"
                    value={vehicleModel}
                    onChange={(event) => {
                      setVehicleModel(event.target.value);
                      clearError();
                    }}
                    placeholder="Example: Toyota Avanza"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Plate */}
                <div>
                  <label
                    htmlFor="vehiclePlate"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Vehicle Plate Number
                  </label>

                  <input
                    id="vehiclePlate"
                    type="text"
                    value={vehiclePlate}
                    onChange={(event) => {
                      setVehiclePlate(
                        event.target.value.toUpperCase()
                      );
                      clearError();
                    }}
                    placeholder="Example: DR 1234 AB"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 uppercase outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label
                    htmlFor="experience"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Driving Experience
                  </label>

                  <select
                    id="experience"
                    value={experience}
                    onChange={(event) => {
                      setExperience(event.target.value);
                      clearError();
                    }}
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="">
                      Select experience
                    </option>

                    <option value="Less than 1 year">
                      Less than 1 year
                    </option>

                    <option value="1 - 3 years">
                      1 - 3 years
                    </option>

                    <option value="3 - 5 years">
                      3 - 5 years
                    </option>

                    <option value="5 - 10 years">
                      5 - 10 years
                    </option>

                    <option value="More than 10 years">
                      More than 10 years
                    </option>
                  </select>
                </div>

                {/* Languages */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="languages"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Languages
                  </label>

                  <input
                    id="languages"
                    type="text"
                    value={languages}
                    onChange={(event) => {
                      setLanguages(event.target.value);
                      clearError();
                    }}
                    placeholder="Example: Indonesian, English"
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Pisahkan beberapa bahasa dengan koma.
                  </p>
                </div>

              </div>
            </section>

            {/* Account Information */}
            <section>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Account Security
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Gunakan password yang kuat untuk akun partner Anda.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Password */}
                <div>
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
                      clearError();
                    }}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

                {/* Confirm Password */}
                <div>
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
                      clearError();
                    }}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    disabled={isRegistering}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>

              </div>
            </section>

            {/* Submit */}
            <div className="border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Creating partner account...
                  </span>
                ) : (
                  "Register as Driver Partner"
                )}
              </button>
            </div>

          </form>

          {/* Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already registered as a driver partner?{" "}

              <Link
                href="/partner/driver/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Traveler Link */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-gray-400 transition-colors hover:text-blue-600"
            >
              ← Back to FunTravel
            </Link>
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