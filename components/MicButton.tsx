"use client";

import { useRecorder } from "@/hooks/useRecorder";
import { MicIcon, SpinnerIcon, PauseIcon, ResumeIcon, CancelIcon, StopIcon } from "@/components/icons";

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function MicButton({ onTranscript, disabled }: Props) {
  const rec = useRecorder({
    onTranscript: async (text) => { onTranscript(text); },
  });

  const busy = rec.state === "transcribing" || rec.state === "processing";
  const active = rec.state === "recording" || rec.state === "paused";

  if (!active) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={rec.start}
          disabled={disabled || busy}
          title="Grabar audio"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
          style={{
            backgroundColor: busy ? "#E8DFD0" : "#FAF7F2",
            border: "1px solid #E8DFD0",
            cursor: disabled || busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? <SpinnerIcon stroke="#C9B99A" /> : <MicIcon />}
        </button>
        {rec.error && (
          <span className="text-xs font-sans" style={{ color: "#EF4444" }}>{rec.error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={rec.cancel}
        title="Cancelar grabación"
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", cursor: "pointer" }}
      >
        <CancelIcon />
      </button>
      <button
        type="button"
        onClick={rec.state === "paused" ? rec.resume : rec.pause}
        title={rec.state === "paused" ? "Reanudar grabación" : "Pausar grabación"}
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: rec.state === "paused" ? "#FFF7ED" : "#FAF7F2",
          border: `1px solid ${rec.state === "paused" ? "#FED7AA" : "#E8DFD0"}`,
          cursor: "pointer",
        }}
      >
        {rec.state === "paused" ? <ResumeIcon fill="#C4502A" /> : <PauseIcon />}
      </button>
      <button
        type="button"
        onClick={rec.stop}
        title="Detener y enviar"
        className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
        style={{
          backgroundColor: "#EF4444",
          border: "1px solid #EF4444",
          cursor: "pointer",
          boxShadow: rec.state === "recording" ? "0 0 0 4px rgba(239,68,68,0.15)" : "none",
        }}
      >
        <StopIcon />
      </button>
    </div>
  );
}

