"use client";

import { useState } from "react";

export default function TestAI() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function testAI() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: "Bali",
          startDate: "2026-09-10",
          endDate: "2026-09-13",
          budget: "Comfort",
          travelers: "2 Travelers",
          interests: "Beaches, Food, Nature",
          travelStyle: "Balanced",
          specialRequest:
            "Saya ingin menikmati pantai dan makanan lokal.",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setResult("ERROR: " + data.error);
      }
    } catch (error) {
      setResult("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow">
        <h1 className="text-3xl font-bold mb-4">
          Test FunTravel AI 🤖
        </h1>

        <p className="text-gray-500 mb-6">
          Halaman ini digunakan untuk memastikan AI FunTravel
          sudah terhubung dengan benar.
        </p>

        <button
          onClick={testAI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "AI sedang bekerja..." : "✨ Test Generate AI"}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="font-bold text-xl mb-3">
              Hasil AI
            </h2>

            <div className="whitespace-pre-wrap bg-gray-50 border rounded-xl p-6 text-gray-700">
              {result}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}