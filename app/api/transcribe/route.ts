import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ASSEMBLYAI_API_KEY no está configurada" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("audio");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Se requiere un archivo de audio" }, { status: 400 });
    }

    const client = new AssemblyAI({ apiKey });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadUrl = await client.files.upload(buffer);

    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
    });

    if (transcript.status === "error") {
      return NextResponse.json({ error: transcript.error ?? "Error al transcribir" }, { status: 500 });
    }

    return NextResponse.json({ text: transcript.text ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[/api/transcribe]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
