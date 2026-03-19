import { Recipe } from "./types";
import { supabase, rowToRecipe, recipeToRow } from "./supabase";

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToRecipe);
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .upsert(recipeToRow(recipe), { onConflict: "id" });

  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
