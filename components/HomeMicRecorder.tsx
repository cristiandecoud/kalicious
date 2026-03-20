"use client";

import { useRecorder } from "@/hooks/useRecorder";
import { askLLM } from "@/lib/llm/service";
import { DEFAULT_PROVIDER } from "@/lib/llm/registry";
import { RECIPE_SYSTEM_PROMPT, parseRecipeJSON, ParsedRecipe } from "@/lib/recipeParser";

const STATE_LABEL: Record<string, string> = {
  idle:         "Grabá tu receta",
  recording:    "Grabando…",
  paused:       "Grabación pausada",
  transcribing: "Transcribiendo…",
  processing:   "Procesando con IA…",
  error:        "Intentar de nuevo",
};

interface Props {
  onProcessed: (recipe: ParsedRecipe) => void;
}

export default function HomeMicRecorder({ onProcessed }: Props) {
  const rec = useRecorder({
    onTranscript: async (text) => {
      const raw = await askLLM(DEFAULT_PROVIDER, text, { system: RECIPE_SYSTEM_PROMPT });
      onProcessed(parseRecipeJSON(raw));
    },
  });

  const busy = rec.state === "transcribing" || rec.state === "processing";
  const active = rec.state === "recording" || rec.state === "paused";

  return (
    <section className="flex flex-col items-center gap-3 my-12">
      <button
        onClick={active ? rec.stop : rec.start}
        disabled={busy}
        className={rec.state === "idle" || rec.state === "error" ? "mic-pulse" : ""}
        style={{
          width: 108, height: 108, borderRadius: "50%",
          backgroundColor: rec.state === "recording" ? "#EF4444" : rec.state === "paused" ? "#F97316" : "#C4502A",
          border: "none", cursor: busy ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background-color 0.2s", opacity: busy ? 0.75 : 1,
        }}
      >
        {busy ? <SpinnerIcon /> : active ? <SendIcon /> : <MicIcon />}
      </button>

      <span className="font-sans font-semibold text-sm tracking-wide" style={{ color: "#8B7355" }}>
        {STATE_LABEL[rec.state]}
      </span>

      {active && (
        <div className="controls-enter flex items-center gap-3 mt-1">
          <button
            onClick={rec.cancel}
            className="flex items-center gap-1.5 font-sans text-xs rounded-full px-4 py-2"
            style={{ color: "#EF4444", border: "1px solid #FECACA", backgroundColor: "#FEF2F2", cursor: "pointer" }}
          >
            <CancelIcon /> Cancelar
          </button>
          <button
            onClick={rec.state === "paused" ? rec.resume : rec.pause}
            className="flex items-center gap-1.5 font-sans text-xs rounded-full px-4 py-2"
            style={{
              color: rec.state === "paused" ? "#C4502A" : "#8B7355",
              border: `1px solid ${rec.state === "paused" ? "#FED7AA" : "#E8DFD0"}`,
              backgroundColor: rec.state === "paused" ? "#FFF7ED" : "#FAF7F2",
              cursor: "pointer",
            }}
          >
            {rec.state === "paused" ? <ResumeIcon /> : <PauseIcon />}
            {rec.state === "paused" ? "Reanudar" : "Pausar"}
          </button>
        </div>
      )}

      {rec.state === "error" && rec.error && (
        <p className="font-sans text-xs text-center" style={{ color: "#EF4444", maxWidth: 240 }}>
          {rec.error}
        </p>
      )}
    </section>
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
      <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
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
  return <svg width="12" height="12" fill="currentColor" viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" rx="1" /><rect x="7" y="1" width="3" height="10" rx="1" /></svg>;
}

function ResumeIcon() {
  return <svg width="12" height="12" fill="currentColor" viewBox="0 0 12 12"><path d="M3 2l7 4-7 4V2z" /></svg>;
}

function CancelIcon() {
  return <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></svg>;
}
