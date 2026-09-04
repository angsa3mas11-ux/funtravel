"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function DriverProfilePage() {
  const router = useRouter();

  const [driver, setDriver] = useState<Driver | null>(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try {
      const loggedIn = localStorage.getItem("funtravel_driver_logged_in");
      const storedDriver = localStorage.getItem(
        "funtravel_current_driver"
      );

      if (loggedIn !== "true" || !storedDriver) {
        router.replace("/partner/driver/login");
        return;
      }

      const currentDriver: Driver = JSON.parse(storedDriver);

      if (currentDriver.status !== "approved") {
        router.replace("/partner/driver/login");
        return;
      }

      setDriver(currentDriver);

      setName(currentDriver.name || "");
      setEmail(currentDriver.email || "");
      setPhone(currentDriver.phone || "");
      setWhatsapp(currentDriver.whatsapp || "");
      setAddress(currentDriver.address || "");

      setVehicleType(currentDriver.vehicleType || "");
      setVehicleModel(currentDriver.vehicleModel || "");
      setVehiclePlate(currentDriver.vehiclePlate || "");

      setExperience(currentDriver.experience || "");
      setLanguages(currentDriver.languages || "");
    } catch {
      localStorage.removeItem("funtravel_driver_logged_in");
      localStorage.removeItem("funtravel_current_driver");

      router.replace("/partner/driver/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!driver) return;

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanWhatsapp = whatsapp.trim();
    const cleanAddress = address.trim();
    const cleanVehicleType = vehicleType.trim();
    const cleanVehicleModel = vehicleModel.trim();
    const cleanVehiclePlate = vehiclePlate.trim().toUpperCase();
    const cleanExperience = experience.trim();
    const cleanLanguages = languages.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!cleanWhatsapp) {
      setError("Please enter your WhatsApp number.");
      return;
    }

    if (!cleanAddress) {
      setError("Please enter your address.");
      return;
    }

    if (!cleanVehicleType) {
      setError("Please select your vehicle type.");
      return;
    }

    if (!cleanVehicleModel) {
      setError("Please enter your vehicle model.");
      return;
    }

    if (!cleanVehiclePlate) {
      setError("Please enter your vehicle plate number.");
      return;
    }

    if (!cleanExperience) {
      setError("Please select your driving experience.");
      return;
    }

    if (!cleanLanguages) {
      setError("Please enter the languages you speak.");
      return;
    }

    setSaving(true);

    try {
      const storedDrivers = localStorage.getItem(
        "funtravel_drivers"
      );

      if (!storedDrivers) {
        setError("Driver database could not be found.");
        setSaving(false);
        return;
      }

      const drivers: Driver[] = JSON.parse(storedDrivers);

      const duplicatePhone = drivers.some(
        (item) =>
          item.id !== driver.id &&
          item.phone.trim().toLowerCase() ===
            cleanPhone.toLowerCase()
      );

      if (duplicatePhone) {
        setError("This phone number is already used by another driver.");
        setSaving(false);
        return;
      }

      const duplicateWhatsapp = drivers.some(
        (item) =>
          item.id !== driver.id &&
          item.whatsapp.trim().toLowerCase() ===
            cleanWhatsapp.toLowerCase()
      );

      if (duplicateWhatsapp) {
        setError(
          "This WhatsApp number is already used by another driver."
        );
        setSaving(false);
        return;
      }

      const duplicatePlate = drivers.some(
        (item) =>
          item.id !== driver.id &&
          item.vehiclePlate.trim().toUpperCase() ===
            cleanVehiclePlate
      );

      if (duplicatePlate) {
        setError(
          "This vehicle plate number is already registered by another driver."
        );
        setSaving(false);
        return;
      }

      const updatedDriver: Driver = {
        ...driver,
        name: cleanName,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        address: cleanAddress,
        vehicleType: cleanVehicleType,
        vehicleModel: cleanVehicleModel,
        vehiclePlate: cleanVehiclePlate,
        experience: cleanExperience,
        languages: cleanLanguages,
      };

      const updatedDrivers = drivers.map((item) =>
        item.id === driver.id ? updatedDriver : item
      );

      localStorage.setItem(
        "funtravel_drivers",
        JSON.stringify(updatedDrivers)
      );

      localStorage.setItem(
        "funtravel_current_driver",
        JSON.stringify(updatedDriver)
      );

      setDriver(updatedDriver);
      setSuccess("Your driver profile has been updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("funtravel_driver_logged_in");
    localStorage.removeItem("funtravel_current_driver");

    router.push("/partner/driver/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!driver) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/driver/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              🚗
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900">
                FunTravel
              </p>

              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Driver Partner
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/partner/driver/dashboard"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/partner/driver/trips"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:block"
            >
              Assignments
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Driver Partner
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Keep your personal and vehicle information up to date.
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex gap-3">
              <span className="text-lg">✅</span>

              <div>
                <p className="text-sm font-bold text-green-800">
                  Profile updated
                </p>

                <p className="mt-1 text-sm text-green-700">
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <span className="text-lg">⚠️</span>

              <div>
                <p className="text-sm font-bold text-red-800">
                  Unable to save changes
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Personal Information */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                👤
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-xs text-slate-500">
                  Your basic contact information.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
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
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Email address cannot be changed from this page.
                </p>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+62 8xxxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  WhatsApp Number
                </label>

                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(event) =>
                    setWhatsapp(event.target.value)
                  }
                  placeholder="+62 8xxxxxxxxxx"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Your address in Lombok"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Vehicle Information */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                🚙
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Vehicle Information
                </h2>

                <p className="text-xs text-slate-500">
                  Information about the vehicle you use for FunTravel.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="vehicleType"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Vehicle Type
                </label>

                <select
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(event) =>
                    setVehicleType(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select vehicle type</option>
                  <option value="Car">Car</option>
                  <option value="MPV">MPV</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Minibus">Minibus</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="vehicleModel"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Vehicle Model
                </label>

                <input
                  id="vehicleModel"
                  type="text"
                  value={vehicleModel}
                  onChange={(event) =>
                    setVehicleModel(event.target.value)
                  }
                  placeholder="Toyota Avanza"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vehiclePlate"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Vehicle Plate Number
                </label>

                <input
                  id="vehiclePlate"
                  type="text"
                  value={vehiclePlate}
                  onChange={(event) =>
                    setVehiclePlate(event.target.value.toUpperCase())
                  }
                  placeholder="DR 1234 XX"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Experience & Languages */}
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                ⭐
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Experience & Languages
                </h2>

                <p className="text-xs text-slate-500">
                  Help FunTravel understand your driving experience.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="experience"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Driving Experience
                </label>

                <select
                  id="experience"
                  value={experience}
                  onChange={(event) =>
                    setExperience(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select experience</option>
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

              <div>
                <label
                  htmlFor="languages"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Languages
                </label>

                <input
                  id="languages"
                  type="text"
                  value={languages}
                  onChange={(event) =>
                    setLanguages(event.target.value)
                  }
                  placeholder="Indonesian, English, Sasak"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate multiple languages with commas.
                </p>
              </div>
            </div>
          </section>

          {/* Account Status */}
          <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                🛡️
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Partner Account
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Your FunTravel driver account is currently{" "}
                  <span className="font-bold text-green-700">
                    Approved
                  </span>
                  .
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Changes to your driver information may be reviewed by
                  FunTravel when the partner management system is active.
                </p>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/partner/driver/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>

        <footer className="py-8 text-center text-xs text-slate-400">
          FunTravel Driver Partner · Lombok, Indonesia
        </footer>
      </div>
    </main>
  );
}