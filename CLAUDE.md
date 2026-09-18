# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (tsx, Express + Vite HMR middleware) at http://localhost:5000
- `npm run build` — builds client (Vite → `dist/public/`) then bundles server (esbuild → `dist/index.cjs`) via `script/build.ts`
- `npm start` — run production build (`node dist/index.cjs`)
- `npm run check` — TypeScript type check (`tsc`, no emit)
- `npm run setup:check` — verify local prerequisites (`scripts/check-prerequisites.js`)
- `npm run db:push` — push `shared/schema.ts` to the Neon database (`drizzle-kit push`)

No test suite or lint script exists in this repo.

## Architecture

Three-folder pattern: `client/` (React SPA), `server/` (Express API), `shared/` (types/schemas/route contracts used by both).

**Path aliases** (defined in both `tsconfig.json` and `vite.config.ts`): `@/` → `client/src/`, `@shared/` → `shared/`, `@assets` → `attached_assets/` (Vite only).

### Shared API contract (`shared/routes.ts`)
Single source of truth for the REST API: each endpoint is a typed object with `method`, `path`, Zod `input` schema, and Zod response schemas. `server/routes.ts` parses request bodies with these same schemas; client hooks (`client/src/hooks/use-*.ts`) use them for type-safe fetching. When changing an endpoint's shape, edit `shared/routes.ts` first — both sides consume it.

`shared/schema.ts` defines the Drizzle table shapes (`contactSubmissions`, `newsletterSubscriptions`, `seoPages`) used both for type inference in `shared/routes.ts` and as the live tables `DatabaseStorage` queries.

### Database: Neon Postgres, live
`server/db.ts` creates a real `pg` `Pool` + Drizzle `db` from `DATABASE_URL` (Neon connection string, see `.env` — project `gad-consult`, eu-west-2; **on a different Neon account than this repo's Neon MCP tools authenticate to**, so DB changes go through `DATABASE_URL`/`drizzle-kit`, not `mcp__Neon__*`). `npm run db:push` pushes `shared/schema.ts` to it.

`server/storage.ts` exports `DatabaseStorage` (implements `IStorage`), backing `contact_submissions`, `newsletter_subscriptions`, and `seo_pages` with real queries. Site org/contact/social info (`getPublicSiteConfig`) is still hardcoded in `DatabaseStorage` — no table for it yet. SEO pages are seeded on server startup via `storage.seedSeoPagesIfEmpty()` in `server/index.ts` (no-ops once rows exist).

### Server bootstrap (`server/index.ts`)
Registers JSON/urlencoded body parsing → `registerRoutes()` → error-handling middleware → then, only after all API routes exist, either `serveStatic` (production, serves `dist/public/` with SPA fallback) or Vite dev middleware (`server/vite.ts`, dev only). This ordering matters: Vite's catch-all must be set up last or it will shadow `/api/*` routes.

### Frontend
Single-page app (`client/src/pages/Landing.tsx`), routed with Wouter (only `/` + 404 fallback). Sections/content (e.g. the `SERVICES` array) live directly in `Landing.tsx`. TanStack Query + the `use-*` hooks in `client/src/hooks/` call the `shared/routes.ts`-defined endpoints. SEO is client-rendered (no SSR) via `client/src/components/MetaManager.tsx`, which updates `document.title`, meta/OG tags, canonical links, and JSON-LD per page. shadcn/ui components live in `client/src/components/ui/` (config: `components.json`).

### Build output layout
`script/build.ts` builds client and server separately, then bundles the server with esbuild into a single `dist/index.cjs`, externalizing all npm deps except an explicit allowlist (kept small deliberately to reduce cold-start `openat` syscalls on Render's free tier).

### Deployment
Render.com via `render.yaml` (build: `npm install && npm run build`, start: `npm start`, port 10000). No auth/session middleware is active despite `passport`/`express-session`/`connect-pg-simple` being dependencies — all API endpoints are public.
