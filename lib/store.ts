import { SupabaseClient } from "@supabase/supabase-js";
import { Recipe, RecipeListItem } from "./types";
import { Database, supabase, rowToRecipe, recipeToRow, RecipeRow } from "./supabase";

// ─── Paginado server-side ──────────────────────────────────────────────────────

export type RecipesPageParams = {
  tab: "comunidad" | "mis-recetas" | "favoritos";
  userId?: string;
  query?: string;
  page: number;
  pageSize: number;
};

export async function getRecipesPage(
  params: RecipesPageParams,
  client: SupabaseClient<Database> = supabase
): Promise<{ recipes: RecipeListItem[]; total: number }> {
  const { tab, userId, query, page, pageSize } = params;
  const from = (page - 1) * pageSize;
  const to   = from + pageSize - 1;
  let favoriteIds: string[] = [];

  if (userId) {
    const { data: favoritesData, error: favoritesError } = await client
      .from("recipe_favorites")
      .select("recipe_id")
      .eq("user_id", userId);

    if (favoritesError) throw new Error(favoritesError.message);
    favoriteIds = (favoritesData ?? []).map((row: { recipe_id: string }) => row.recipe_id);
  }

  let q = client
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

  const recipes = ((data ?? []) as RecipeRow[]).map(rowToRecipe);
  const favoriteSet = new Set(favoriteIds);

  // Fetch ratings for only the recipes in this page
  const avgRatings = new Map<string, number>();
  const userRatings = new Map<string, number>();

  if (recipes.length > 0) {
    const recipeIds = recipes.map((r) => r.id);
    const { data: ratingsData, error: ratingsError } = await client
      .from("recipe_ratings")
      .select("recipe_id, user_id, rating")
      .in("recipe_id", recipeIds);

    if (ratingsError) throw new Error(ratingsError.message);

    const sums = new Map<string, { total: number; count: number }>();
    for (const r of (ratingsData ?? []) as { recipe_id: string; user_id: string; rating: number }[]) {
      const cur = sums.get(r.recipe_id) ?? { total: 0, count: 0 };
      sums.set(r.recipe_id, { total: cur.total + r.rating, count: cur.count + 1 });
      if (userId && r.user_id === userId) userRatings.set(r.recipe_id, r.rating);
    }
    for (const [id, { total, count }] of sums) avgRatings.set(id, total / count);
  }

  return {
    recipes: recipes.map((recipe) => ({
      ...recipe,
      isFavorite: favoriteSet.has(recipe.id),
      avgRating: avgRatings.get(recipe.id) ?? 0,
      userRating: userRatings.get(recipe.id) ?? 0,
    })),
    total: count ?? 0,
  };
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return rowToRecipe(data as RecipeRow);
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
  const recipeRow = recipeToRow({ ...recipe, id: "", userId, isPublic: recipe.isPublic ?? false });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...row } = recipeRow;
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

/** Votos del usuario actual (para mostrar su voto activo). */
export async function getUserRatings(userId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("recipe_ratings")
    .select("recipe_id, rating")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { recipe_id: string; rating: number }[]) map.set(r.recipe_id, r.rating);
  return map;
}

/** Inserta o actualiza el voto del usuario para una receta. */
export async function upsertRating(recipeId: string, userId: string, rating: number): Promise<void> {
  const { error } = await supabase
    .from("recipe_ratings")
    .upsert({ user_id: userId, recipe_id: recipeId, rating }, { onConflict: "user_id,recipe_id" });

  if (error) throw new Error(error.message);
}
