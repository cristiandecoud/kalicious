"use client";

import { useRef, useState } from "react";

export type RecorderState = "idle" | "recording" | "paused" | "transcribing" | "processing" | "error";

interface UseRecorderOptions {
  /** Llamado con el texto transcripto. Puede ser async (ej: llamada a LLM). */
  onTranscript: (text: string) => Promise<void>;
}

export function useRecorder({ onTranscript }: UseRecorderOptions) {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  // Ref para evitar stale closure en onTranscript
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  async function start() {
    if (state !== "idle" && state !== "error") return;
    setError("");
    cancelledRef.current = false;
    setState("recording");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (cancelledRef.current) { setState("idle"); return; }
        await sendAudio(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch {
      setError("No se pudo acceder al micrófono");
      setState("error");
    }
  }

  function stop()   { mediaRecorderRef.current?.stop();   setState("transcribing"); }
  function pause()  { mediaRecorderRef.current?.pause();  setState("paused"); }
  function resume() { mediaRecorderRef.current?.resume(); setState("recording"); }
  function cancel() { cancelledRef.current = true; mediaRecorderRef.current?.stop(); }

  async function sendAudio(blob: Blob) {
    try {
      setState("transcribing");
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al transcribir");

      setState("processing");
      await onTranscriptRef.current(data.text);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
      setState("error");
    }
  }

  return { state, error, start, stop, pause, resume, cancel };
}
