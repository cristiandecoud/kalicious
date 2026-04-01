import { createClient } from "@supabase/supabase-js";
import type { Recipe } from "@/lib/types";

// Tipos para la tabla en Postgres
export type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  is_public: boolean;
  preferred_categories: string[];
  created_at: string;
  updated_at: string | null;
};

export type RecipeRow = {
  id: string; // uuid en Postgres
  title: string;
  category: string;
  time: number;
  servings: number;
  ingredients: string[];
  steps: string;
  created_at: number;
  user_id: string;
  is_public: boolean;
};

export type FavoriteRow = {
  user_id: string;
  recipe_id: string;
};

export type RatingRow = {
  user_id: string;
  recipe_id: string;
  rating: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at"> & { created_at?: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      recipes: {
        Row: RecipeRow;
        Insert: Omit<RecipeRow, "id"> & { id?: string };
        Update: Partial<RecipeRow>;
        Relationships: [];
      };
      recipe_favorites: {
        Row: FavoriteRow;
        Insert: FavoriteRow;
        Update: Partial<FavoriteRow>;
        Relationships: [];
      };
      recipe_ratings: {
        Row: RatingRow;
        Insert: RatingRow;
        Update: Partial<RatingRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseClient(accessToken?: string) {
  return createClient<Database>(url, key, {
    auth: { flowType: "implicit" },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export const supabase = createSupabaseClient();

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
    userId:      row.user_id,
    isPublic:    row.is_public,
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
    user_id:     recipe.userId,
    is_public:   recipe.isPublic,
  };
}
