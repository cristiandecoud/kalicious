"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Field, inputClass } from "@/components/ui/Field";

type Tab = "login" | "signup";
type Notice = { type: "error" | "success"; text: string } | null;

const TAB_LABELS: Record<Tab, string> = {
  login: "Iniciar sesión",
  signup: "Registrarse",
};

export default function AuthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [user, authLoading, router]);

  async function handleSubmit() {
    setNotice(null);
    setLoading(true);
    try {
      const { error } = tab === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        setNotice({ type: "error", text: error.message });
        return;
      }

      if (tab === "login") router.push("/");
      else setNotice({ type: "success", text: "¡Revisá tu correo para confirmar tu cuenta!" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setNotice(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }

  return (
    <main className="crochet-bg page-enter px-5 pt-12 pb-24 flex flex-col items-center min-h-screen">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="rounded-full mb-3" style={{ width: 32, height: 3, backgroundColor: "#C4502A", opacity: 0.4 }} />
        <h1 className="font-heading font-bold tracking-tight" style={{ fontSize: 42, color: "#2C1810", lineHeight: 1 }}>
          Kalicious
        </h1>
        <p className="font-sans text-xs mt-2 uppercase tracking-[0.22em]" style={{ color: "#C9B99A" }}>
          Tu recetario personal
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-[20px] p-6 space-y-5" style={{ backgroundColor: "#F7F2EA", border: "1px solid #E8DFD0" }}>

        {/* Tab switcher */}
        <div className="flex rounded-xl p-1" style={{ backgroundColor: "#EDE7DC" }}>
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setNotice(null); }}
              className="flex-1 py-2 text-xs font-sans font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: tab === t ? "#fff" : "transparent",
                color: tab === t ? "#2C1810" : "#8B7355",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <form action={handleSubmit} className="space-y-4">
          <Field label="Correo electrónico">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className={inputClass()}
            />
          </Field>

          <Field label="Contraseña">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass()}
            />
          </Field>

          {notice && (
            <p className="text-xs font-sans" style={{ color: notice.type === "error" ? "#EF4444" : "#6B8F6B" }}>
              {notice.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-sans font-semibold text-sm text-white rounded-full tracking-wide py-3.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#C4502A" }}
          >
            {loading ? "Cargando…" : TAB_LABELS[tab]}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "#E8DFD0" }} />
          <span className="text-[10px] font-sans uppercase tracking-[0.15em]" style={{ color: "#C9B99A" }}>o</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#E8DFD0" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 font-sans font-medium text-sm rounded-full py-3 transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#fff", border: "1px solid #E8DFD0", color: "#2C1810" }}
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </div>

      {/* Volver */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-6 font-sans text-xs"
        style={{ color: "#C9B99A" }}
      >
        ← Volver sin iniciar sesión
      </button>

    </main>
  );
}


function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
