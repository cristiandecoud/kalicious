import { createClient } from "@supabase/supabase-js";
import type { Recipe } from "@/lib/types";

// Tipos para la tabla en Postgres
export type RecipeRow = {
  id: string;
  title: string;
  category: string;
  time: number;
  servings: number;
  ingredients: string[];
  steps: string;
  created_at: number;
};

export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: RecipeRow;
        Insert: RecipeRow;
        Update: Partial<RecipeRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(url, key);

// Mappers entre la fila de Postgres y el tipo Recipe de la app
export function rowToRecipe(row: RecipeRow): Recipe {
  return {
    id:          row.id,
    title:       row.title,
    category:    row.category as Recipe["category"],
    time:        row.time,
    servings:    row.servings,
    ingredients: row.ingredients,
    steps:       row.steps,
    createdAt:   row.created_at,
  };
}

export function recipeToRow(recipe: Recipe): RecipeRow {
  return {
    id:          recipe.id,
    title:       recipe.title,
    category:    recipe.category,
    time:        recipe.time,
    servings:    recipe.servings,
    ingredients: recipe.ingredients,
    steps:       recipe.steps,
    created_at:  recipe.createdAt,
  };
}
