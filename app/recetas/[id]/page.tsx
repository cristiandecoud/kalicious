"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Recipe, CATEGORIES, CATEGORY_ACCENT_COLORS } from "@/lib/types";
import { getRecipeById, deleteRecipe } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeftIcon, ClockIcon, UsersIcon, ListIcon, PrintIcon } from "@/components/icons";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    getRecipeById(id)
      .then((found) => {
        if (!found) { router.push("/"); return; }
        setRecipe(found);
      })
      .catch(console.error);
  }, [id, router]);

  async function handleDelete() {
    if (!confirm("¿Eliminar esta receta?")) return;
    await deleteRecipe(id);
    router.push("/");
  }

  if (!recipe) return null;

  const isOwner = recipe.userId === user?.id;
  const categoryLabel = CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;
  const accent = CATEGORY_ACCENT_COLORS[recipe.category] ?? "#C4502A";

  return (
    <div className="crochet-bg page-enter min-h-screen">
      {/* Print-only header */}
      <div className="print-header" style={{ display: "none", marginBottom: 24, paddingBottom: 12, borderBottom: "2px solid #C4502A" }}>
        <span style={{ fontFamily: "var(--font-playfair, Georgia, serif)", fontSize: 26, fontWeight: 700, color: "#C4502A", letterSpacing: "0.03em" }}>
          Kalicious
        </span>
      </div>

      {/* Print-only footer */}
      <div className="print-footer" style={{ display: "none", paddingTop: 8, borderTop: "1px solid #E8DFD0", textAlign: "center" }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 10, color: "#8B7355", letterSpacing: "0.12em" }}>
          {origin}
        </span>
      </div>

      {/* Nav */}
      <nav className="no-print" style={{ backgroundColor: "transparent", borderBottom: "1px solid #E8DFD0" }}>
        <div className="px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "#B8A898" }}>
            <ArrowLeftIcon />
            <span>Kalicious</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Imprimir / Guardar PDF"
              className="flex items-center gap-1.5 font-sans text-xs font-medium rounded-full px-3 py-2"
              style={{ color: "#8B7355", border: "1px solid #E8DFD0", backgroundColor: "#fff", cursor: "pointer" }}
            >
              <PrintIcon />
            </button>
            {isOwner && (
              <Link
                href={`/recetas/${recipe.id}/editar`}
                className="font-sans text-xs font-medium rounded-full px-4 py-2"
                style={{ color: "#8B7355", border: "1px solid #E8DFD0", backgroundColor: "#fff" }}
              >
                Editar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #E8DFD0" }}>
        <div style={{ height: 4, backgroundColor: accent }} />
        <div className="px-5 py-8">
          <span
            className="inline-block text-[10px] font-sans font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: accent + "18", color: accent }}
          >
            {categoryLabel}
          </span>
          <h1 className="font-heading font-bold leading-tight mb-6" style={{ fontSize: 28, color: "#2C1810" }}>
            {recipe.title}
          </h1>
          <div className="flex gap-5 flex-wrap">
            <MetaStat icon={<ClockIcon />} label="Tiempo" value={`${recipe.time} min`} />
            <MetaStat icon={<UsersIcon />} label="Porciones" value={String(recipe.servings)} />
            <MetaStat icon={<ListIcon />} label="Ingredientes" value={String(recipe.ingredients.length)} />
          </div>
        </div>
      </div>

      {/* Content — stacked, ingredients first */}
      <main className="px-5 py-6 pb-12 flex flex-col gap-5">
        {/* Ingredients */}
        <div
          className="bg-white p-5 rounded-[20px]"
          style={{ border: "1px solid #E8DFD0", boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-heading text-lg font-bold mb-4 pb-3" style={{ color: "#2C1810", borderBottom: "2px dashed #F0E9DC" }}>
            Ingredientes
          </h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-sans leading-snug" style={{ color: "#4A3728" }}>
                <span className="yarn-dot" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div
          className="bg-white p-5 rounded-[20px]"
          style={{ border: "1px solid #E8DFD0", boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-heading text-lg font-bold mb-4 pb-3" style={{ color: "#2C1810", borderBottom: "2px dashed #F0E9DC" }}>
            Preparación
          </h2>
          <p className="text-sm font-sans whitespace-pre-wrap" style={{ color: "#4A3728", lineHeight: 2 }}>
            {recipe.steps}
          </p>
        </div>

        {/* Delete */}
        {isOwner && (
          <button
            onClick={handleDelete}
            className="no-print w-full font-sans text-sm py-3 rounded-full mt-2"
            style={{ color: "#C9B99A", border: "1px solid #E8DFD0" }}
          >
            Eliminar receta
          </button>
        )}
      </main>
    </div>
  );
}

function MetaStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5" style={{ minWidth: 80 }}>
      <div style={{ color: "#C4502A", opacity: 0.8 }}>{icon}</div>
      <div>
        <p className="text-[10px] font-sans uppercase tracking-wider mb-0.5" style={{ color: "#8B7355" }}>{label}</p>
        <p className="text-sm font-sans font-semibold" style={{ color: "#2C1810" }}>{value}</p>
      </div>
    </div>
  );
}

