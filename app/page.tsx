"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import HomeMicRecorder from "@/components/HomeMicRecorder";
import { Recipe } from "@/lib/types";
import { getRecipes, deleteRecipe } from "@/lib/store";
import { ParsedRecipe, PENDING_RECIPE_KEY } from "@/lib/recipeParser";

export default function Home() {
  const router = useRouter();
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
    <main className="crochet-bg page-enter px-5 pt-12 pb-24 flex flex-col items-center min-h-screen">

      {/* Logo */}
      <div className="flex flex-col items-center mb-2">
        <div className="rounded-full mb-3" style={{ width: 32, height: 3, backgroundColor: "#C4502A", opacity: 0.4 }} />
        <h1 className="font-heading font-bold tracking-tight" style={{ fontSize: 42, color: "#2C1810", lineHeight: 1 }}>
          Kalicious
        </h1>
        <p className="font-sans text-xs mt-2 uppercase tracking-[0.22em]" style={{ color: "#C9B99A" }}>
          Tu recetario personal
        </p>
      </div>

      <HomeMicRecorder onProcessed={handleRecipeReady} />

      {/* Recetas */}
      {sorted.length > 0 ? (
        <div className="w-full">
          <p className="text-[11px] font-sans font-bold uppercase tracking-[0.22em] mb-4 pl-1" style={{ color: "#C9B99A" }}>
            {sorted.length} {sorted.length === 1 ? "receta guardada" : "recetas guardadas"}
          </p>
          <div className="card-stagger flex flex-col gap-4">
            {sorted.map((r) => (
              <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-4" style={{ opacity: 0.55 }}>
          <span style={{ fontSize: 40, lineHeight: 1 }}>🧶</span>
          <p className="font-sans text-sm text-center" style={{ color: "#C9B99A", maxWidth: 200 }}>
            Tu recetario está vacío. ¡Grabá tu primera receta!
          </p>
        </div>
      )}

    </main>
  );
}
