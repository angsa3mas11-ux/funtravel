"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

const lombokAreas = [
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

const guideSpecialties = [
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

export default function GuideRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [areas, setAreas] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanWhatsapp = whatsapp.trim();
    const cleanAddress = address.trim();
    const cleanExperience = experience.trim();
    const cleanLanguages = languages.trim();
    const cleanSpecialties = specialties.trim();
    const cleanAreas = areas.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword ||
      !cleanPhone ||
      !cleanWhatsapp ||
      !cleanAddress ||
      !cleanExperience ||
      !cleanLanguages ||
      !cleanSpecialties ||
      !cleanAreas
    ) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const storedGuides =
        localStorage.getItem("funtravel_guides");

      const guides: Guide[] = storedGuides
        ? JSON.parse(storedGuides)
        : [];

      const emailExists = guides.some(
        (guide) =>
          guide.email.toLowerCase() === cleanEmail
      );

      if (emailExists) {
        setError(
          "An account with this email already exists."
        );
        setLoading(false);
        return;
      }

      const phoneExists = guides.some(
        (guide) => guide.phone === cleanPhone
      );

      if (phoneExists) {
        setError(
          "This phone number is already registered."
        );
        setLoading(false);
        return;
      }

      const whatsappExists = guides.some(
        (guide) => guide.whatsapp === cleanWhatsapp
      );

      if (whatsappExists) {
        setError(
          "This WhatsApp number is already registered."
        );
        setLoading(false);
        return;
      }

      const newGuide: Guide = {
        id: `guide-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        name: cleanName,
        email: cleanEmail,
        password,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        address: cleanAddress,
        experience: cleanExperience,
        languages: cleanLanguages,
        specialties: cleanSpecialties,
        areas: cleanAreas,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updatedGuides = [...guides, newGuide];

      localStorage.setItem(
        "funtravel_guides",
        JSON.stringify(updatedGuides)
      );

      setTimeout(() => {
        router.push(
          "/partner/guide/login?registered=true"
        );
      }, 700);
    } catch {
      setError(
        "Something went wrong while creating your account."
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white shadow-lg shadow-blue-200">
            🧭
          </div>

          <h1 className="text-3xl font-black text-slate-900">
            Become a FunTravel Guide
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Join FunTravel as a local guide and help
            travelers discover the best of Lombok.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
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

          <form onSubmit={handleRegister} className="space-y-8">
            {/* Personal Information */}
            <section>
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell us about yourself.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Your full name"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    WhatsApp Number
                  </label>

                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) =>
                      setWhatsapp(e.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Address
                  </label>

                  <textarea
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Your address in Lombok"
                    rows={3}
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Please provide your current address
                    in Lombok.
                  </p>
                </div>
              </div>
            </section>

            {/* Guiding Information */}
            <section className="border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">
                  Guiding Information
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell travelers and FunTravel about your
                  guiding experience.
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
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">
                      Select your experience
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
                    placeholder="Example: Indonesian, English, Sasak"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
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
                    placeholder="Example: Lombok culture, beaches, waterfalls, Mount Rinjani"
                    rows={3}
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {guideSpecialties.map(
                      (specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          onClick={() => {
                            if (
                              specialties
                                .toLowerCase()
                                .includes(
                                  specialty.toLowerCase()
                                )
                            ) {
                              return;
                            }

                            setSpecialties((current) =>
                              current.trim()
                                ? `${current.trim()}, ${specialty}`
                                : specialty
                            );
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          + {specialty}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Areas You Can Guide
                  </label>

                  <textarea
                    value={areas}
                    onChange={(e) =>
                      setAreas(e.target.value)
                    }
                    placeholder="Example: Kuta Mandalika, Tanjung Aan, Selong Belanak"
                    rows={3}
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    {lombokAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (
                            areas
                              .toLowerCase()
                              .includes(area.toLowerCase())
                          ) {
                            return;
                          }

                          setAreas((current) =>
                            current.trim()
                              ? `${current.trim()}, ${area}`
                              : area
                          );
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        + {area}
                      </button>
                    ))}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Guide services are currently focused
                    only on Lombok.
                  </p>
                </div>
              </div>
            </section>

            {/* Account Security */}
            <section className="border-t border-slate-100 pt-8">
              <div className="mb-5">
                <h2 className="text-lg font-black text-slate-900">
                  Account Security
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create your guide account.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Repeat your password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* Approval Notice */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">⏳</span>

                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Admin Approval Required
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    After registration, your account will
                    be reviewed by FunTravel. You will be
                    able to log in after your guide account
                    has been approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Guide Account..."
                : "Register as Guide"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have a guide account?
            </p>

            <Link
              href="/partner/guide/login"
              className="mt-1 inline-block text-sm font-bold text-blue-600 transition hover:text-blue-700"
            >
              Sign in as Guide →
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
    </main>
  );
}