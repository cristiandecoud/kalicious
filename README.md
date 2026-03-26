# Kalicious

A personal recipe manager built with Next.js. Save, organize, and search your recipes — with voice input support and AI-powered features.

## Features

- Create, edit, and delete recipes with categories, ingredients, and steps
- Search and filter by category
- Voice-to-recipe transcription (via AssemblyAI)
- User authentication and per-user recipe visibility (public/private)
- Favorites and ratings
- Offline support via service worker (PWA-ready)

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** + **Tailwind CSS v4**
- **Supabase** — auth and database
- **AssemblyAI** — voice transcription
- **Serwist** — service worker / PWA

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/your-username/kalicious.git
cd kalicious
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
| `ASSEMBLYAI_API_KEY` | [assemblyai.com](https://www.assemblyai.com) |
| `GOOGLE_API_KEY` | [Google AI Studio](https://aistudio.google.com) |

### 3. Run the database migrations

```bash
# Apply migrations using the Supabase CLI
supabase db push
```

Or apply the SQL files in `supabase/migrations/` manually via the Supabase dashboard.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
```

## License

MIT — see [LICENSE](LICENSE).
