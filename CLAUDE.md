# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

There are no tests configured in this project.

## Architecture

**Kalicious** is a Next.js 16 recipe manager (React 19, TypeScript, Tailwind CSS v4) with Supabase as the backend (auth + PostgreSQL database). It supports user authentication, public/private recipes, favorites, ratings, voice input, and AI-powered recipe parsing.

### Data layer (`lib/`)
- `lib/types.ts` — `Recipe` / `RecipeListItem` interfaces, `Category` union type, `CATEGORIES` array, and category color maps (`CATEGORY_HEX_COLORS`, `CATEGORY_ACCENT_COLORS`).
- `lib/store.ts` — Supabase query functions: `getRecipesPage` (paginated), `getRecipeById`, `createRecipe`, `updateRecipe`, `deleteRecipe`, `toggleFavorite`, `upsertRating`.
- `lib/supabase.ts` — Supabase client, DB type definitions, and row↔model mapper functions.
- `lib/recipeParser.ts` — LLM prompts and JSON parsing for voice-to-recipe conversion.
- `lib/llm/` — Multi-provider LLM abstraction (Google, Anthropic, OpenAI, OpenRouter, DeepSeek).

### Routing (`app/`)
Pages are client components (`"use client"`). The app uses the Next.js App Router:
- `/` — home with recipe tabs (comunidad / mis recetas / favoritos), search, pagination, and mic recorder (`app/page.tsx`)
- `/auth` — login/signup with email and Google OAuth (`app/auth/page.tsx`)
- `/recetas/nueva` — create form (`app/recetas/nueva/page.tsx`)
- `/recetas/[id]` — recipe detail with print/PDF support (`app/recetas/[id]/page.tsx`)
- `/recetas/[id]/editar` — edit form (`app/recetas/[id]/editar/page.tsx`)

### API Routes (`app/api/`)
- `/api/recipes` — server-side paginated recipe fetching (used by the home page)
- `/api/llm` — proxy for LLM calls (keeps API keys server-side); supports multiple providers
- `/api/transcribe` — audio file → text via AssemblyAI
- `/api/icons/[size]` — dynamic PWA icon generation (192, 512)

### Components (`components/`)
- `RecipeCard` — card shown in the grid; handles favorites and cupcake rating.
- `RecipeForm` — shared create/edit form; supports voice dictation and LLM field refinement.
- `RecipeList` — paginated grid with tabs, search bar, and empty states.
- `HomeMicRecorder` — large mic button on the home page for voice-to-recipe.
- `MicButton` — compact mic button used inside form fields.
- `components/icons.tsx` — all shared SVG icon components (single source of truth).
- `components/ui/Field.tsx` — shared form field wrapper (label + input + error message).

### Context & Hooks
- `context/AuthContext.tsx` — Supabase auth state (user, loading, signOut).
- `hooks/useRecorder.ts` — audio recording lifecycle + transcription.
- `hooks/usePageSize.ts` — responsive page size (mobile: 6, desktop: 12).

### UI conventions
- Earthy color scheme: terracotta (`#C4502A`), warm brown (`#2C1810`), cream (`#FAF7F2`).
- CSS variables defined in `app/globals.css` under `@theme inline`.
- Category colors are centralized in `lib/types.ts` (`CATEGORY_HEX_COLORS`, `CATEGORY_ACCENT_COLORS`).
- SVG icons are in `components/icons.tsx` — import from there, don't define inline.
- Form fields use the shared `Field` component from `components/ui/Field.tsx`.
- Ingredients are stored as `string[]` but edited as a newline-separated textarea.
