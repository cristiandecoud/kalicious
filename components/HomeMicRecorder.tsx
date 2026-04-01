"use client";

import { useRecorder } from "@/hooks/useRecorder";
import { askLLM } from "@/lib/llm/service";
import { DEFAULT_PROVIDER } from "@/lib/llm/registry";
import { RECIPE_SYSTEM_PROMPT, parseRecipeJSON, ParsedRecipe } from "@/lib/recipeParser";
import { MicIcon, SpinnerIcon, SendIcon, PauseIcon, ResumeIcon, CancelIcon } from "@/components/icons";

const STATE_LABEL: Record<string, string> = {
  idle:         "Grabá tu receta",
  recording:    "Grabando…",
  paused:       "Grabación pausada",
  transcribing: "Picando finito…",
  processing:   "Cocinando a fuego lento…",
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
        {busy ? <SpinnerIcon size={38} stroke="white" /> : active ? <SendIcon /> : <MicIcon size={40} stroke="white" />}
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
            <CancelIcon size={11} stroke="currentColor" /> Cancelar
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
            {rec.state === "paused" ? <ResumeIcon fill="currentColor" /> : <PauseIcon fill="currentColor" />}
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

