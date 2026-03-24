"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import HomeMicRecorder from "@/components/HomeMicRecorder";
import RecipeList, { RecipeTab } from "@/components/RecipeList";
import { RecipeListItem } from "@/lib/types";
import {
  toggleFavorite,
  upsertRating,
} from "@/lib/store";
import { usePageSize } from "@/hooks/usePageSize";
import { ParsedRecipe, PENDING_RECIPE_KEY } from "@/lib/recipeParser";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

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

  const [recipes, setRecipes]      = useState<RecipeListItem[]>([]);
  const [total, setTotal]          = useState(0);
  const [tab, setTab]               = useState<RecipeTab>("comunidad");
  const [query, setQuery]           = useState("");
  const [page, setPage]             = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const pageSize                    = usePageSize();
  const effectiveTab                = user ? tab : "comunidad";

  // ── Carga de recetas (server-side, con debounce en búsqueda) ──────────────

  useEffect(() => {
    if (authLoading || !pageSize) return;
    const controller = new AbortController();
    const t = setTimeout(() => {
      supabase.auth.getSession()
        .then(async ({ data: { session } }) => {
          const params = new URLSearchParams({
            tab: effectiveTab,
            page: String(page),
            pageSize: String(pageSize),
          });

          if (query.trim()) params.set("query", query.trim());
          if (user?.id) params.set("userId", user.id);

          const res = await fetch(`/api/recipes?${params.toString()}`, {
            headers: session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : undefined,
            cache: "no-store",
            signal: controller.signal,
          });

          if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.error ?? "No se pudo cargar el listado");
          }

          const data = await res.json() as { recipes: RecipeListItem[]; total: number };
          setRecipes(data.recipes);
          setTotal(data.total);
        })
        .catch((error) => {
          if ((error as Error).name !== "AbortError") console.error(error);
        });
    }, query ? 300 : 0);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [authLoading, effectiveTab, page, pageSize, query, refreshKey, user?.id]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  async function handleToggleFavorite(recipeId: string) {
    if (!user) return;
    const currentRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (!currentRecipe) return;

    const wasFav = currentRecipe.isFavorite;
    setRecipes((prev) => prev.map((recipe) => (
      recipe.id === recipeId
        ? { ...recipe, isFavorite: !wasFav }
        : recipe
    )));
    try {
      await toggleFavorite(recipeId, user.id, wasFav);
      setRefreshKey((value) => value + 1);
    } catch {
      setRecipes((prev) => prev.map((recipe) => (
        recipe.id === recipeId
          ? { ...recipe, isFavorite: wasFav }
          : recipe
      )));
    }
  }

  async function handleRate(recipeId: string, rating: number) {
    if (!user) return;
    const currentRecipe = recipes.find((recipe) => recipe.id === recipeId);
    if (!currentRecipe) return;

    const prev = currentRecipe.userRating;
    setRecipes((prevRecipes) => prevRecipes.map((recipe) => (
      recipe.id === recipeId
        ? { ...recipe, userRating: rating }
        : recipe
    )));
    try {
      await upsertRating(recipeId, user.id, rating);
      setRefreshKey((value) => value + 1);
    } catch {
      setRecipes((prevRecipes) => prevRecipes.map((recipe) => (
        recipe.id === recipeId
          ? { ...recipe, userRating: prev }
          : recipe
      )));
    }
  }

  function handleRecipeReady(parsed: ParsedRecipe) {
    sessionStorage.setItem(PENDING_RECIPE_KEY, JSON.stringify(parsed));
    router.push("/recetas/nueva");
  }

  function handleTabChange(nextTab: RecipeTab) {
    setTab(nextTab);
    setPage(1);
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    setPage(1);
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
          onQueryChange={handleQueryChange}
          tab={effectiveTab}
          onTabChange={handleTabChange}
          showUserTabs={!!user}
          userId={user?.id}
          onToggleFavorite={handleToggleFavorite}
          onRate={handleRate}
        />
      </div>
    </main>
  );
}
