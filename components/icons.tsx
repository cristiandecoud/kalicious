// Shared SVG icon components — single source of truth.
// Import from here instead of defining inline in each file.

// ─── Recording controls ───────────────────────────────────────────────────────

export function MicIcon({ size = 14, stroke = "#8B7355" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path strokeLinecap="round" d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" />
    </svg>
  );
}

export function SpinnerIcon({ size = 14, stroke = "#8B7355" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 7c0 1.2 1.5 1.2 1.5 2.4S8 11.6 8 12.8">
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="0s" repeatCount="indefinite" />
      </path>
      <path d="M14 7c0 1.2 1.5 1.2 1.5 2.4S14 11.6 14 12.8">
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
      </path>
      <path d="M4 15h16" />
      <path d="M4 15c0 3.9 3.6 6 8 6s8-2.1 8-6" />
      <path d="M7 21h10" />
    </svg>
  );
}

export function PauseIcon({ size = 12, fill = "#8B7355" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} fill={fill} viewBox="0 0 12 12">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

export function ResumeIcon({ size = 12, fill = "currentColor" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} fill={fill} viewBox="0 0 12 12">
      <path d="M3 2l7 4-7 4V2z" />
    </svg>
  );
}

export function CancelIcon({ size = 12, stroke = "#EF4444" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" viewBox="0 0 12 12">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}

export function SendIcon({ size = 34, stroke = "white" }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
    </svg>
  );
}

export function StopIcon({ size = 10, fill = "white" }: { size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} fill={fill} viewBox="0 0 10 10">
      <rect width="10" height="10" rx="1.5" />
    </svg>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ─── Recipe detail ────────────────────────────────────────────────────────────

export function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path strokeLinecap="round" d="M12 6v6l4 2" strokeWidth="1.5" />
    </svg>
  );
}

export function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeWidth="1.5" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

export function PrintIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8F6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function CupcakeIcon({ active, faded }: { active: boolean; faded: boolean }) {
  const fill   = active ? "#C4502A" : "none";
  const stroke = active ? "#C4502A" : faded ? "#E8DFD0" : "#C9B99A";
  const sw     = "1.1";

  return (
    <svg width="15" height="19" viewBox="0 0 13 17" fill="none">
      <circle cx="6.5" cy="1.8" r="1.3" fill={fill} stroke={stroke} strokeWidth={sw} />
      <path d="M6.5 3.1 Q7.5 4.5 6.5 5.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M1 9 C1 4 12 4 12 9 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {active && <path d="M3.5 7.5 Q5 5.5 7 6.5" stroke="white" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.4" />}
      <path d="M1 9 L2 16 L11 16 L12 9 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {active && (
        <>
          <line x1="4.2" y1="9.5" x2="3.5" y2="15.5" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.25" />
          <line x1="6.5" y1="9.2" x2="6.5" y2="15.8" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.25" />
          <line x1="8.8" y1="9.5" x2="9.5" y2="15.5" stroke="white" strokeWidth="0.5" strokeLinecap="round" opacity="0.25" />
        </>
      )}
    </svg>
  );
}

// ─── Search / List ────────────────────────────────────────────────────────────

export function SearchIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="#9B8268" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
