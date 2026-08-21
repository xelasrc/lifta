# Lifta

Workout tracker built as an installable PWA. Next.js, TypeScript, Supabase.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4**
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) for auth and data — all reads/writes go straight to Postgres, scoped per user via Row Level Security
- Web app manifest + icons for installability (Add to Home Screen)

## Getting started

1. Copy the env template and fill in your Supabase project credentials:

   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## Project layout

- `src/app/` — routes (App Router)
- `src/components/` — shared UI components
- `src/lib/supabase/` — browser, server, and middleware Supabase clients
- `src/lib/db/` — Supabase query functions and domain types for workouts, sets, and exercises
- `public/manifest.webmanifest`, `public/icons/` — PWA assets (icons are placeholders — swap in real branding)
