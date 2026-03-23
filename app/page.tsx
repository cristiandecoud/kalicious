"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import HomeMicRecorder from "@/components/HomeMicRecorder";
import { Recipe } from "@/lib/types";
import {
  getRecipes,
  getFavoriteIds, toggleFavorite,
  getAllRatings, getUserRatings, upsertRating,
} from "@/lib/store";
import { ParsedRecipe, PENDING_RECIPE_KEY } from "@/lib/recipeParser";
import { useAuth } from "@/context/AuthContext";

type Tab = "comunidad" | "mis-recetas" | "favoritos";

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [recipes, setRecipes]           = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds]   = useState<Set<string>>(new Set());
  const [avgRatings, setAvgRatings]     = useState<Map<string, number>>(new Map());
  const [userRatings, setUserRatings]   = useState<Map<string, number>>(new Map());
  const [tab, setTab]                   = useState<Tab>("comunidad");

  // ── Carga principal ───────────────────────────────────────────────────────

  const loadRecipes = useCallback(async () => {
    const all = await getRecipes();
    setRecipes(all);
  }, []);

  const loadRatings = useCallback(async () => {
    const rows = await getAllRatings();
    // Calcular promedio por receta
    const sums = new Map<string, { total: number; count: number }>();
    for (const { recipe_id, rating } of rows) {
      const cur = sums.get(recipe_id) ?? { total: 0, count: 0 };
      sums.set(recipe_id, { total: cur.total + rating, count: cur.count + 1 });
    }
    const avgs = new Map<string, number>();
    for (const [id, { total, count }] of sums) avgs.set(id, total / count);
    setAvgRatings(avgs);
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    const [favs, ratings] = await Promise.all([
      getFavoriteIds(userId),
      getUserRatings(userId),
    ]);
    setFavoriteIds(favs);
    setUserRatings(ratings);
  }, []);

  useEffect(() => {
    loadRecipes().catch(console.error);
    loadRatings().catch(console.error);
  }, [loadRecipes, loadRatings]);

  useEffect(() => {
    if (user) {
      loadUserData(user.id).catch(console.error);
      setTab("mis-recetas");
    } else {
      setFavoriteIds(new Set());
      setUserRatings(new Map());
      setTab("comunidad");
    }
  }, [user, loadUserData]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  async function handleToggleFavorite(recipeId: string) {
    if (!user) return;
    const wasFav = favoriteIds.has(recipeId);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
    try {
      await toggleFavorite(recipeId, user.id, wasFav);
    } catch {
      // Revertir si falla
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFav ? next.add(recipeId) : next.delete(recipeId);
        return next;
      });
    }
  }

  async function handleRate(recipeId: string, rating: number) {
    if (!user) return;
    const prev = userRatings.get(recipeId) ?? 0;
    // Optimistic update
    setUserRatings((m) => new Map(m).set(recipeId, rating));
    try {
      await upsertRating(recipeId, user.id, rating);
      loadRatings().catch(console.error);
    } catch {
      setUserRatings((m) => {
        const next = new Map(m);
        prev > 0 ? next.set(recipeId, prev) : next.delete(recipeId);
        return next;
      });
    }
  }

  function handleRecipeReady(parsed: ParsedRecipe) {
    sessionStorage.setItem(PENDING_RECIPE_KEY, JSON.stringify(parsed));
    router.push("/recetas/nueva");
  }

  // ── Filtros por tab ───────────────────────────────────────────────────────

  const sorted    = [...recipes].sort((a, b) => b.createdAt - a.createdAt);
  const comunidad = sorted.filter((r) => r.isPublic);
  const misRecetas = sorted.filter((r) => r.userId === user?.id);
  const favoritos  = sorted.filter((r) => favoriteIds.has(r.id));

  const visible =
    tab === "mis-recetas" ? misRecetas :
    tab === "favoritos"   ? favoritos  :
    comunidad;

  const emptyMessages: Record<Tab, string> = {
    "comunidad":   "Aún no hay recetas públicas en la comunidad.",
    "mis-recetas": "Todavía no tenés recetas. ¡Grabá la primera!",
    "favoritos":   "Todavía no guardaste ningún favorito.",
  };

  return (
    <main className="crochet-bg page-enter min-h-screen relative">

      {/* Auth button */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        {user ? (
          <>
            <span className="font-sans text-[11px]" style={{ color: "#8B7355" }}>
              {user.user_metadata?.full_name ?? user.email}
            </span>
            <button
              onClick={signOut}
              className="font-sans text-[11px] px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
              style={{ color: "#8B7355", border: "1px solid #E8DFD0", backgroundColor: "#F7F2EA" }}
            >
              Salir
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            className="font-sans text-[11px] px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ color: "#8B7355", border: "1px solid #E8DFD0", backgroundColor: "#F7F2EA" }}
          >
            Iniciar sesión
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:min-h-screen">

        {/* Panel izquierdo */}
        <div
          className="flex flex-col items-center px-5 pt-12 pb-8 md:sticky md:top-0 md:h-screen md:justify-center md:w-72 md:flex-shrink-0 md:border-r"
          style={{ borderColor: "#EDE6DA" }}
        >
          <div className="rounded-full mb-3" style={{ width: 32, height: 3, backgroundColor: "#C4502A", opacity: 0.4 }} />
          <h1 className="font-heading font-bold tracking-tight" style={{ fontSize: 42, color: "#2C1810", lineHeight: 1 }}>
            Kalicious
          </h1>
          <p className="font-sans text-xs mt-2 uppercase tracking-[0.22em]" style={{ color: "#C9B99A" }}>
            Tu recetario personal
          </p>
          <div className="mt-6">
            <HomeMicRecorder onProcessed={handleRecipeReady} />
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 px-5 md:px-10 pb-24 md:pt-12">

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6" style={{ borderBottom: "1px solid #EDE6DA", paddingBottom: 0 }}>
            <TabButton active={tab === "comunidad"} onClick={() => setTab("comunidad")}>
              Comunidad
            </TabButton>
            {user && (
              <>
                <TabButton active={tab === "mis-recetas"} onClick={() => setTab("mis-recetas")}>
                  Mis recetas
                </TabButton>
                <TabButton active={tab === "favoritos"} onClick={() => setTab("favoritos")}>
                  Favoritos
                </TabButton>
              </>
            )}
          </div>

          {visible.length > 0 ? (
            <>
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] mb-4 pl-1" style={{ color: "#C9B99A" }}>
                {visible.length} {visible.length === 1 ? "receta" : "recetas"}
              </p>
              <div className="card-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    isOwner={r.userId === user?.id}
                    isFavorite={favoriteIds.has(r.id)}
                    onToggleFavorite={handleToggleFavorite}
                    avgRating={avgRatings.get(r.id) ?? 0}
                    userRating={userRatings.get(r.id) ?? 0}
                    onRate={handleRate}
                    canInteract={!!user}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full py-20 md:py-0 md:h-64" style={{ opacity: 0.55 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>🧶</span>
              <p className="font-sans text-sm text-center" style={{ color: "#C9B99A", maxWidth: 220 }}>
                {emptyMessages[tab]}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="font-sans text-xs font-semibold px-4 py-2.5 transition-colors"
      style={{
        color: active ? "#2C1810" : "#B8A898",
        background: "none",
        border: "none",
        cursor: "pointer",
        borderBottom: active ? "2px solid #C4502A" : "2px solid transparent",
        marginBottom: -1,
      }}
    >
      {children}
    </button>
  );
}
