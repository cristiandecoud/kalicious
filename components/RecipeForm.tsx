"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Recipe, Category, CATEGORIES } from "@/lib/types";
import { createRecipe, updateRecipe } from "@/lib/store";
import { askLLM } from "@/lib/llm/service";
import { DEFAULT_PROVIDER } from "@/lib/llm/registry";
import {
  RECIPE_SYSTEM_PROMPT,
  RECIPE_EDIT_SYSTEM_PROMPT,
  FIELD_EDIT_SYSTEM_PROMPT,
  buildEditUserMessage,
  buildFieldEditUserMessage,
  parseRecipeJSON,
  PENDING_RECIPE_KEY,
} from "@/lib/recipeParser";
import MicButton from "@/components/MicButton";

interface Props {
  initial?: Recipe;
}

type DictationStatus = "idle" | "processing" | "done" | "error";

export default function RecipeForm({ initial }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "almuerzo");
  const [time, setTime] = useState(initial?.time?.toString() ?? "");
  const [servings, setServings] = useState(initial?.servings?.toString() ?? "");
  const [ingredientsText, setIngredientsText] = useState(initial?.ingredients?.join("\n") ?? "");
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [dictationStatus, setDictationStatus] = useState<DictationStatus>("idle");
  const [dictationError, setDictationError] = useState("");
  const [ingredientsProcessing, setIngredientsProcessing] = useState(false);
  const [stepsProcessing, setStepsProcessing] = useState(false);

  // Lee datos pre-llenados desde el home (solo para recetas nuevas)
  useEffect(() => {
    if (initial) return;
    const raw = sessionStorage.getItem(PENDING_RECIPE_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_RECIPE_KEY);
    try {
      const data = JSON.parse(raw);
      if (data.title) setTitle(data.title);
      if (data.category) setCategory(data.category);
      if (data.time) setTime(String(data.time));
      if (data.servings) setServings(String(data.servings));
      if (data.ingredients?.length) setIngredientsText(data.ingredients.join("\n"));
      if (data.steps) setSteps(data.steps);
    } catch { /* datos inválidos, ignorar */ }
  }, [initial]);

  async function handleTranscript(text: string) {
    setTranscript(text);
    setDictationStatus("processing");
    setDictationError("");
    try {
      let raw: string;
      if (initial) {
        // Modo edición: enviamos la receta actual + instrucción para que el LLM sepa qué modificar
        const currentRecipe = {
          title,
          category,
          time: Number(time) || 0,
          servings: Number(servings) || 0,
          ingredients: ingredientsText.split("\n").map((l) => l.trim()).filter(Boolean),
          steps,
        };
        raw = await askLLM(DEFAULT_PROVIDER, buildEditUserMessage(currentRecipe, text), {
          system: RECIPE_EDIT_SYSTEM_PROMPT,
        });
      } else {
        raw = await askLLM(DEFAULT_PROVIDER, text, { system: RECIPE_SYSTEM_PROMPT });
      }
      const data = parseRecipeJSON(raw);
      setTitle(data.title);
      setCategory(data.category);
      setTime(String(data.time));
      setServings(String(data.servings));
      setIngredientsText(data.ingredients.join("\n"));
      setSteps(data.steps);
      setDictationStatus("done");
    } catch {
      setDictationError("No se pudo procesar. Podés completar los campos manualmente.");
      setDictationStatus("error");
    }
  }

  async function handleIngredientsTranscript(text: string) {
    setIngredientsProcessing(true);
    try {
      const result = await askLLM(
        DEFAULT_PROVIDER,
        buildFieldEditUserMessage("ingredientes (uno por línea, sin numeración ni viñetas)", ingredientsText, text),
        { system: FIELD_EDIT_SYSTEM_PROMPT }
      );
      setIngredientsText(result.trim());
    } catch {
      // Si falla el LLM, agregamos el texto crudo como fallback
      setIngredientsText((p) => p ? `${p}\n${text}` : text);
    } finally {
      setIngredientsProcessing(false);
    }
  }

  async function handleStepsTranscript(text: string) {
    setStepsProcessing(true);
    try {
      const result = await askLLM(
        DEFAULT_PROVIDER,
        buildFieldEditUserMessage("preparación (texto corrido con saltos de línea entre pasos)", steps, text),
        { system: FIELD_EDIT_SYSTEM_PROMPT }
      );
      setSteps(result.trim());
    } catch {
      setSteps((p) => p ? `${p} ${text}` : text);
    } finally {
      setStepsProcessing(false);
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "El nombre es obligatorio.";
    if (!time || Number(time) < 1) e.time = "Ingresa un tiempo válido.";
    if (!servings || Number(servings) < 1) e.servings = "Ingresa las porciones.";
    if (!ingredientsText.trim()) e.ingredients = "Agrega al menos un ingrediente.";
    if (!steps.trim()) e.steps = "Describe la preparación.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || saving) return;
    setSaving(true);
    const base = {
      title: title.trim(),
      category,
      time: Number(time),
      servings: Number(servings),
      ingredients: ingredientsText.split("\n").map((l) => l.trim()).filter(Boolean),
      steps: steps.trim(),
      createdAt: initial?.createdAt ?? Date.now(),
    };
    try {
      if (initial) {
        await updateRecipe({ ...base, id: initial.id });
        router.push(`/recetas/${initial.id}`);
      } else {
        const id = await createRecipe(base);
        router.push(`/recetas/${id}`);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      setSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">

      {/* Panel de re-dictado (opcional, secundario) */}
      <div
        className="rounded-[20px] p-5 space-y-3"
        style={{ backgroundColor: "#F7F2EA", border: "1px solid #E8DFD0" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: "#8B7355" }}>
              {initial ? "Re-dictar receta" : "Ajustar con voz"}
            </p>
            <p className="text-xs font-sans mt-0.5" style={{ color: "#C9B99A" }}>
              Grabá para completar o corregir los campos
            </p>
          </div>
          <MicButton onTranscript={handleTranscript} disabled={dictationStatus === "processing"} />
        </div>

        {transcript && (
          <p className="text-xs font-sans leading-relaxed rounded-xl px-3 py-2.5 italic" style={{ backgroundColor: "#fff", color: "#8B7355", border: "1px solid #E8DFD0" }}>
            &ldquo;{transcript}&rdquo;
          </p>
        )}

        {dictationStatus === "processing" && (
          <div className="controls-enter flex items-center gap-2">
            <SpinnerIcon />
            <p className="text-xs font-sans" style={{ color: "#8B7355" }}>Procesando con IA…</p>
          </div>
        )}
        {dictationStatus === "done" && (
          <div className="controls-enter flex items-center gap-2">
            <CheckIcon />
            <p className="text-xs font-sans" style={{ color: "#6B8F6B" }}>Campos actualizados. Revisá y ajustá.</p>
          </div>
        )}
        {dictationStatus === "error" && (
          <p className="text-xs font-sans" style={{ color: "#EF4444" }}>{dictationError}</p>
        )}
      </div>

      {/* Nombre */}
      <Field label="Nombre de la receta" error={errors.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Tacos de pollo"
          className={inputClass(errors.title)}
        />
      </Field>

      {/* Categoría, Tiempo, Porciones */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Categoría">
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass()}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Minutos" error={errors.time}>
          <input type="number" value={time} onChange={(e) => setTime(e.target.value)} placeholder="30" min="1" className={inputClass(errors.time)} />
        </Field>
        <Field label="Porciones" error={errors.servings}>
          <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" min="1" className={inputClass(errors.servings)} />
        </Field>
      </div>

      {/* Ingredientes */}
      <Field
        label="Ingredientes"
        hint="Un ingrediente por línea"
        error={errors.ingredients}
        action={<MicButton onTranscript={handleIngredientsTranscript} disabled={ingredientsProcessing} />}
      >
        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={5}
          placeholder={"2 tazas de harina\n1 huevo\n1 taza de leche"}
          className={inputClass(errors.ingredients)}
        />
      </Field>

      {/* Preparación */}
      <Field
        label="Preparación"
        error={errors.steps}
        action={<MicButton onTranscript={handleStepsTranscript} disabled={stepsProcessing} />}
      >
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={6}
          placeholder="Describe los pasos de la receta..."
          className={inputClass(errors.steps)}
        />
      </Field>

      {/* Acciones */}
      <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid #F0E9DC" }}>
        <button
          type="submit"
          disabled={saving}
          className="w-full font-sans font-semibold text-sm text-white rounded-full tracking-wide py-3.5 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#C4502A" }}
        >
          {saving ? "Guardando…" : initial ? "Guardar cambios" : "Guardar receta"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full font-sans font-medium text-sm rounded-full py-3"
          style={{ color: "#8B7355" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function inputClass(error?: string) {
  const base = "w-full rounded-xl border px-4 py-3 text-sm font-sans transition outline-none";
  const normal = "border-[#E8DFD0] bg-[#FDFAF7] text-[#2C1810] placeholder-[#C9B99A]";
  const err = "border-red-300 bg-white text-[#2C1810] placeholder-[#C9B99A]";
  return `${base} ${error ? err : normal}`;
}

function Field({
  label, hint, error, action, children,
}: {
  label: string; hint?: string; error?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em]" style={{ color: "#8B7355" }}>
          {label}
        </label>
        <div className="flex items-center gap-3">
          {hint && <span className="text-xs font-sans" style={{ color: "#C9B99A" }}>{hint}</span>}
          {action}
        </div>
      </div>
      {children}
      {error && <p className="text-xs font-sans" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2.5">
      <path strokeLinecap="round" d="M12 2a10 10 0 010 20A10 10 0 0112 2" opacity=".3" />
      <path strokeLinecap="round" d="M12 2a10 10 0 0110 10">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B8F6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
