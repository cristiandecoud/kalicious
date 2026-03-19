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

**Mis Recetas** is a client-side-only Next.js 16 app (React 19, TypeScript, Tailwind CSS v4). All data is stored in `localStorage` — there is no backend, database, or API.

### Data layer (`lib/`)
- `lib/types.ts` — `Recipe` interface, `Category` union type, `CATEGORIES` array, and `CATEGORY_COLORS` map used throughout the UI.
- `lib/store.ts` — thin wrapper over `localStorage` (`getRecipes`, `saveRecipe`, `deleteRecipe`, `generateId`). Guard against SSR with `typeof window === "undefined"`.

### Routing (`app/`)
All pages are client components (`"use client"`). The app uses the Next.js App Router:
- `/` — recipe list with search and category filter (`app/page.tsx`)
- `/recetas/nueva` — create form (`app/recetas/nueva/page.tsx`)
- `/recetas/[id]` — recipe detail (`app/recetas/[id]/page.tsx`)
- `/recetas/[id]/editar` — edit form (`app/recetas/[id]/editar/page.tsx`)

### Components (`components/`)
- `RecipeCard` — card shown in the grid; links to detail and edit, fires `onDelete` callback.
- `RecipeForm` — shared create/edit form. Accepts an optional `initial` prop (existing `Recipe`) to populate fields for editing. On submit, calls `saveRecipe` then navigates to the detail page.

### UI conventions
- Orange (`orange-500`) is the primary brand color.
- Inline SVG icons are defined as local functions at the bottom of the file that uses them.
- Form fields use a local `input()` helper function and a `Field` wrapper component, both defined at the bottom of `RecipeForm.tsx`.
- Ingredients are stored as `string[]` but edited as a newline-separated textarea.
