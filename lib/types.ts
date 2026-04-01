export type Category = "desayuno" | "almuerzo" | "cena" | "postre" | "snack";

export interface Recipe {
  id: string;
  title: string;
  category: Category;
  time: number;
  servings: number;
  ingredients: string[];
  steps: string;
  createdAt: number;
  userId: string;
  isPublic: boolean;
}

export interface RecipeListItem extends Recipe {
  isFavorite: boolean;
  avgRating: number;
  userRating: number;
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "postre", label: "Postre" },
  { value: "snack", label: "Snack" },
];

/** Colores para dots/badges en tarjetas y listas. */
export const CATEGORY_HEX_COLORS: Record<Category, string> = {
  desayuno: "#E8C97A",
  almuerzo: "#9BBD9B",
  cena:     "#8AAEC4",
  postre:   "#D4A0B5",
  snack:    "#B5A3CC",
};

/** Colores de acento para la página de detalle. */
export const CATEGORY_ACCENT_COLORS: Record<Category, string> = {
  desayuno: "#D4863A",
  almuerzo: "#6B8F6B",
  cena:     "#4A6B8A",
  postre:   "#C4628A",
  snack:    "#8B6BAE",
};

