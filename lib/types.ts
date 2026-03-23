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

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "desayuno", label: "Desayuno" },
  { value: "almuerzo", label: "Almuerzo" },
  { value: "cena", label: "Cena" },
  { value: "postre", label: "Postre" },
  { value: "snack", label: "Snack" },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  desayuno: "bg-yellow-100 text-yellow-800",
  almuerzo: "bg-green-100 text-green-800",
  cena: "bg-blue-100 text-blue-800",
  postre: "bg-pink-100 text-pink-800",
  snack: "bg-purple-100 text-purple-800",
};
