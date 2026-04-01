"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import RecipeForm from "@/components/RecipeForm";
import { Recipe } from "@/lib/types";
import { getRecipeById } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeftIcon } from "@/components/icons";

export default function EditarReceta() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    getRecipeById(id)
      .then((found) => {
        if (!found) { router.push("/"); return; }
        if (found.userId !== user?.id) { router.push(`/recetas/${id}`); return; }
        setRecipe(found);
      })
      .catch(console.error);
  }, [id, router, user]);

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

