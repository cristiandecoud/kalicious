import { Recipe } from "./types";
import { supabase, rowToRecipe, recipeToRow, RecipeRow } from "./supabase";

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as RecipeRow[]).map(rowToRecipe);
}

export async function createRecipe(recipe: Omit<Recipe, "id">): Promise<string> {
  const { id: _, ...row } = recipeToRow({ ...recipe, id: "" });
  const { data, error } = await supabase
    .from("recipes")
    .insert(row)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update(recipeToRow(recipe))
    .eq("id", recipe.id);

  if (error) throw new Error(error.message);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}
