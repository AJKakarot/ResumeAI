# ResumeAI

**AI-powered resume analysis** — ATS-oriented feedback, scoring, and insights. Built as a modern SaaS-style web app with auth, cloud storage, and a polished dark UI.

---

## Features

| Area | What you get |
|------|----------------|
| **Landing** | Hero, pipeline preview, social proof, CTA, marketing shell |
| **Auth** | Google sign-in via [Clerk](https://clerk.com) (optional in dev without keys) |
| **Dashboard** | Resume list, upload, sync with backend |
| **API** | REST routes for user sync, resumes CRUD, and file upload to Supabase Storage |

---

## Tech stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router) + React 19  
- **Styling:** Tailwind CSS v4 + [DaisyUI](https://daisyui.com)  
- **Auth:** `@clerk/nextjs` + `@clerk/themes` (dark / orange accent)  
- **Data:** [Supabase](https://supabase.com) (PostgreSQL + Storage) + optional direct `postgres` via `DATABASE_URL`  
- **UX:** Framer Motion (dashboard), react-hot-toast  

---

## Prerequisites

- **Node.js** 20+ (recommended)  
- **npm** (or compatible client)  
- **Clerk** account (for production auth)  
- **Supabase** project (for users, resumes, and file storage)

---

## Quick start

```bash
git clone <your-repo-url>
cd resume-ai
npm install
```

1. **Environment** — copy the example file and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

2. **Run the app:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

3. **Production build** (optional):

   ```bash
   npm run build && npm run start
   ```

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | For sign-in UI | Clerk browser key |
| `CLERK_SECRET_KEY` | For protected routes / server | Clerk server key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase features | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-safe access | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** for sync, resumes, uploads | Server-only; never expose to the client |
| `DATABASE_URL` | Optional | Direct Postgres (`src/lib/db.ts`) if you use SQL helpers |

> **Note:** If `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is missing, the app still **builds**; the navbar shows a disabled sign-in placeholder.

See `.env.example` for copy-paste templates.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run:

   `supabase/migrations/00001_users_resumes_rls.sql`

   This creates tables, RLS policies, and the **`resumes`** storage bucket as expected by the API routes.
3. Copy **Project URL**, **anon key**, and **service role key** from **Settings → API** into `.env.local`.
4. Ensure **`SUPABASE_SERVICE_ROLE_KEY`** is set — without it, user sync and uploads typically return **503** / errors.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (`next dev`) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js config) |
| `npm run clean` | Remove `.next` (fixes many stale-cache issues) |

---

## Project structure

```
src/
├── app/                    # App Router: pages, layout, globals.css, icon.svg
│   ├── api/
│   │   ├── users/sync/     # POST — Clerk user → Supabase `users`
│   │   └── resumes/        # GET/POST + upload + DELETE by id
│   ├── dashboard/          # Authenticated resume list / upload
│   ├── features/           # Marketing
│   └── pricing/
├── components/             # UI: landing, navbar, analyzer, toasts, etc.
├── lib/                    # Supabase clients, db helpers, toast
├── middleware.ts           # Clerk middleware
└── server/                 # Server-side resume/user helpers

supabase/migrations/        # SQL for schema + storage
```

---

## API overview

| Route | Method | Notes |
|-------|--------|--------|
| `/api/users/sync` | POST | Syncs Clerk user to Supabase |
| `/api/resumes` | GET, POST | List / create resumes |
| `/api/resumes/upload` | POST | Multipart upload to Storage |
| `/api/resumes/[id]` | DELETE | Remove resume + object |

All require a valid Clerk session where applicable; service role is used server-side for Supabase admin operations.

---

## Troubleshooting

### Stale Next.js cache / weird runtime errors

Symptoms: missing chunks, `routes-manifest.json` errors, `TypeError: a[d] is not a function`, or odd HMR behavior.

```bash
npm run clean && npm run dev
```

Then hard-refresh the browser (**⌘⇧R** / **Ctrl+Shift+R**).

### Supabase errors

- **`public.users` missing** — run the migration SQL above.  
- **503 on sync or upload** — confirm `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` (restart dev server after changes).

---

## Migration note

This codebase was migrated from **Vite + React**. Clerk env names changed, e.g.  
`VITE_CLERK_PUBLISHABLE_KEY` → **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**.

---

## License

Private / all rights reserved — adjust if you open-source the project.
