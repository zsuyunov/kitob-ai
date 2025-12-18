
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("🎙️ Muxlisa STT API called");
  const apiKey = process.env.MUXLISA_AI_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing Muxlisa API Key");
    return NextResponse.json({ error: "Missing Muxlisa API Key" }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const backendFormData = new FormData();
    backendFormData.append("audio", audioFile);

    console.log("📡 Sending audio to Muxlisa STT...");
    const response = await fetch("https://service.muxlisa.uz/api/v2/stt", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Muxlisa STT Error:", response.status, errorText);
      return NextResponse.json({ error: `Muxlisa STT failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("✅ Muxlisa STT Response:", data);

    // Assuming response format is { text: "..." } or similar. 
    // Based on docs snapshot, it returns JSON. Let's assume 'result' or 'text'.
    // The snapshot shows "Speech to Text API... returns written text".
    // Typical response might be { result: "text" } or just { "text": "..." }
    // I'll pass the whole data or check the structure. 
    // Let's assume it returns { result: string } or { text: string }.
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("❌ Muxlisa STT Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

