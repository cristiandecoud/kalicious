// Shared form field wrapper — label + optional hint/action + input slot + error message.

export function inputClass(error?: string) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm font-sans transition outline-none";
  const normal = "border-[#E8DFD0] bg-[#FDFAF7] text-[#2C1810] placeholder-[#C9B99A]";
  const err = "border-red-300 bg-white text-[#2C1810] placeholder-[#C9B99A]";
  return `${base} ${error ? err : normal}`;
}

export function Field({
  label, hint, error, action, children,
}: {
  label: string;
  hint?: string;
  error?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: "#8B7355" }}>
          {label}
        </label>
        <div className="flex items-center gap-3">
          {hint && <span className="text-xs font-sans" style={{ color: "#C9B99A" }}>{hint}</span>}
          {action}
        </div>
      </div>
      {children}
      {error && <p className="text-xs font-sans" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}
