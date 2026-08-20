# Lifta

Offline-first workout tracker built as an installable PWA. Next.js, TypeScript, Supabase.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS 4**
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) for auth and sync
- **IndexedDB** (via `idb`) as the local-first data store, with a sync queue for offline mutations
- Hand-rolled **service worker** (`public/sw.js`) + web app manifest for installability and offline app-shell caching

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

The service worker only registers in production builds (`npm run build && npm run start`) to avoid caching issues during development.

## Project layout

- `src/app/` — routes (App Router)
- `src/components/` — shared UI components
- `src/lib/supabase/` — browser, server, and middleware Supabase clients
- `src/lib/db/` — IndexedDB schema, connection, and offline sync queue
- `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` — PWA assets (icons are placeholders — swap in real branding)

## Offline-first approach

Reads and writes go to IndexedDB first (`src/lib/db`). Mutations made while offline are recorded in a `sync_queue` object store and replayed against Supabase (`src/lib/db/sync-queue.ts`) once connectivity returns. The service worker separately caches the app shell and static assets so the app itself loads offline.
