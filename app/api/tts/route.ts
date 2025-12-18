import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("🎙️ TTS API called (Muxlisa)");
  const apiKey = process.env.MUXLISA_AI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Muxlisa API Key" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, speaker } = body;
    console.log("📝 Text to synthesize:", text?.substring(0, 100));

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required for TTS" },
        { status: 400 }
      );
    }

    // Default speaker to 1 (Male) if not provided, or map from old "voiceId"
    // Old voiceIds were "Danielle" (Female) and "Matthew" (Male)
    let speakerId = 1; // Default Male
    if (body.voiceId === "Danielle") speakerId = 0; // Female
    if (speaker !== undefined) speakerId = speaker;

    console.log("📡 Sending request to Muxlisa TTS...");
    const response = await fetch("https://service.muxlisa.uz/api/v2/tts", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        speaker: speakerId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Muxlisa TTS failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Muxlisa TTS failed: ${errorText}` },
        { status: response.status }
      );
    }

    console.log("✅ Muxlisa TTS success, getting audio buffer...");
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav", // Muxlisa returns wav
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error: any) {
    console.error("❌ TTS error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio", details: error.message },
      { status: 500 }
    );
  }
}
