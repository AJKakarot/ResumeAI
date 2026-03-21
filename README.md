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

## What I did in this project

Personal log of work shipped on **ResumeAI** (landing UX, brand, repo hygiene, and docs).

### Landing page & layout
- Refactored the **bottom of the landing page** (social proof, CTA, footer): tighter vertical rhythm, `max-w-6xl` alignment, less dead space, Linear-style spacing.
- **Social proof:** line **“1,000+ resumes analyzed successfully”** with orange highlight on the number.
- **Trusted by teams at** (Acme, Northwind, …): moved **below** the 1,000+ stat, then **combined** into one block with a subtle divider and **tighter gaps** between stat and logos.
- **Company chips:** hover state — **white text**, lift, soft glow (interactive “logo strip” feel).
- **CTA section:** consistent padding, heading/button spacing, orange primary buttons for Google + “Start Now”.

### Brand & UI polish
- **ResumeAI** wordmark: **static white glow** on the navbar and footer (tuned `text-shadow` + `drop-shadow` in `globals.css`), with a slightly stronger glow on hover.
- **Navbar** `ResumeAI` link + **NavbarClerkFallback** + **LandingFooter** brand link share the same treatment.

### Favicon & browser chrome
- **Tab icon:** circular **orange** background, **black “RA”** text (larger glyphs), in `src/app/icon.svg` and `public/favicon.svg`.
- **Theme color** for supported browsers set to the orange accent in `layout.tsx`.

### Configuration & repository
- **`.env.example`** rewritten with **placeholders only** (no real Supabase project IDs or secrets) — safe to commit.
- **`.gitignore`** updated so **`.env` / `.ENV`** are never committed.
- **Documentation:** expanded **README** (setup, env table, Supabase migration, API overview, troubleshooting).
- **Git:** project tracked in Git and **pushed to GitHub** (`main`).

### Not in scope (ideas for later)
- LangChain / OpenAPI agent layer (not wired in this repo yet).
- Production deploy (e.g. Vercel) — follow Quick start + env on the host when you’re ready.

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
| `GEMINI_API_KEY` | **Yes** for AI demo (Analyze / Tailor / Cover Letter) | Server-only — [Google AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Optional | Defaults to `gemini-2.0-flash`; use `gemini-1.5-flash` if needed |
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
| `/api/gemini` | POST | **Gemini proxy** — `{ userPrompt, systemPrompt }`; uses `GEMINI_API_KEY` (ResumeAnalyzer) |

Resume/resume APIs require a valid Clerk session where applicable; service role is used server-side for Supabase admin operations. `/api/gemini` is called from the logged-in analyzer UI and does not expose the API key to the browser.

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
