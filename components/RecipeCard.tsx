"use client";

import { useState } from "react";
import Link from "next/link";
import { RecipeListItem, CATEGORIES, CATEGORY_HEX_COLORS } from "@/lib/types";
import { HeartIcon, CupcakeIcon } from "@/components/icons";

interface Props {
  recipe: RecipeListItem;
  isOwner: boolean;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  canInteract?: boolean;
}

export default function RecipeCard({
  recipe, isOwner,
  onToggleFavorite,
  onRate,
  canInteract = false,
}: Props) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;
  const dot = CATEGORY_HEX_COLORS[recipe.category] ?? "#C4B49A";

  return (
    <div
      className="recipe-card bg-white"
      style={{
        position: "relative",
        borderRadius: 16,
        border: "1px solid #EDE6DA",
        padding: "20px 22px 16px",
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
      {/* Overlay link — cubre toda la tarjeta */}
      <Link
        href={`/recetas/${recipe.id}`}
        prefetch={false}
        aria-label={recipe.title}
        style={{ position: "absolute", inset: 0, borderRadius: 16, zIndex: 0 }}
      />

      {/* Fila superior: categoría + badge pública */}
      <div className="flex items-center justify-between mb-3" style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
        <div className="flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: dot, display: "inline-block", flexShrink: 0 }} />
          <span className="font-sans uppercase" style={{ fontSize: 10, letterSpacing: "0.18em", color: "#B8A898", fontWeight: 500 }}>
            {categoryLabel}
          </span>
        </div>
        {recipe.isPublic && isOwner && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F2F8F2", border: "1px solid #9BBD9B" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#6B8F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
            </svg>
            <span style={{ fontSize: 9, color: "#6B8F6B", fontWeight: 600, letterSpacing: "0.08em" }}>PÚBLICA</span>
          </div>
        )}
      </div>

      {/* Título */}
      <h2 className="font-heading font-bold leading-snug mb-5" style={{ fontSize: 20, color: "#2C1810", letterSpacing: "-0.01em" }}>
        {recipe.title}
      </h2>

      {/* Rating de cupcakes */}
      <div className="mb-4" style={{ position: "relative", zIndex: 1 }}>
        <CupcakeRating
          avgRating={recipe.avgRating}
          userRating={recipe.userRating}
          canRate={canInteract}
          onRate={(r) => onRate?.(recipe.id, r)}
        />
      </div>

      {/* Fila inferior: stats + favorito */}
      <div className="flex items-center justify-between" style={{ position: "relative", zIndex: 1 }}>
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs" style={{ color: "#B8A898" }}>{recipe.time} min</span>
          <span style={{ width: 1, height: 10, backgroundColor: "#E8DFD0", display: "inline-block" }} />
          <span className="font-sans text-xs" style={{ color: "#B8A898" }}>
            {recipe.servings} {recipe.servings === 1 ? "porción" : "porciones"}
          </span>
        </div>

        {canInteract && (
          <button
            onClick={() => onToggleFavorite?.(recipe.id)}
            title={recipe.isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            style={{
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: recipe.isFavorite ? "#C4502A" : "#CFC3B4",
              transition: "color 0.15s",
              outline: "none",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "#C4502A")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = recipe.isFavorite ? "#C4502A" : "#CFC3B4")}
          >
            <HeartIcon filled={recipe.isFavorite} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Cupcake Rating ───────────────────────────────────────────────────────────

function CupcakeRating({
  avgRating, userRating, canRate, onRate,
}: {
  avgRating: number;
  userRating: number;
  canRate: boolean;
  onRate: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  const displayRating = userRating > 0 ? userRating : avgRating;
  const activeCount = hovered > 0 ? hovered : Math.round(displayRating);

  return (
    <div
      className="flex items-center gap-1.5"
      title={avgRating > 0 ? `Promedio: ${avgRating.toFixed(1)}` : "Sin votos aún"}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!canRate}
          onClick={() => canRate && onRate(n)}
          onMouseEnter={() => canRate && setHovered(n)}
          onMouseLeave={() => canRate && setHovered(0)}
          style={{ background: "none", border: "none", padding: 0, outline: "none", cursor: canRate ? "pointer" : "default", display: "flex", alignItems: "center" }}
          title={canRate ? `${n} ${n === 1 ? "cupcake" : "cupcakes"}` : undefined}
        >
          <CupcakeIcon active={n <= activeCount} faded={displayRating === 0 && hovered === 0} />
        </button>
      ))}
      {avgRating > 0 && (
        <span className="font-sans" style={{ fontSize: 10, color: "#C9B99A", marginLeft: 2 }}>
          {avgRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

