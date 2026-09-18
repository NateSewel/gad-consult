# Blog & Admin Foundation — Design

Date: 2026-09-18
Status: Approved, ready for implementation plan

## Purpose

First sub-project of the "blog / admin dashboard / improved landing page"
roadmap: stand up an admin auth foundation and a Markdown-based blog CMS,
since an admin dashboard needs something to manage and blog content
management needs somewhere to log in. Later sub-projects (contact/newsletter
submissions viewing, additional admin surfaces) build on this foundation but
are explicitly out of scope here.

## Constraints

- **Hosting is Vercel, not Render.** `render.yaml` exists in the repo but
  is not the real deployment target. Everything server-side must work under
  Vercel's serverless model: stateless, no persistent filesystem, no
  guaranteed in-process memory across requests. This rules out in-memory
  session stores (`memorystore`) as a source of truth.
- Single admin user. No signup flow, no roles/permissions, no multi-tenant
  concerns.
- No test suite exists in this repo; this project won't introduce one.
  Verification is type-check + build + functional smoke-checks against the
  real Neon DB, matching how prior work in this repo has been verified.

## Auth

Signed, httpOnly cookie — no session table, no new npm dependency (uses
Node's built-in `crypto`).

- **Credentials:** `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` env vars.
  `ADMIN_PASSWORD_HASH` is a `scrypt` hash in `salt:hash` hex format (not a
  plaintext password). A one-off script (`scripts/hash-admin-password.js`)
  generates this value from a plaintext password for initial setup, since
  there's no signup UI.
- **Token format:** `base64url(JSON.stringify({ exp: <unix ms> }))` +
  `"."` + hex HMAC-SHA256 of that payload, keyed with the `SESSION_SECRET`
  env var.
- **Verification:** recompute the HMAC over the payload and compare with
  `crypto.timingSafeEqual`; reject if the signature doesn't match or `exp`
  has passed.
- **Cookie:** name `gad_admin_session`; `httpOnly`, `secure` in production,
  `sameSite=lax`, `path=/`, `maxAge` matching the token's 7-day expiry.
- **Login:** `POST /api/admin/login` verifies email + password (via
  `scrypt` + `timingSafeEqual`) against the env vars, sets the cookie on
  success. Generic "invalid credentials" error on failure (no distinguishing
  "wrong email" vs "wrong password").
- **Logout:** `POST /api/admin/logout` clears the cookie.
- **Middleware:** applied to every `/api/admin/*` route except
  `POST /api/admin/login` — verifies the cookie, 401s if missing/invalid/
  expired.
- **Client-side route guarding is UX only, not security.** The real
  enforcement is server-side (the cookie check on every admin API call). An
  `AdminLayout` wrapper component calls `GET /api/admin/me` on mount; a 401
  redirects to `/admin/login`. `/admin/*` pages render inside this wrapper.

## Data model

New table in `shared/schema.ts`, following the existing Drizzle +
`drizzle-zod` pattern used by `contactSubmissions` etc.:

```
blog_posts
  id              serial primary key
  slug            varchar, unique, not null
  title           text, not null
  excerpt         text, not null
  cover_image_url text, nullable
  body_markdown   text, not null
  status          text, not null, enum('draft' | 'published'), default 'draft'
  published_at    timestamp, nullable
  created_at      timestamp, not null, default now()
  updated_at      timestamp, not null, default now()
```

No `author` column (single admin — dead weight). No per-post `seo_pages`
row — `title`/`excerpt` double directly as meta title/description, avoiding
a second, easily-out-of-sync content source per post.

**Publish semantics:** when a post's `status` transitions from `draft` to
`published` and `published_at` is null, set `published_at = now()` at that
moment. Subsequent edits to an already-published post do not change
`published_at` again (it's a "first published" timestamp, not "last
updated").

**Slugs:** derived from the title (lowercase, non-alphanumeric → hyphens),
editable in the form, enforced unique at the DB level; a conflicting slug on
save returns `409`.

## API routes

Added to `shared/routes.ts`, same typed-contract pattern (method + path +
Zod input/response schemas) as the existing `api` object, implemented in
`server/routes.ts` (shared by both `server/index.ts`'s local-dev server and
`api/index.ts`'s Vercel serverless entry — no duplication needed here since
both already import the same `registerRoutes`).

**Public:**
- `GET /api/blog/posts` — published posts only, newest `published_at` first.
- `GET /api/blog/posts/:slug` — a single published post; 404 for drafts or
  unknown slugs (a draft's slug is not discoverable while logged out).

**Admin** (behind the auth middleware):
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me` — 200 if the session cookie is valid, else 401.
- `GET /api/admin/posts` — all posts, draft and published.
- `GET /api/admin/posts/:id`
- `POST /api/admin/posts` — create.
- `PUT /api/admin/posts/:id` — update.
- `DELETE /api/admin/posts/:id`

## Storage layer

`server/storage.ts`'s `IStorage`/`DatabaseStorage` gets the new blog CRUD
methods, following the same shape as the existing contact/newsletter
methods (real Drizzle queries against `db` from `server/db.ts`).

## Client routes

Added to `client/src/App.tsx`'s Wouter `Switch`:

- `/blog` — public list: published posts as cards (cover image if present,
  title, excerpt, date).
- `/blog/:slug` — public detail: renders the post body, full `MetaManager`
  treatment (title/excerpt → meta tags, `Article` JSON-LD, matching the
  existing landing-page SEO pattern).
- `/admin/login` — login form.
- `/admin` (inside `AdminLayout`) — dashboard: all posts with status badge,
  edit/delete actions, "New post" button.
- `/admin/posts/new` and `/admin/posts/:id/edit` (inside `AdminLayout`) —
  post form: title, slug (auto-derived, editable), excerpt, cover image URL,
  Markdown body textarea, draft/published toggle, save/delete.

**Nav:** "Blog" added to `SiteHeader`'s `NAV` array (linking to `/blog`,
not a scroll anchor like the others) and to the footer's quick links.

## New dependency

`react-markdown` — renders the post body to real React elements (not
`dangerouslySetInnerHTML`), so no separate HTML sanitizer is needed. Used
only on the public `/blog/:slug` page.

## Out of scope (future sub-projects)

- Contact/newsletter submissions viewing in the admin dashboard.
- Real image upload (object storage) — v1 uses a pasted image URL field.
- Multiple admin accounts / roles.
- Rich text (WYSIWYG) editing — Markdown textarea only.
- A test suite.
