"use client";

import RecipeCard from "@/components/RecipeCard";
import { RecipeListItem } from "@/lib/types";
import { SearchIcon, CancelIcon } from "@/components/icons";

export type RecipeTab = "comunidad" | "mis-recetas" | "favoritos";

const EMPTY_MESSAGES: Record<RecipeTab, string> = {
  comunidad:     "Aún no hay recetas públicas en la comunidad.",
  "mis-recetas": "Todavía no tenés recetas. ¡Grabá la primera!",
  favoritos:     "Todavía no guardaste ningún favorito.",
};

interface Props {
  recipes: RecipeListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  query: string;
  onQueryChange: (q: string) => void;
  tab: RecipeTab;
  onTabChange: (tab: RecipeTab) => void;
  showUserTabs: boolean;
  userId?: string;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
}

export default function RecipeList({
  recipes, total, page, pageSize, onPageChange,
  query, onQueryChange,
  tab, onTabChange, showUserTabs,
  userId, onToggleFavorite, onRate,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex-1 px-5 md:px-10 pb-24 md:pt-12">

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: "1px solid #CFC0AA", paddingBottom: 0 }}>
        <TabButton active={tab === "comunidad"} onClick={() => onTabChange("comunidad")}>
          Comunidad
        </TabButton>
        {showUserTabs && (
          <>
            <TabButton active={tab === "mis-recetas"} onClick={() => onTabChange("mis-recetas")}>
              Mis recetas
            </TabButton>
            <TabButton active={tab === "favoritos"} onClick={() => onTabChange("favoritos")}>
              Favoritos
            </TabButton>
          </>
        )}
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-2.5 rounded-full px-4 py-2.5 mb-5"
        style={{ backgroundColor: "#F0EAE0", border: "1px solid #C8B49A" }}>
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Buscar receta o ingrediente…"
          className="flex-1 bg-transparent text-sm font-sans outline-none placeholder-[#9B8268]"
          style={{ color: "#2C1810" }}
        />
        {query && (
          <button onClick={() => onQueryChange("")} style={{ color: "#9B8268", lineHeight: 1, cursor: "pointer" }}>
            <CancelIcon stroke="currentColor" />
          </button>
        )}
      </div>

      {recipes.length > 0 ? (
        <>
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] mb-4 pl-1" style={{ color: "#9B8268" }}>
            {total} {total === 1 ? "receta" : "recetas"}
            {totalPages > 1 && (
              <span className="ml-2 font-normal normal-case tracking-normal">
                — pág. {page} de {totalPages}
              </span>
            )}
          </p>

          <div className="card-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                isOwner={r.userId === userId}
                onToggleFavorite={onToggleFavorite}
                onRate={onRate}
                canInteract={!!userId}
              />
            ))}
          </div>

          {/* Paginado */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <PageButton onClick={() => onPageChange(1)} disabled={page === 1} title="Primera">«</PageButton>
              <PageButton onClick={() => onPageChange(page - 1)} disabled={page === 1} title="Anterior">‹</PageButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <PageButton key={n} onClick={() => onPageChange(n)} active={n === page}>{n}</PageButton>
              ))}
              <PageButton onClick={() => onPageChange(page + 1)} disabled={page === totalPages} title="Siguiente">›</PageButton>
              <PageButton onClick={() => onPageChange(totalPages)} disabled={page === totalPages} title="Última">»</PageButton>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 h-full py-20 md:py-0 md:h-64" style={{ opacity: 0.55 }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>{query ? "🔍" : "🧶"}</span>
          <p className="font-sans text-sm text-center" style={{ color: "#9B8268", maxWidth: 220 }}>
            {query ? `Sin resultados para "${query}"` : EMPTY_MESSAGES[tab]}
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-sans text-xs font-semibold px-4 py-2.5 transition-colors"
      style={{
        color: active ? "#2C1810" : "#7A6352",
        background: "none", border: "none", cursor: "pointer",
        borderBottom: active ? "2px solid #C4502A" : "2px solid transparent",
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}

function PageButton({ onClick, disabled, active, children, title }: {
  onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="font-sans text-xs font-semibold w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={{
        backgroundColor: active ? "#C4502A" : "transparent",
        color: active ? "#fff" : disabled ? "#B8A898" : "#5C3D28",
        border: active ? "none" : "1px solid #C8B49A",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

