"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import HomeMicRecorder from "@/components/HomeMicRecorder";
import { Recipe } from "@/lib/types";
import { getRecipes, deleteRecipe } from "@/lib/store";
import { ParsedRecipe, PENDING_RECIPE_KEY } from "@/lib/recipeParser";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    getRecipes().then(setRecipes).catch(console.error);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta receta?")) return;
    await deleteRecipe(id);
    getRecipes().then(setRecipes).catch(console.error);
  }

  function handleRecipeReady(parsed: ParsedRecipe) {
    sessionStorage.setItem(PENDING_RECIPE_KEY, JSON.stringify(parsed));
    router.push("/recetas/nueva");
  }

  const sorted = [...recipes].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <main className="crochet-bg page-enter min-h-screen relative">

      {/* Auth button — siempre top-right */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        {user ? (
          <>
            <span
              className="font-sans text-[11px]"
              style={{ color: "#8B7355" }}
            >
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

      {/* Mobile: columna única. Desktop: dos columnas */}
      <div className="flex flex-col md:flex-row md:min-h-screen">

        {/* Panel izquierdo: Logo + Mic */}
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

        {/* Panel derecho: Recetas */}
        <div className="flex-1 px-5 md:px-10 pb-24 md:pt-12">
          {sorted.length > 0 ? (
            <>
              <p className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] mb-4 pl-1" style={{ color: "#C9B99A" }}>
                {sorted.length} {sorted.length === 1 ? "receta guardada" : "recetas guardadas"}
              </p>
              <div className="card-stagger grid grid-cols-1 md:grid-cols-2 gap-4">
                {sorted.map((r) => (
                  <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 h-full py-20 md:py-0 md:h-64" style={{ opacity: 0.55 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>🧶</span>
              <p className="font-sans text-sm text-center" style={{ color: "#C9B99A", maxWidth: 200 }}>
                Tu recetario está vacío. ¡Grabá tu primera receta!
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
