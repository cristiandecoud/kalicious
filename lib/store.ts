import { Recipe } from "./types";
import { supabase, rowToRecipe, recipeToRow, RecipeRow } from "./supabase";

// ─── Paginado server-side ──────────────────────────────────────────────────────

export type RecipesPageParams = {
  tab: "comunidad" | "mis-recetas" | "favoritos";
  userId?: string;
  favoriteIds?: string[];
  query?: string;
  page: number;
  pageSize: number;
};

export async function getRecipesPage(
  params: RecipesPageParams
): Promise<{ recipes: Recipe[]; total: number }> {
  const { tab, userId, favoriteIds = [], query, page, pageSize } = params;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;

  // eslint-disable-next-line prefer-const
  let q = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (tab === "comunidad")   q = q.eq("is_public", true);
  if (tab === "mis-recetas") q = q.eq("user_id", userId!);
  if (tab === "favoritos")   q = favoriteIds.length
    ? q.in("id", favoriteIds)
    : q.in("id", ["__none__"]); // lista vacía sin romper la query

  if (query?.trim()) q = q.ilike("title", `%${query.trim()}%`);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);

  return {
    recipes: ((data ?? []) as RecipeRow[]).map(rowToRecipe),
    total: count ?? 0,
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as RecipeRow[]).map(rowToRecipe);
}

export async function createRecipe(recipe: Omit<Recipe, "id">, userId: string): Promise<string> {
  const { id: _, ...row } = recipeToRow({ ...recipe, id: "", userId, isPublic: recipe.isPublic ?? false });
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

// ─── Favoritos ────────────────────────────────────────────────────────────────

export async function getFavoriteIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("recipe_favorites")
    .select("recipe_id")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r: { recipe_id: string }) => r.recipe_id));
}

/** Agrega o quita un favorito. Devuelve `true` si quedó como favorito. */
export async function toggleFavorite(recipeId: string, userId: string, currentlyFavorited: boolean): Promise<boolean> {
  if (currentlyFavorited) {
    const { error } = await supabase
      .from("recipe_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);
    if (error) throw new Error(error.message);
    return false;
  } else {
    const { error } = await supabase
      .from("recipe_favorites")
      .insert({ user_id: userId, recipe_id: recipeId });
    if (error) throw new Error(error.message);
    return true;
  }
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export type RatingRow = { recipe_id: string; rating: number };

/** Todos los votos de todas las recetas visibles (para calcular promedios). */
export async function getAllRatings(): Promise<RatingRow[]> {
  const { data, error } = await supabase
    .from("recipe_ratings")
    .select("recipe_id, rating");

  if (error) throw new Error(error.message);
  return (data ?? []) as RatingRow[];
}

/** Votos del usuario actual (para mostrar su voto activo). */
export async function getUserRatings(userId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("recipe_ratings")
    .select("recipe_id, rating")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as RatingRow[]) map.set(r.recipe_id, r.rating);
  return map;
}

/** Inserta o actualiza el voto del usuario para una receta. */
export async function upsertRating(recipeId: string, userId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from("recipe_ratings")
    .upsert({ user_id: userId, recipe_id: recipeId, rating }, { onConflict: "user_id,recipe_id" });

  if (error) throw new Error(error.message);
}
