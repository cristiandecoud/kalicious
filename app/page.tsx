"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import HomeMicRecorder from "@/components/HomeMicRecorder";
import RecipeList, { RecipeTab } from "@/components/RecipeList";
import { Recipe } from "@/lib/types";
import {
  getRecipesPage,
  getFavoriteIds, toggleFavorite,
  getAllRatings, getUserRatings, upsertRating,
} from "@/lib/store";
import { usePageSize } from "@/hooks/usePageSize";
import { ParsedRecipe, PENDING_RECIPE_KEY } from "@/lib/recipeParser";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  const [recipes, setRecipes]         = useState<Recipe[]>([]);
  const [total, setTotal]             = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [avgRatings, setAvgRatings]   = useState<Map<string, number>>(new Map());
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());
  const [tab, setTab]                 = useState<RecipeTab>("comunidad");
  const [query, setQuery]             = useState("");
  const [page, setPage]               = useState(1);
  const pageSize                      = usePageSize();

  // ── Resetear página al cambiar tab o búsqueda ─────────────────────────────

  useEffect(() => { setPage(1); }, [tab, query]);

  // ── Carga de recetas (server-side, con debounce en búsqueda) ──────────────

  useEffect(() => {
    const favIds = [...favoriteIds];
    const t = setTimeout(() => {
      getRecipesPage({ tab, userId: user?.id, favoriteIds: favIds, query, page, pageSize })
        .then(({ recipes, total }) => { setRecipes(recipes); setTotal(total); })
        .catch(console.error);
    }, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [tab, query, page, pageSize, user?.id, favoriteIds]);

  // ── Carga de ratings ──────────────────────────────────────────────────────

  const loadRatings = useCallback(async () => {
    const rows = await getAllRatings();
    const sums = new Map<string, { total: number; count: number }>();
    for (const { recipe_id, rating } of rows) {
      const cur = sums.get(recipe_id) ?? { total: 0, count: 0 };
      sums.set(recipe_id, { total: cur.total + rating, count: cur.count + 1 });
    }
    const avgs = new Map<string, number>();
    for (const [id, { total, count }] of sums) avgs.set(id, total / count);
    setAvgRatings(avgs);
  }, []);

  useEffect(() => {
    loadRatings().catch(console.error);
  }, [loadRatings]);

  // ── Datos del usuario ─────────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      Promise.all([getFavoriteIds(user.id), getUserRatings(user.id)])
        .then(([favs, ratings]) => { setFavoriteIds(favs); setUserRatings(ratings); })
        .catch(console.error);
      setTab("mis-recetas");
    } else {
      setFavoriteIds(new Set());
      setUserRatings(new Map());
      setTab("comunidad");
    }
  }, [user]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  async function handleToggleFavorite(recipeId: string) {
    if (!user) return;
    const wasFav = favoriteIds.has(recipeId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
    try {
      await toggleFavorite(recipeId, user.id, wasFav);
    } catch {
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

  return (
    <main className="crochet-bg page-enter min-h-screen relative">

      {/* Auth button */}
      <div className="absolute top-5 right-5 z-10">
        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="font-sans text-[11px] px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
              style={{ color: "#5C3D28", border: "1px solid #C8B49A", backgroundColor: "#F7F2EA" }}
            >
              {user.user_metadata?.full_name ?? user.email}
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 mt-1 rounded-xl shadow-md py-1 min-w-[120px]"
                style={{ backgroundColor: "#F7F2EA", border: "1px solid #C8B49A" }}
              >
                <button
                  onClick={() => { setUserMenuOpen(false); signOut(); }}
                  className="w-full text-left font-sans text-[11px] px-4 py-2 hover:opacity-70"
                  style={{ color: "#8B7355" }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            className="font-sans text-[11px] px-3 py-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ color: "#5C3D28", border: "1px solid #C8B49A", backgroundColor: "#F7F2EA" }}
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
          <p className="font-sans text-xs mt-2 uppercase tracking-[0.22em]" style={{ color: "#9B8268" }}>
            Tu recetario personal
          </p>
          <div className="mt-6">
            <HomeMicRecorder onProcessed={handleRecipeReady} />
          </div>
        </div>

        {/* Panel derecho */}
        <RecipeList
          recipes={recipes}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          query={query}
          onQueryChange={setQuery}
          tab={tab}
          onTabChange={setTab}
          showUserTabs={!!user}
          userId={user?.id}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          avgRatings={avgRatings}
          userRatings={userRatings}
          onRate={handleRate}
        />
      </div>
    </main>
  );
}
