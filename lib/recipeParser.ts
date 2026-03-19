import { Category, CATEGORIES } from "@/lib/types";

// Prompt para crear una receta nueva desde cero
export const RECIPE_SYSTEM_PROMPT = `Eres un asistente de cocina. El usuario dictó una receta en audio y te paso la transcripción.
Analizá el texto y extraé la información estructurada de la receta.
Devolvé ÚNICAMENTE un JSON válido con este formato exacto, sin texto adicional ni bloques de código:
{
  "title": "nombre de la receta",
  "category": "desayuno|almuerzo|cena|postre|snack",
  "time": número_entero_en_minutos,
  "servings": número_entero_de_porciones,
  "ingredients": ["ingrediente 1 con cantidad", "ingrediente 2 con cantidad"],
  "steps": "pasos de preparación ordenados, en un solo texto con saltos de línea entre pasos"
}
Usá SOLO la información que el usuario mencionó. Si no menciona algún dato, usá valores típicos conservadores para ese tipo de receta. No inventes ingredientes ni pasos que el usuario no dictó. La categoría debe ser una de las opciones exactas.`;

// Prompt para editar una receta existente
export const RECIPE_EDIT_SYSTEM_PROMPT = `Eres un asistente de cocina. El usuario tiene una receta guardada y quiere modificarla con instrucciones en voz.
Aplicá SOLO los cambios que el usuario indicó. No inventes ingredientes, pasos ni cantidades que no se mencionaron.
Si un campo no se menciona en la instrucción, conservalo exactamente igual al original.
Devolvé ÚNICAMENTE el JSON completo de la receta modificada, sin texto adicional ni bloques de código:
{
  "title": "...",
  "category": "desayuno|almuerzo|cena|postre|snack",
  "time": número_entero_en_minutos,
  "servings": número_entero_de_porciones,
  "ingredients": ["..."],
  "steps": "..."
}`;

export function buildEditUserMessage(current: ParsedRecipe, instruction: string): string {
  return `Receta actual:\n${JSON.stringify(current, null, 2)}\n\nInstrucción del usuario: "${instruction}"`;
}

// Prompt para editar un campo individual (ingredientes o pasos)
export const FIELD_EDIT_SYSTEM_PROMPT = `Eres un asistente de cocina. El usuario quiere modificar un campo de su receta con instrucciones en voz.
Aplicá SOLO los cambios indicados. No inventes información extra ni agregues contenido que el usuario no mencionó.
Devolvé ÚNICAMENTE el contenido final del campo, sin explicaciones, títulos ni formato adicional.`;

export function buildFieldEditUserMessage(fieldName: string, currentValue: string, instruction: string): string {
  return `Campo a modificar: ${fieldName}\n\nContenido actual:\n${currentValue || "(vacío)"}\n\nInstrucción del usuario: "${instruction}"\n\nDevolvé el contenido completo y actualizado del campo.`;
}

export interface ParsedRecipe {
  title: string;
  category: Category;
  time: number;
  servings: number;
  ingredients: string[];
  steps: string;
}

export function parseRecipeJSON(raw: string): ParsedRecipe {
  const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
  const data = JSON.parse(cleaned);

  return {
    title: typeof data.title === "string" ? data.title : "",
    category: CATEGORIES.some((c) => c.value === data.category)
      ? (data.category as Category)
      : "almuerzo",
    time: Number(data.time) > 0 ? Number(data.time) : 30,
    servings: Number(data.servings) > 0 ? Number(data.servings) : 2,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients.filter(Boolean) : [],
    steps: typeof data.steps === "string" ? data.steps : "",
  };
}

export const PENDING_RECIPE_KEY = "kalicious_pending_recipe";
