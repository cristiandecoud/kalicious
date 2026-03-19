"use client";

import { useRef, useState } from "react";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type State = "idle" | "recording" | "paused" | "processing";

export default function MicButton({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  async function startRecording() {
    setError("");
    cancelledRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (cancelledRef.current) {
          setState("idle");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await sendAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState("recording");
    } catch {
      setError("No se pudo acceder al micrófono");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setState("processing");
  }

  function pauseRecording() {
    mediaRecorderRef.current?.pause();
    setState("paused");
  }

  function resumeRecording() {
    mediaRecorderRef.current?.resume();
    setState("recording");
  }

  function cancelRecording() {
    cancelledRef.current = true;
    mediaRecorderRef.current?.stop();
    // onstop se encarga de limpiar y resetear a "idle"
  }

  async function sendAudio(blob: Blob) {
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      if (data.text) onTranscript(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al transcribir");
    } finally {
      setState("idle");
    }
  }

  // Estado idle: solo el botón de micrófono
  if (state === "idle" || state === "processing") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled || state === "processing"}
          title="Grabar audio"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
          style={{
            backgroundColor: state === "processing" ? "#E8DFD0" : "#FAF7F2",
            border: "1px solid #E8DFD0",
            cursor: disabled || state === "processing" ? "not-allowed" : "pointer",
          }}
        >
          {state === "processing" ? <SpinnerIcon /> : <MicIcon />}
        </button>
        {error && (
          <span className="text-xs font-sans" style={{ color: "#EF4444" }}>
            {error}
          </span>
        )}
      </div>
    );
  }

  // Estado recording / paused: fila de tres botones
  return (
    <div className="flex items-center gap-1.5">
      {/* Cancelar */}
      <button
        type="button"
        onClick={cancelRecording}
        title="Cancelar grabación"
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: "#FEF2F2",
          border: "1px solid #FECACA",
          cursor: "pointer",
        }}
      >
        <CancelIcon />
      </button>

      {/* Pause / Resume */}
      <button
        type="button"
        onClick={state === "paused" ? resumeRecording : pauseRecording}
        title={state === "paused" ? "Reanudar grabación" : "Pausar grabación"}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: state === "paused" ? "#FFF7ED" : "#FAF7F2",
          border: `1px solid ${state === "paused" ? "#FED7AA" : "#E8DFD0"}`,
          cursor: "pointer",
        }}
      >
        {state === "paused" ? <ResumeIcon /> : <PauseIcon />}
      </button>

      {/* Enviar (stop) */}
      <button
        type="button"
        onClick={stopRecording}
        title="Detener y enviar"
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: "#EF4444",
          border: "1px solid #EF4444",
          cursor: "pointer",
          boxShadow: state === "recording" ? "0 0 0 4px rgba(239,68,68,0.15)" : "none",
        }}
      >
        <StopIcon />
      </button>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="#8B7355" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path strokeLinecap="round" d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="10" height="10" fill="white" viewBox="0 0 10 10">
      <rect width="10" height="10" rx="1.5" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" fill="#8B7355" viewBox="0 0 12 12">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="12" height="12" fill="#C4502A" viewBox="0 0 12 12">
      <path d="M3 2l7 4-7 4V2z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="12" height="12" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 12 12">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9B99A" strokeWidth="2.5">
      <path strokeLinecap="round" d="M12 2a10 10 0 010 20A10 10 0 0112 2" opacity=".3" />
      <path strokeLinecap="round" d="M12 2a10 10 0 0110 10">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
