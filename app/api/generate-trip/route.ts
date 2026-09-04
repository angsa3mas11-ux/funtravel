import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      interests,
      travelStyle,
      specialRequest,
    } = data;

    const prompt = `
Kamu adalah FunTravel AI, seorang ahli perencana perjalanan.

Buat itinerary perjalanan berdasarkan data berikut:

Destination: ${destination}
Start Date: ${startDate}
End Date: ${endDate}
Budget: ${budget}
Travelers: ${travelers}
Interests: ${interests}
Travel Style: ${travelStyle}
Special Request: ${specialRequest || "Tidak ada"}

Buat itinerary dari hari pertama sampai hari terakhir.

Untuk setiap hari berikan:
- Aktivitas pagi
- Aktivitas siang
- Aktivitas malam
- Rekomendasi makanan
- Perkiraan biaya harian
- Tips perjalanan

Kemudian berikan:
- Ringkasan perjalanan
- Perkiraan total budget
- Transportasi yang disarankan
- Tips penting perjalanan

Buat itinerary yang realistis, menyenangkan, dan sesuai dengan preferensi pengguna.

Gunakan Bahasa Indonesia.
`;

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: prompt,
    });

    return NextResponse.json({
      success: true,
      result: response.output_text,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Gagal membuat itinerary AI.",
      },
      { status: 500 }
    );
  }
}