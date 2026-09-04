"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GuideStatus = "pending" | "approved" | "rejected";

type Guide = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  whatsapp: string;
  address: string;
  experience: string;
  languages: string;
  specialties: string;
  areas: string;
  status: GuideStatus;
  createdAt: string;
};

const experienceOptions = [
  "Less than 1 year",
  "1 - 3 years",
  "3 - 5 years",
  "5 - 10 years",
  "More than 10 years",
];

const areaOptions = [
  "Mataram",
  "Senggigi",
  "Kuta Mandalika",
  "Praya",
  "Tetebatu",
  "Sembalun",
  "Senaru",
  "Gili Trawangan",
  "Gili Air",
  "Gili Meno",
  "Sekotong",
  "Tanjung Aan",
  "Selong Belanak",
  "Pink Beach",
  "Other Lombok Areas",
];

const specialtyOptions = [
  "Lombok Culture",
  "Lombok History",
  "Nature & Waterfalls",
  "Mount Rinjani",
  "Beaches",
  "Snorkeling & Island Trips",
  "Village & Local Life",
  "Food & Culinary",
  "Adventure",
];

export default function GuideProfilePage() {
  const router = useRouter();

  const [guide, setGuide] = useState<Guide | null>(
    null
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [specialties, setSpecialties] =
    useState("");
  const [areas, setAreas] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem(
      "funtravel_guide_logged_in"
    );

    const storedGuide = localStorage.getItem(
      "funtravel_current_guide"
    );

    if (loggedIn !== "true" || !storedGuide) {
      router.replace("/partner/guide/login");
      return;
    }

    try {
      const currentGuide: Guide =
        JSON.parse(storedGuide);

      if (currentGuide.status !== "approved") {
        localStorage.removeItem(
          "funtravel_guide_logged_in"
        );

        localStorage.removeItem(
          "funtravel_current_guide"
        );

        router.replace("/partner/guide/login");
        return;
      }

      setGuide(currentGuide);

      setName(currentGuide.name || "");
      setEmail(currentGuide.email || "");
      setPhone(currentGuide.phone || "");
      setWhatsapp(currentGuide.whatsapp || "");
      setAddress(currentGuide.address || "");
      setExperience(currentGuide.experience || "");
      setLanguages(currentGuide.languages || "");
      setSpecialties(
        currentGuide.specialties || ""
      );
      setAreas(currentGuide.areas || "");
    } catch {
      localStorage.removeItem(
        "funtravel_guide_logged_in"
      );

      localStorage.removeItem(
        "funtravel_current_guide"
      );

      router.replace("/partner/guide/login");
      return;
    }

    setLoading(false);
  }, [router]);

  const handleSave = () => {
    if (!guide) return;

    setError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanWhatsapp = whatsapp.trim();
    const cleanAddress = address.trim();
    const cleanExperience = experience.trim();
    const cleanLanguages = languages.trim();
    const cleanSpecialties = specialties.trim();
    const cleanAreas = areas.trim();

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

    if (!cleanExperience) {
      setError("Please select your experience.");
      return;
    }

    if (!cleanLanguages) {
      setError(
        "Please enter at least one language."
      );
      return;
    }

    if (!cleanSpecialties) {
      setError(
        "Please enter your guiding specialties."
      );
      return;
    }

    if (!cleanAreas) {
      setError(
        "Please enter the Lombok areas you cover."
      );
      return;
    }

    setSaving(true);

    try {
      const storedGuides =
        localStorage.getItem("funtravel_guides");

      const allGuides: Guide[] = storedGuides
        ? JSON.parse(storedGuides)
        : [];

      const duplicatePhone = allGuides.some(
        (item) =>
          item.id !== guide.id &&
          item.phone.trim().toLowerCase() ===
            cleanPhone.toLowerCase()
      );

      if (duplicatePhone) {
        setError(
          "This phone number is already used by another guide."
        );
        setSaving(false);
        return;
      }

      const duplicateWhatsapp = allGuides.some(
        (item) =>
          item.id !== guide.id &&
          item.whatsapp.trim().toLowerCase() ===
            cleanWhatsapp.toLowerCase()
      );

      if (duplicateWhatsapp) {
        setError(
          "This WhatsApp number is already used by another guide."
        );
        setSaving(false);
        return;
      }

      const updatedGuide: Guide = {
        ...guide,
        name: cleanName,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        address: cleanAddress,
        experience: cleanExperience,
        languages: cleanLanguages,
        specialties: cleanSpecialties,
        areas: cleanAreas,
      };

      const updatedGuides = allGuides.map(
        (item) =>
          item.id === guide.id
            ? updatedGuide
            : item
      );

      localStorage.setItem(
        "funtravel_guides",
        JSON.stringify(updatedGuides)
      );

      localStorage.setItem(
        "funtravel_current_guide",
        JSON.stringify(updatedGuide)
      );

      setGuide(updatedGuide);

      setMessage(
        "Your guide profile has been updated successfully."
      );
    } catch {
      setError(
        "Something went wrong while saving your profile."
      );
    }

    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "funtravel_guide_logged_in"
    );

    localStorage.removeItem(
      "funtravel_current_guide"
    );

    router.push("/partner/guide/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading profile...
        </p>
      </main>
    );
  }

  if (!guide) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/partner/guide/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              🧭
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-900">
                FunTravel
              </h1>

              <p className="text-xs text-slate-500">
                Guide Partner
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/partner/guide/dashboard"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              Dashboard
            </Link>

            <Link
              href="/partner/guide/trips"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:block"
            >
              Assignments
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Guide Partner
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900">
            My Profile
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Keep your guide information up to date so
            FunTravel can match you with the right
            Lombok experiences.
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>

              <p className="text-sm font-semibold leading-6 text-green-700">
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>

              <p className="text-sm font-semibold leading-6 text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Account */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Account
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Account Information
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Your email is linked to your guide account
                and cannot be changed here.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Your full name"
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />

                <p className="mt-2 text-[11px] text-slate-400">
                  Email cannot be changed.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Contact
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Contact Information
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="08xxxxxxxxxx"
              />

              <FormField
                label="WhatsApp Number"
                value={whatsapp}
                onChange={setWhatsapp}
                placeholder="08xxxxxxxxxx"
              />

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Address
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  rows={3}
                  placeholder="Your address in Lombok"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* Guide Information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Professional Information
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Guide Experience
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                This information helps FunTravel match
                you with suitable Lombok trips.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Guiding Experience
                </label>

                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(e.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">
                    Select your experience
                  </option>

                  {experienceOptions.map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Languages
                </label>

                <input
                  type="text"
                  value={languages}
                  onChange={(e) =>
                    setLanguages(e.target.value)
                  }
                  placeholder="Example: Indonesian, English, Japanese"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-[11px] text-slate-400">
                  Separate multiple languages with
                  commas.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Guiding Specialties
                </label>

                <textarea
                  value={specialties}
                  onChange={(e) =>
                    setSpecialties(e.target.value)
                  }
                  rows={3}
                  placeholder="Example: Lombok Culture, Beaches, Food & Culinary"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {specialtyOptions.map(
                    (specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => {
                          const current =
                            specialties
                              .split(",")
                              .map((item) =>
                                item.trim()
                              )
                              .filter(Boolean);

                          const exists =
                            current.includes(
                              specialty
                            );

                          const updated = exists
                            ? current.filter(
                                (item) =>
                                  item !==
                                  specialty
                              )
                            : [
                                ...current,
                                specialty,
                              ];

                          setSpecialties(
                            updated.join(", ")
                          );
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                          specialties
                            .split(",")
                            .map((item) =>
                              item.trim()
                            )
                            .includes(specialty)
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {specialty}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Lombok Areas You Cover
                </label>

                <textarea
                  value={areas}
                  onChange={(e) =>
                    setAreas(e.target.value)
                  }
                  rows={3}
                  placeholder="Example: Kuta Mandalika, Tanjung Aan, Selong Belanak"
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {areaOptions.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        const current =
                          areas
                            .split(",")
                            .map((item) =>
                              item.trim()
                            )
                            .filter(Boolean);

                        const exists =
                          current.includes(area);

                        const updated = exists
                          ? current.filter(
                              (item) =>
                                item !== area
                            )
                          : [
                              ...current,
                              area,
                            ];

                        setAreas(
                          updated.join(", ")
                        );
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                        areas
                          .split(",")
                          .map((item) =>
                            item.trim()
                          )
                          .includes(area)
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="rounded-3xl border border-green-100 bg-green-50 p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                ✓
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-600">
                  Partner Status
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-900">
                  Your account is approved
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  You can receive and manage Lombok
                  guiding assignments from FunTravel.
                </p>

                <div className="mt-3 inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                  APPROVED
                </div>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/partner/guide/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </main>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}