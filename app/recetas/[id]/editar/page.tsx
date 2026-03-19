"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";
import { Recipe } from "@/lib/types";
import { getRecipes } from "@/lib/store";

export default function EditarReceta() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipes()
      .then((all) => {
        const found = all.find((r) => r.id === id);
        if (!found) { router.push("/"); return; }
        setRecipe(found);
      })
      .catch(console.error);
  }, [id, router]);

  if (!recipe) return null;

  return (
    <div className="crochet-bg page-enter min-h-screen">
      <nav style={{ backgroundColor: "transparent", borderBottom: "1px solid #E8DFD0" }}>
        <div className="px-5 py-4">
          <Link
            href={`/recetas/${id}`}
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "#B8A898" }}
          >
            <ArrowLeftIcon />
            <span>Volver</span>
          </Link>
        </div>
      </nav>

      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #E8DFD0" }}>
        <div className="px-5 py-7">
          <p className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] mb-1.5" style={{ color: "#C4502A" }}>
            Editar receta
          </p>
          <h1 className="font-heading text-2xl font-bold leading-tight" style={{ color: "#2C1810" }}>
            {recipe.title}
          </h1>
        </div>
      </div>

      <main className="px-5 py-6 pb-16">
        <RecipeForm initial={recipe} />
      </main>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}
