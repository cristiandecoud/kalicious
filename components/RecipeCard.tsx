"use client";

import Link from "next/link";
import { Recipe, CATEGORIES } from "@/lib/types";

interface Props {
  recipe: Recipe;
  onDelete: (id: string) => void;
}

const CATEGORY_DOTS: Record<string, string> = {
  desayuno: "#E8C97A",
  almuerzo: "#9BBD9B",
  cena:     "#8AAEC4",
  postre:   "#D4A0B5",
  snack:    "#B5A3CC",
};

export default function RecipeCard({ recipe, onDelete }: Props) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;
  const dot = CATEGORY_DOTS[recipe.category] ?? "#C4B49A";

  return (
    <div
      className="recipe-card group bg-white"
      style={{
        position: "relative",
        borderRadius: 16,
        border: "1px solid #EDE6DA",
        padding: "22px 24px 18px",
        boxShadow: "0 1px 3px rgba(44,24,16,0.05)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(44,24,16,0.09)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(44,24,16,0.05)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Overlay link que cubre toda la tarjeta */}
      <Link
        href={`/recetas/${recipe.id}`}
        aria-label={recipe.title}
        style={{ position: "absolute", inset: 0, borderRadius: 16, zIndex: 0 }}
      />
      {/* Category dot + label */}
      <div className="flex items-center gap-2 mb-3">
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            backgroundColor: dot,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span
          className="font-sans uppercase"
          style={{ fontSize: 10, letterSpacing: "0.18em", color: "#B8A898", fontWeight: 500 }}
        >
          {categoryLabel}
        </span>
      </div>

      {/* Title */}
      <h2
        className="font-heading font-bold leading-snug mb-4"
        style={{ fontSize: 20, color: "#2C1810", letterSpacing: "-0.01em" }}
      >
        {recipe.title}
      </h2>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs" style={{ color: "#B8A898" }}>
            {recipe.time} min
          </span>
          <span style={{ width: 1, height: 10, backgroundColor: "#E8DFD0", display: "inline-block" }} />
          <span className="font-sans text-xs" style={{ color: "#B8A898" }}>
            {recipe.servings} {recipe.servings === 1 ? "porción" : "porciones"}
          </span>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1"
          style={{ position: "relative", zIndex: 1 }}
        >
          <Link
            href={`/recetas/${recipe.id}/editar`}
            className="font-sans text-xs rounded-full px-3 py-1.5"
            style={{ color: "#B8A898", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#8B7355")}
            onMouseLeave={e => (e.currentTarget.style.color = "#B8A898")}
          >
            Editar
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 30,
              height: 30,
              color: "#CFC3B4",
              transition: "color 0.15s",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#C4502A")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "#CFC3B4")}
            title="Eliminar"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
