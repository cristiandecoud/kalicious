"use client";

import { useRecorder } from "@/hooks/useRecorder";

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
          {busy ? <SpinnerIcon /> : <MicIcon />}
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
        {rec.state === "paused" ? <ResumeIcon /> : <PauseIcon />}
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
  return <svg width="10" height="10" fill="white" viewBox="0 0 10 10"><rect width="10" height="10" rx="1.5" /></svg>;
}

function PauseIcon() {
  return <svg width="12" height="12" fill="#8B7355" viewBox="0 0 12 12"><rect x="2" y="1" width="3" height="10" rx="1" /><rect x="7" y="1" width="3" height="10" rx="1" /></svg>;
}

function ResumeIcon() {
  return <svg width="12" height="12" fill="#C4502A" viewBox="0 0 12 12"><path d="M3 2l7 4-7 4V2z" /></svg>;
}

function CancelIcon() {
  return <svg width="12" height="12" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 12 12"><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></svg>;
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
