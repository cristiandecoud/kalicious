"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/lib/types";
import { getRecipes, deleteRecipe } from "@/lib/store";
import { askLLM } from "@/lib/llm/service";
import { DEFAULT_PROVIDER } from "@/lib/llm/registry";
import { RECIPE_SYSTEM_PROMPT, parseRecipeJSON, PENDING_RECIPE_KEY } from "@/lib/recipeParser";

type MicState = "idle" | "recording" | "paused" | "transcribing" | "processing" | "error";

const STATE_LABEL: Record<MicState, string> = {
  idle:         "Grabá tu receta",
  recording:    "Grabando…",
  paused:       "Grabación pausada",
  transcribing: "Transcribiendo…",
  processing:   "Procesando con IA…",
  error:        "Intentar de nuevo",
};

export default function Home() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [micState, setMicState] = useState<MicState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);

  useEffect(() => {
    getRecipes().then(setRecipes).catch(console.error);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta receta?")) return;
    await deleteRecipe(id);
    getRecipes().then(setRecipes).catch(console.error);
  }

  async function handleMicClick() {
    if (micState !== "idle" && micState !== "error") return;

    setErrorMsg("");
    cancelledRef.current = false;
    setMicState("recording");

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
          setMicState("idle");
          return;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        await processAudio(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch {
      setErrorMsg("No se pudo acceder al micrófono");
      setMicState("error");
    }
  }

  function handleStop() {
    mediaRecorderRef.current?.stop();
    setMicState("transcribing");
  }

  function handlePause() {
    mediaRecorderRef.current?.pause();
    setMicState("paused");
  }

  function handleResume() {
    mediaRecorderRef.current?.resume();
    setMicState("recording");
  }

  function handleCancel() {
    cancelledRef.current = true;
    mediaRecorderRef.current?.stop();
  }

  async function processAudio(blob: Blob) {
    try {
      // 1. Transcribir
      setMicState("transcribing");
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al transcribir");

      // 2. LLM
      setMicState("processing");
      const raw = await askLLM(DEFAULT_PROVIDER, data.text, { system: RECIPE_SYSTEM_PROMPT });
      const parsed = parseRecipeJSON(raw);

      // 3. Guardar en sessionStorage y navegar
      sessionStorage.setItem(PENDING_RECIPE_KEY, JSON.stringify(parsed));
      router.push("/recetas/nueva");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al procesar el audio");
      setMicState("error");
    }
  }

  const sorted = [...recipes].sort((a, b) => b.createdAt - a.createdAt);
  const busy = micState === "transcribing" || micState === "processing";

  return (
    <main className="crochet-bg page-enter px-5 pt-12 pb-24 flex flex-col items-center min-h-screen">

      {/* Logo */}
      <div className="flex flex-col items-center mb-2">
        <div className="rounded-full mb-3" style={{ width: 32, height: 3, backgroundColor: "#C4502A", opacity: 0.4 }} />
        <h1 className="font-heading font-bold tracking-tight" style={{ fontSize: 42, color: "#2C1810", lineHeight: 1 }}>
          Kalicious
        </h1>
        <p className="font-sans text-xs mt-2 uppercase tracking-[0.22em]" style={{ color: "#C9B99A" }}>
          Tu recetario personal
        </p>
      </div>

      {/* Mic button */}
      <section className="flex flex-col items-center gap-3 my-12">
        {/* Botón principal */}
        <button
          onClick={micState === "recording" || micState === "paused" ? handleStop : handleMicClick}
          disabled={busy}
          className={micState === "idle" || micState === "error" ? "mic-pulse" : ""}
          style={{
            width: 108,
            height: 108,
            borderRadius: "50%",
            backgroundColor: micState === "recording" ? "#EF4444" : micState === "paused" ? "#F97316" : "#C4502A",
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
            opacity: busy ? 0.75 : 1,
          }}
        >
          {busy ? <SpinnerIcon /> : (micState === "recording" || micState === "paused") ? <SendIcon /> : <MicIcon />}
        </button>

        <span className="font-sans font-semibold text-sm tracking-wide" style={{ color: "#8B7355" }}>
          {STATE_LABEL[micState]}
        </span>

        {/* Botones de pausa y cancelar — solo durante grabación */}
        {(micState === "recording" || micState === "paused") && (
          <div className="controls-enter flex items-center gap-3 mt-1">
            <button
              onClick={handleCancel}
              title="Cancelar grabación"
              className="flex items-center gap-1.5 font-sans text-xs rounded-full px-4 py-2"
              style={{
                color: "#EF4444",
                border: "1px solid #FECACA",
                backgroundColor: "#FEF2F2",
                cursor: "pointer",
              }}
            >
              <CancelIcon />
              Cancelar
            </button>
            <button
              onClick={micState === "paused" ? handleResume : handlePause}
              title={micState === "paused" ? "Reanudar" : "Pausar"}
              className="flex items-center gap-1.5 font-sans text-xs rounded-full px-4 py-2"
              style={{
                color: micState === "paused" ? "#C4502A" : "#8B7355",
                border: `1px solid ${micState === "paused" ? "#FED7AA" : "#E8DFD0"}`,
                backgroundColor: micState === "paused" ? "#FFF7ED" : "#FAF7F2",
                cursor: "pointer",
              }}
            >
              {micState === "paused" ? <ResumeIcon /> : <PauseIcon />}
              {micState === "paused" ? "Reanudar" : "Pausar"}
            </button>
          </div>
        )}

        {micState === "error" && errorMsg && (
          <p className="font-sans text-xs text-center" style={{ color: "#EF4444", maxWidth: 240 }}>
            {errorMsg}
          </p>
        )}
      </section>

      {/* Recetas */}
      {sorted.length > 0 ? (
        <div className="w-full">
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] mb-4 pl-1" style={{ color: "#C9B99A" }}>
            {sorted.length} {sorted.length === 1 ? "receta guardada" : "recetas guardadas"}
          </p>
          <div className="card-stagger flex flex-col gap-4">
            {sorted.map((r) => (
              <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-4" style={{ opacity: 0.55 }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>🧶</span>
          <p className="font-sans text-sm text-center" style={{ color: "#C9B99A", maxWidth: 200 }}>
            Tu recetario está vacío. ¡Grabá tu primera receta!
          </p>
        </div>
      )}

    </main>
  );
}

function MicIcon() {
  return (
    <svg width="40" height="40" fill="none" stroke="white" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path strokeLinecap="round" d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="34" height="34" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path strokeLinecap="round" d="M12 2a10 10 0 010 20A10 10 0 0112 2" opacity=".3" />
      <path strokeLinecap="round" d="M12 2a10 10 0 0110 10">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 12 12">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 12 12">
      <path d="M3 2l7 4-7 4V2z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 12 12">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}
