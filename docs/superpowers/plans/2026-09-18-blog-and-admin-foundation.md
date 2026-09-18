# Blog & Admin Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a single-admin auth system and a Markdown blog CMS (data model, public pages, admin CRUD UI) on top of the existing Express + React + Neon stack.

**Architecture:** A signed httpOnly cookie (stdlib `crypto`, no session table) protects `/api/admin/*` routes. A new `blog_posts` Postgres table (via Drizzle, same pattern as existing tables) backs both public read-only blog pages (`/blog`, `/blog/:slug`) and an authenticated admin CRUD UI (`/admin`, `/admin/posts/new`, `/admin/posts/:id/edit`). Everything follows the codebase's existing shared-contract pattern (`shared/routes.ts` typed endpoints, consumed by both `server/routes.ts` and client hooks).

**Tech Stack:** Express 5, Drizzle ORM + Neon Postgres, React 18 + Wouter + TanStack Query, `react-markdown` (new dependency), Node built-in `crypto` for auth (no new auth dependency).

**Spec:** `docs/superpowers/specs/2026-09-18-blog-and-admin-foundation-design.md`

## Global Constraints

- **Hosting is Vercel (serverless), not Render** — despite `render.yaml` existing in the repo. No in-memory session store, no reliance on persistent filesystem or in-process memory across requests. (Both `server/index.ts` and `api/index.ts` call the same `registerRoutes()` — route logic is written once and works on both entry points automatically.)
- Single hardcoded admin user via env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`). No signup flow, no roles/permissions, no multi-user support.
- No test suite exists in this repo and this project does not add one. Every task is verified with `npm run check` (TypeScript), `npm run build`, and a functional smoke script run against the real dev server / real Neon DB — mirroring how prior work in this repo has been verified.
- Auth stays dependency-free (stdlib `crypto` only). The only new npm dependency in this whole plan is `react-markdown`, because rendering Markdown safely isn't a reasonable one-liner and nothing installed does it.
- Follow existing conventions exactly: `shared/routes.ts`'s typed-endpoint-object pattern, `shared/schema.ts`'s Drizzle + `drizzle-zod` pattern, `server/storage.ts`'s `IStorage`/`DatabaseStorage` query style, client hooks' `useQuery`/`useMutation` + `parseWithLogging`/`apiRequest` pattern (see `client/src/hooks/use-public.ts`, `use-contact.ts`, `client/src/lib/queryClient.ts`), and raw-Tailwind-styled buttons/inputs (no shadcn `Button`/`Input` components — this codebase writes its own, see `client/src/components/ContactForm.tsx`).
- Cookie name: `gad_admin_session`. Postgres unique-violation error code for slug conflicts: `23505`.

---

### Task 1: Blog data model

**Files:**
- Modify: `shared/schema.ts`

**Interfaces:**
- Produces: `blogPosts` (Drizzle table), `insertBlogPostSchema`, `InsertBlogPost` type, `BlogPost` type — all consumed by Task 5 (`server/storage.ts`) and Task 6 (`shared/routes.ts`).

- [ ] **Step 1: Add the `blog_posts` table to `shared/schema.ts`**

Add after the existing `seoPages` block (after line 53, before the `CreateContactSubmissionRequest` type exports):

```ts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImageUrl: text("cover_image_url"),
  bodyMarkdown: text("body_markdown").notNull(),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: no errors from `shared/schema.ts`.

- [ ] **Step 3: Push the schema to Neon**

Run: `npm run db:push`
Expected: drizzle-kit reports the new `blog_posts` table created, no errors.

- [ ] **Step 4: Verify the table exists with the right columns**

Create a temporary script `.local/verify-blog-table.ts`:

```ts
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const result = await pool.query(
  `select column_name, data_type, is_nullable from information_schema.columns where table_name = 'blog_posts' order by ordinal_position`,
);
console.log(result.rows);
await pool.end();
```

Run: `npx tsx .local/verify-blog-table.ts`
Expected: rows for `id`, `slug`, `title`, `excerpt`, `cover_image_url`, `body_markdown`, `status`, `published_at`, `created_at`, `updated_at`, with `cover_image_url` and `published_at` showing `is_nullable = YES`.

Delete `.local/verify-blog-table.ts` afterward — it's a one-off check, not part of the codebase.

- [ ] **Step 5: Commit**

```bash
git add shared/schema.ts
git commit -m "Add blog_posts table"
```

---

### Task 2: Auth utilities (password hashing, session tokens, cookie parsing)

**Files:**
- Create: `server/auth.ts`

**Interfaces:**
- Consumes: nothing (stdlib `crypto` only).
- Produces: `hashPassword(password: string): string`, `verifyPassword(password: string, storedHash: string): boolean`, `createSessionToken(): string`, `verifySessionToken(token: string | undefined): boolean`, `parseCookies(header: string | undefined): Record<string, string>`, `requireAdminAuth` (Express middleware), `SESSION_COOKIE_NAME: string`, `SESSION_COOKIE_MAX_AGE_SECONDS: number` — all consumed by Task 3 (hash script) and Task 4 (login/logout/me routes + middleware usage).

- [ ] **Step 1: Write `server/auth.ts`**

```ts
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = scryptSync(password, salt, SCRYPT_KEYLEN);
  if (hashBuffer.length !== candidateBuffer.length) return false;
  return timingSafeEqual(hashBuffer, candidateBuffer);
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return secret;
}

export function createSessionToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expectedSignature = createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

export const SESSION_COOKIE_NAME = "gad_admin_session";
export const SESSION_COOKIE_MAX_AGE_SECONDS = TOKEN_TTL_MS / 1000;

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  if (!verifySessionToken(cookies[SESSION_COOKIE_NAME])) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}
```

- [ ] **Step 2: Type-check**

Run: `npm run check`
Expected: no errors from `server/auth.ts`.

- [ ] **Step 3: Write and run a smoke script**

Create `.local/verify-auth.ts`:

```ts
process.env.SESSION_SECRET = "test-secret-for-smoke-check";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../server/auth";

const hash = hashPassword("correct-horse-battery-staple");
console.assert(verifyPassword("correct-horse-battery-staple", hash) === true, "correct password should verify");
console.assert(verifyPassword("wrong-password", hash) === false, "wrong password should not verify");

const token = createSessionToken();
console.assert(verifySessionToken(token) === true, "fresh token should verify");
console.assert(verifySessionToken(undefined) === false, "missing token should not verify");
console.assert(verifySessionToken(token + "tampered") === false, "tampered token should not verify");

const [payload] = token.split(".");
const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
const expiredPayload = Buffer.from(JSON.stringify({ exp: decoded.exp - 999999999 })).toString("base64url");
const { createHmac } = await import("crypto");
const expiredSig = createHmac("sha256", process.env.SESSION_SECRET!).update(expiredPayload).digest("hex");
console.assert(verifySessionToken(`${expiredPayload}.${expiredSig}`) === false, "expired token should not verify");

console.log("auth smoke check: all assertions passed");
```

Run: `npx tsx .local/verify-auth.ts`
Expected: `auth smoke check: all assertions passed` with no assertion failures printed above it.

Delete `.local/verify-auth.ts` afterward.

- [ ] **Step 4: Commit**

```bash
git add server/auth.ts
git commit -m "Add admin auth utilities (password hashing, signed session cookies)"
```

---

### Task 3: Admin credential setup (hash script + env vars)

**Files:**
- Create: `scripts/hash-admin-password.ts`
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `.env.local.example`

**Interfaces:**
- Consumes: `hashPassword` from `server/auth.ts` (Task 2).
- Produces: nothing consumed by later tasks — this is a standalone operator tool.

- [ ] **Step 1: Write `scripts/hash-admin-password.ts`**

```ts
import { hashPassword } from "../server/auth";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run admin:hash-password -- <plaintext-password>");
  process.exit(1);
}

console.log(hashPassword(password));
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add to `"scripts"` (after `"db:push"`):

```json
    "admin:hash-password": "tsx scripts/hash-admin-password.ts"
```

- [ ] **Step 3: Add env var documentation to `.env.example`**

Append:

```
# Admin auth
ADMIN_EMAIL=admin@gadconsult.example
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

- [ ] **Step 4: Mirror the same block into `.env.local.example`**

Read the file first to match its existing formatting, then append the same three lines from Step 3.

- [ ] **Step 5: Run the script and verify the output format**

Run: `npm run admin:hash-password -- test-password-123`
Expected: a single line of output matching `^[0-9a-f]{32}:[0-9a-f]{128}$` (32 hex chars, colon, 128 hex chars — a 16-byte salt and 64-byte scrypt hash in hex).

- [ ] **Step 6: Generate the real admin credentials for this project and add them to `.env`**

Run: `npm run admin:hash-password -- <a real password you choose>`

Add to `.env` (not `.env.example` — this is the real secret file, already gitignored):

```
ADMIN_EMAIL=<the real admin email>
ADMIN_PASSWORD_HASH=<the hash from the command above>
SESSION_SECRET=<a long random string — e.g. output of `openssl rand -hex 32`>
```

- [ ] **Step 7: Commit**

```bash
git add scripts/hash-admin-password.ts package.json .env.example .env.local.example
git commit -m "Add admin password hash generator script and env var docs"
```

---

### Task 4: Auth API routes (login, logout, me)

**Files:**
- Modify: `shared/routes.ts`
- Modify: `server/routes.ts`

**Interfaces:**
- Consumes: `requireAdminAuth`, `verifyPassword`, `createSessionToken`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_MAX_AGE_SECONDS` from `server/auth.ts` (Task 2).
- Produces: `api.admin.login`, `api.admin.logout`, `api.admin.me` endpoint definitions in `shared/routes.ts`, consumed by Task 8's client hooks. `requireAdminAuth` usage pattern established here is reused by Task 6's post CRUD routes.

- [ ] **Step 1: Add the login schema and admin auth endpoints to `shared/routes.ts`**

Add after `newsletterSchema` (before the `export const api = {` line):

```ts
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

Inside the `export const api = {` object, add a new top-level `admin` key after the `newsletter` key:

```ts
  admin: {
    login: {
      method: "POST" as const,
      path: "/api/admin/login" as const,
      input: adminLoginSchema,
      responses: {
        200: z.object({ ok: z.literal(true) }),
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: "POST" as const,
      path: "/api/admin/logout" as const,
      responses: {
        200: z.object({ ok: z.literal(true) }),
      },
    },
    me: {
      method: "GET" as const,
      path: "/api/admin/me" as const,
      responses: {
        200: z.object({ authenticated: z.literal(true) }),
        401: errorSchemas.validation,
      },
    },
  },
```

- [ ] **Step 2: Add the routes to `server/routes.ts`**

Add the import at the top:

```ts
import {
  requireAdminAuth,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
} from "./auth";
```

Add inside `registerRoutes`, after the newsletter route and before `return httpServer;`:

```ts
  app.post(api.admin.login.path, async (req, res) => {
    try {
      const input = api.admin.login.input.parse(req.body);
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
      if (!adminEmail || !adminPasswordHash) {
        return res.status(500).json({ message: "Admin auth not configured" });
      }
      const emailMatches = input.email.toLowerCase() === adminEmail.toLowerCase();
      const passwordMatches = verifyPassword(input.password, adminPasswordHash);
      if (!emailMatches || !passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      res.cookie(SESSION_COOKIE_NAME, createSessionToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
      });
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      throw err;
    }
  });

  app.post(api.admin.logout.path, async (_req, res) => {
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.json({ ok: true });
  });

  app.get(api.admin.me.path, requireAdminAuth, async (_req, res) => {
    res.json({ authenticated: true });
  });
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 4: Start the dev server and smoke-test the full login/logout flow**

Run `npm run dev` in the background (or use the already-running instance), then run this smoke script (adjust `ADMIN_EMAIL`/password to match what you set in Task 3 Step 6):

```bash
BASE=http://localhost:5000

echo "--- wrong credentials ---"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrong"}'
# expect 401

echo "--- me without cookie ---"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/admin/me"
# expect 401

echo "--- correct credentials ---"
curl -s -i -X POST "$BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<real admin email>","password":"<real admin password>"}' \
  -c .local/cookies.txt | head -20
# expect 200, response headers include Set-Cookie: gad_admin_session=...

echo "--- me with cookie ---"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/admin/me" -b .local/cookies.txt
# expect 200

echo "--- logout ---"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/admin/logout" -b .local/cookies.txt -c .local/cookies.txt
# expect 200

echo "--- me after logout ---"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/admin/me" -b .local/cookies.txt
# expect 401

rm .local/cookies.txt
```

Expected: the status codes match every `# expect` comment above.

- [ ] **Step 5: Commit**

```bash
git add shared/routes.ts server/routes.ts
git commit -m "Add admin login/logout/me routes and session cookie auth"
```

---

### Task 5: Blog storage layer

**Files:**
- Modify: `server/storage.ts`

**Interfaces:**
- Consumes: `blogPosts`, `BlogPost`, `InsertBlogPost` from `shared/schema.ts` (Task 1); `db` from `server/db.ts`.
- Produces: `IStorage` methods `listPublishedBlogPosts`, `getPublishedBlogPostBySlug`, `listAllBlogPosts`, `getBlogPostById`, `createBlogPost`, `updateBlogPost`, `deleteBlogPost` — all consumed by Task 6's route handlers.

- [ ] **Step 1: Update imports in `server/storage.ts`**

Change the top of the file to:

```ts
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { contactSubmissions, newsletterSubscriptions, seoPages, blogPosts } from "@shared/schema";
import {
  type CreateContactSubmissionRequest,
  type ContactSubmissionResponse,
  type CreateNewsletterSubscriptionRequest,
  type PublicSiteConfigResponse,
  type SeoPageResponse,
  type BlogPost,
  type InsertBlogPost,
} from "@shared/schema";
```

- [ ] **Step 2: Add the new methods to the `IStorage` interface**

Add after `getNewsletterSubscriptionByEmail` in the interface:

```ts
  listPublishedBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  listAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  createBlogPost(input: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, input: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
```

- [ ] **Step 3: Implement the methods on `DatabaseStorage`**

Add after `createNewsletterSubscription`, before the closing brace of the class:

```ts
  async listPublishedBlogPosts(): Promise<BlogPost[]> {
    return db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")));
    return post;
  }

  async listAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createBlogPost(input: InsertBlogPost): Promise<BlogPost> {
    const publishedAt = input.status === "published" ? new Date() : null;
    const [created] = await db
      .insert(blogPosts)
      .values({ ...input, publishedAt })
      .returning();
    return created;
  }

  async updateBlogPost(id: number, input: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = await this.getBlogPostById(id);
    if (!existing) return undefined;

    const publishedAt =
      input.status === "published" && !existing.publishedAt ? new Date() : existing.publishedAt;

    const [updated] = await db
      .update(blogPosts)
      .set({ ...input, publishedAt, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning({ id: blogPosts.id });
    return result.length > 0;
  }
```

- [ ] **Step 4: Type-check**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 5: Smoke-test against the real Neon DB**

Create `.local/verify-blog-storage.ts`:

```ts
import "dotenv/config";
import { storage } from "../server/storage";

const created = await storage.createBlogPost({
  slug: "smoke-test-post",
  title: "Smoke Test Post",
  excerpt: "A post created by the storage smoke test.",
  coverImageUrl: null,
  bodyMarkdown: "# Hello\n\nThis is a smoke test.",
  status: "draft",
});
console.assert(created.status === "draft" && created.publishedAt === null, "draft post should have no publishedAt");

const allPosts = await storage.listAllBlogPosts();
console.assert(allPosts.some((p) => p.id === created.id), "listAllBlogPosts should include the draft");

const publishedBefore = await storage.listPublishedBlogPosts();
console.assert(!publishedBefore.some((p) => p.id === created.id), "listPublishedBlogPosts should exclude the draft");

const published = await storage.updateBlogPost(created.id, { status: "published" });
console.assert(published?.publishedAt !== null, "publishing should set publishedAt");
const firstPublishedAt = published?.publishedAt;

const publishedAfter = await storage.listPublishedBlogPosts();
console.assert(publishedAfter.some((p) => p.id === created.id), "listPublishedBlogPosts should include it once published");

const bySlug = await storage.getPublishedBlogPostBySlug("smoke-test-post");
console.assert(bySlug?.id === created.id, "getPublishedBlogPostBySlug should find it");

const reupdated = await storage.updateBlogPost(created.id, { title: "Smoke Test Post (edited)" });
console.assert(
  reupdated?.publishedAt?.getTime() === firstPublishedAt?.getTime(),
  "editing an already-published post should not change publishedAt",
);

const deleted = await storage.deleteBlogPost(created.id);
console.assert(deleted === true, "delete should return true");

const gone = await storage.getBlogPostById(created.id);
console.assert(gone === undefined, "post should be gone after delete");

console.log("blog storage smoke check: all assertions passed");
```

Run: `npx tsx .local/verify-blog-storage.ts`
Expected: `blog storage smoke check: all assertions passed` with no assertion failures printed above it.

Delete `.local/verify-blog-storage.ts` afterward.

- [ ] **Step 6: Commit**

```bash
git add server/storage.ts
git commit -m "Add blog post CRUD methods to DatabaseStorage"
```

---

### Task 6: Blog CRUD and public API routes

**Files:**
- Modify: `shared/routes.ts`
- Modify: `server/routes.ts`

**Interfaces:**
- Consumes: `requireAdminAuth` from `server/auth.ts` (Task 2); storage methods from Task 5.
- Produces: `api.blog.list`, `api.blog.get`, `api.admin.posts.{list,get,create,update,remove}` endpoint definitions and `BlogPostInput`, `BlogPostUpdateInput`, `BlogPostResponse` types in `shared/routes.ts` — all consumed by Task 7's public hooks and Task 8's admin hooks.

- [ ] **Step 1: Add blog schemas and endpoints to `shared/routes.ts`**

Update the top-of-file import to include `blogPosts`:

```ts
import {
  contactSubmissions,
  insertContactSubmissionSchema,
  insertNewsletterSubscriptionSchema,
  seoPages,
  blogPosts,
} from "./schema";
```

Add after `adminLoginSchema`:

```ts
export const blogPostInputSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens"),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  bodyMarkdown: z.string().min(1),
  status: z.enum(["draft", "published"]),
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();
```

Add a `blog` key to the `api` object (alongside `public`, `contact`, `newsletter`, `admin`):

```ts
  blog: {
    list: {
      method: "GET" as const,
      path: "/api/blog/posts" as const,
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/blog/posts/:slug" as const,
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
```

Add a `posts` key inside the existing `admin` object (after `me`):

```ts
    posts: {
      list: {
        method: "GET" as const,
        path: "/api/admin/posts" as const,
        responses: {
          200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
        },
      },
      get: {
        method: "GET" as const,
        path: "/api/admin/posts/:id" as const,
        responses: {
          200: z.custom<typeof blogPosts.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/posts" as const,
        input: blogPostInputSchema,
        responses: {
          201: z.custom<typeof blogPosts.$inferSelect>(),
          400: errorSchemas.validation,
          409: errorSchemas.conflict,
        },
      },
      update: {
        method: "PUT" as const,
        path: "/api/admin/posts/:id" as const,
        input: blogPostUpdateSchema,
        responses: {
          200: z.custom<typeof blogPosts.$inferSelect>(),
          400: errorSchemas.validation,
          404: errorSchemas.notFound,
          409: errorSchemas.conflict,
        },
      },
      remove: {
        method: "DELETE" as const,
        path: "/api/admin/posts/:id" as const,
        responses: {
          200: z.object({ ok: z.literal(true) }),
          404: errorSchemas.notFound,
        },
      },
    },
```

Add these type exports at the bottom of the file, after the existing `NewsletterSubscribeResponse` type:

```ts
export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;
export type BlogPostResponse = z.infer<typeof api.blog.list.responses[200]>[number];
```

- [ ] **Step 2: Add the routes to `server/routes.ts`**

Add the public routes after the existing `api.public.seo` route:

```ts
  app.get(api.blog.list.path, async (_req, res) => {
    const posts = await storage.listPublishedBlogPosts();
    res.json(posts);
  });

  app.get(api.blog.get.path, async (req, res) => {
    const slug = String(req.params.slug || "");
    const post = await storage.getPublishedBlogPostBySlug(slug);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });
```

Add the admin routes after the `api.admin.me` route from Task 4:

```ts
  app.get(api.admin.posts.list.path, requireAdminAuth, async (_req, res) => {
    const posts = await storage.listAllBlogPosts();
    res.json(posts);
  });

  app.get(api.admin.posts.get.path, requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const post = await storage.getBlogPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  app.post(api.admin.posts.create.path, requireAdminAuth, async (req, res) => {
    try {
      const input = api.admin.posts.create.input.parse(req.body);
      const created = await storage.createBlogPost(input);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      if ((err as any)?.code === "23505") {
        return res.status(409).json({ message: "A post with this slug already exists" });
      }
      throw err;
    }
  });

  app.put(api.admin.posts.update.path, requireAdminAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.admin.posts.update.input.parse(req.body);
      const updated = await storage.updateBlogPost(id, input);
      if (!updated) return res.status(404).json({ message: "Post not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.errors[0];
        return res.status(400).json({
          message: first?.message ?? "Invalid request",
          field: first?.path?.join(".") || undefined,
        });
      }
      if ((err as any)?.code === "23505") {
        return res.status(409).json({ message: "A post with this slug already exists" });
      }
      throw err;
    }
  });

  app.delete(api.admin.posts.remove.path, requireAdminAuth, async (req, res) => {
    const id = Number(req.params.id);
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ message: "Post not found" });
    res.json({ ok: true });
  });
```

- [ ] **Step 3: Type-check**

Run: `npm run check`
Expected: no errors.

- [ ] **Step 4: Smoke-test the full CRUD + public visibility flow**

With the dev server running:

```bash
BASE=http://localhost:5000

curl -s -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" \
  -d '{"email":"<real admin email>","password":"<real admin password>"}' \
  -c .local/cookies.txt -o /dev/null

echo "--- unauthenticated create should 401 ---"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/admin/posts" \
  -H "Content-Type: application/json" -d '{"slug":"x","title":"x","excerpt":"x","bodyMarkdown":"x","status":"draft"}'
# expect 401

echo "--- authenticated create (draft) ---"
CREATE_RES=$(curl -s -X POST "$BASE/api/admin/posts" -b .local/cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"slug":"smoke-test-post","title":"Smoke Test","excerpt":"Test excerpt","bodyMarkdown":"# Test","status":"draft"}')
echo "$CREATE_RES"
POST_ID=$(echo "$CREATE_RES" | node -e "process.stdin.once('data', d => console.log(JSON.parse(d).id))")

echo "--- draft should not appear in public list ---"
curl -s "$BASE/api/blog/posts" | grep -c "smoke-test-post"
# expect 0

echo "--- publish it ---"
curl -s -o /dev/null -w "%{http_code}\n" -X PUT "$BASE/api/admin/posts/$POST_ID" -b .local/cookies.txt \
  -H "Content-Type: application/json" -d '{"status":"published"}'
# expect 200

echo "--- now it should appear in public list and be fetchable by slug ---"
curl -s "$BASE/api/blog/posts" | grep -c "smoke-test-post"
# expect 1
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/blog/posts/smoke-test-post"
# expect 200

echo "--- duplicate slug should 409 ---"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$BASE/api/admin/posts" -b .local/cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"slug":"smoke-test-post","title":"Dup","excerpt":"Dup","bodyMarkdown":"Dup","status":"draft"}'
# expect 409

echo "--- delete it ---"
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE "$BASE/api/admin/posts/$POST_ID" -b .local/cookies.txt
# expect 200

echo "--- gone from public and by slug 404 ---"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE/api/blog/posts/smoke-test-post"
# expect 404

rm .local/cookies.txt
```

Expected: every status code matches its `# expect` comment.

- [ ] **Step 5: Commit**

```bash
git add shared/routes.ts server/routes.ts
git commit -m "Add blog post CRUD and public blog API routes"
```

---

### Task 7: Public blog pages

**Files:**
- Create: `client/src/hooks/use-blog.ts`
- Create: `client/src/pages/Blog.tsx`
- Create: `client/src/pages/BlogPost.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/SiteHeader.tsx`
- Modify: `client/src/pages/Landing.tsx`
- Modify: `package.json` (via `npm install`)

**Interfaces:**
- Consumes: `api.blog.list`, `api.blog.get`, `BlogPostResponse` from `shared/routes.ts` (Task 6).
- Produces: `Blog` and `BlogPost` page components registered as `/blog` and `/blog/:slug` routes.

- [ ] **Step 1: Install `react-markdown`**

Run: `npm install react-markdown`

- [ ] **Step 2: Write `client/src/hooks/use-blog.ts`**

```ts
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl, type BlogPostResponse } from "@shared/routes";

export function useBlogPosts() {
  return useQuery({
    queryKey: [api.blog.list.path],
    queryFn: async () => {
      const res = await fetch(api.blog.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return (await res.json()) as BlogPostResponse[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: [api.blog.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.blog.get.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return (await res.json()) as BlogPostResponse;
    },
    enabled: Boolean(slug),
  });
}
```

- [ ] **Step 3: Write `client/src/pages/Blog.tsx`**

```tsx
import { Link } from "wouter";
import { MetaManager } from "@/components/MetaManager";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogPosts } from "@/hooks/use-blog";
import { useSiteConfig } from "@/hooks/use-public";
import { CalendarDays } from "lucide-react";

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function Blog() {
  const { data: site } = useSiteConfig();
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <MetaManager
        title="Blog | GAD Legal Consult"
        description="Insights and updates from GAD Legal Consult on corporate law, compliance, and practical legal strategy."
        canonicalPath="/blog"
      />

      <SiteHeader site={site ?? null} onSchedule={() => {}} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05]" data-testid="blog-title">
          Insights & updates
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl" data-testid="blog-subtitle">
          Practical notes on corporate law, compliance, and running a business in Nigeria.
        </p>

        {isLoading ? (
          <div className="mt-10 text-sm text-muted-foreground" data-testid="blog-loading">
            Loading posts…
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6" data-testid="blog-grid">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg"
                data-testid={`blog-card-${post.slug}`}
              >
                {post.coverImageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </div>
                  <div className="mt-2 text-lg font-semibold leading-tight">{post.title}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="mt-10 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
            data-testid="blog-empty"
          >
            No posts published yet — check back soon.
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Write `client/src/pages/BlogPost.tsx`**

```tsx
import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { MetaManager } from "@/components/MetaManager";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogPost } from "@/hooks/use-blog";
import { useSiteConfig } from "@/hooks/use-public";
import { ArrowLeft, CalendarDays } from "lucide-react";

function formatDate(value: Date | string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const { data: site } = useSiteConfig();
  const { data: post, isLoading } = useBlogPost(params.slug);

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.coverImageUrl || undefined,
        datePublished: post.publishedAt || undefined,
        author: { "@type": "Person", name: "GAD Legal Consult" },
      }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <MetaManager
        title={post ? `${post.title} | GAD Legal Consult` : "Blog | GAD Legal Consult"}
        description={post?.excerpt ?? "GAD Legal Consult blog."}
        canonicalPath={`/blog/${params.slug}`}
        jsonLd={jsonLd}
      />

      <SiteHeader site={site ?? null} onSchedule={() => {}} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
          data-testid="blog-post-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        {isLoading ? (
          <div className="mt-8 text-sm text-muted-foreground" data-testid="blog-post-loading">
            Loading…
          </div>
        ) : !post ? (
          <div
            className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center"
            data-testid="blog-post-not-found"
          >
            <div className="text-lg font-semibold">Post not found</div>
            <p className="mt-2 text-sm text-muted-foreground">This post may have been unpublished or moved.</p>
          </div>
        ) : (
          <article className="mt-6" data-testid="blog-post-article">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-[1.1]" data-testid="blog-post-title">
              {post.title}
            </h1>
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="mt-6 w-full rounded-3xl border border-border/70 object-cover"
              />
            ) : null}
            <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none" data-testid="blog-post-body">
              <ReactMarkdown>{post.bodyMarkdown}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Register the routes in `client/src/App.tsx`**

Add imports:

```tsx
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
```

Add inside the `<Switch>`, before the `<Route path="/" component={Landing} />` line:

```tsx
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
```

- [ ] **Step 6: Add "Blog" to the header nav (`client/src/components/SiteHeader.tsx`)**

Change the `NAV` const to distinguish scroll-anchors (`#...`) from real routes (`/...`):

```ts
const NAV = [
  { label: "Home", href: "#home", testId: "nav-home" },
  { label: "Services", href: "#services", testId: "nav-services" },
  { label: "About", href: "#about", testId: "nav-about" },
  { label: "Blog", href: "/blog", testId: "nav-blog" },
  { label: "Contact", href: "#contact", testId: "nav-contact" },
] as const;
```

Add the `Link` import from wouter at the top (alongside the existing `Link` import — it's already imported):

The file already has `import { Link } from "wouter";`, so no new import is needed.

Replace the desktop nav `.map()` block (the one rendering `<button>` for each `navItems`) with a version that renders a `Link` for route-style entries and keeps the existing scroll-button behavior for anchor-style entries:

```tsx
            <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
              {navItems.map((item) => {
                const isRoute = item.href.startsWith("/");
                if (isRoute) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative rounded-xl px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-all duration-200"
                      data-testid={item.testId}
                    >
                      {item.label}
                    </Link>
                  );
                }
                const sectionId = item.href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "relative rounded-xl px-3 py-2 text-sm font-semibold",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                      "transition-all duration-200",
                      isActive
                        ? "text-secondary bg-secondary/10"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/70",
                    )}
                    data-testid={item.testId}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-secondary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
```

Apply the same `isRoute` split to the mobile nav `.map()` block (the one with `data-testid={`${item.testId}-mobile`}`):

```tsx
                {navItems.map((item) => {
                  const isRoute = item.href.startsWith("/");
                  if (isRoute) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="w-full block rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 text-foreground/85 hover:bg-muted/70"
                        data-testid={`${item.testId}-mobile`}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  const sectionId = item.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                        isActive
                          ? "text-secondary bg-secondary/10"
                          : "text-foreground/85 hover:bg-muted/70",
                      )}
                      data-testid={`${item.testId}-mobile`}
                    >
                      {item.label}
                    </button>
                  );
                })}
```

- [ ] **Step 7: Add a "Blog" link to the footer (`client/src/pages/Landing.tsx`)**

In the footer's quick links block (`data-testid="footer-links"`), add a `Link` alongside the existing `FooterLink` buttons. First add the import:

```tsx
import { Link } from "wouter";
```

Then add this line inside the `footer-links` div, after `FooterLink label="About"` and before `FooterLink label="Contact"`:

```tsx
                    <Link
                      href="/blog"
                      className="text-left rounded-xl px-3 py-2 font-semibold text-foreground/85 hover:text-foreground hover:bg-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/10"
                      data-testid="footer-link-blog"
                    >
                      Blog
                    </Link>
```

- [ ] **Step 8: Type-check and build**

Run: `npm run check`
Expected: no new errors (the pre-existing unrelated `PrimaryCTA.tsx` framer-motion type error is fine).

Run: `npm run build`
Expected: builds successfully, `dist/public/` produced.

- [ ] **Step 9: Smoke-test the public pages against real data**

With the dev server running, seed one published post (reusing the login-then-create curl pattern from Task 6 Step 4, with `"status":"published"` directly), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/src/pages/Blog.tsx
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/src/pages/BlogPost.tsx
```

Expected: both return `200` (confirms Vite compiles them with no errors — same verification technique used earlier for this project's Vercel fix).

Then delete the seeded post via `DELETE /api/admin/posts/:id` (same pattern as Task 6 Step 4) so no test data is left in the real DB.

- [ ] **Step 10: Commit**

```bash
git add client/src/hooks/use-blog.ts client/src/pages/Blog.tsx client/src/pages/BlogPost.tsx client/src/App.tsx client/src/components/SiteHeader.tsx client/src/pages/Landing.tsx package.json package-lock.json
git commit -m "Add public blog list/detail pages and nav links"
```

---

### Task 8: Admin dashboard UI

**Files:**
- Create: `client/src/hooks/use-admin.ts`
- Create: `client/src/components/AdminLayout.tsx`
- Create: `client/src/pages/admin/AdminLogin.tsx`
- Create: `client/src/pages/admin/AdminDashboard.tsx`
- Create: `client/src/pages/admin/AdminPostForm.tsx`
- Modify: `client/src/App.tsx`

**Interfaces:**
- Consumes: `api.admin.*`, `BlogPostInput`, `BlogPostUpdateInput`, `BlogPostResponse` from `shared/routes.ts` (Tasks 4 & 6); `apiRequest` from `client/src/lib/queryClient.ts`.
- Produces: `/admin/login`, `/admin`, `/admin/posts/new`, `/admin/posts/:id/edit` client routes.

- [ ] **Step 1: Write `client/src/hooks/use-admin.ts`**

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type BlogPostInput, type BlogPostUpdateInput, type BlogPostResponse } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useAdminMe() {
  return useQuery({
    queryKey: [api.admin.me.path],
    queryFn: async () => {
      const res = await fetch(api.admin.me.path, { credentials: "include" });
      return res.ok;
    },
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      await apiRequest("POST", api.admin.login.path, input);
    },
  });
}

export function useAdminLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiRequest("POST", api.admin.logout.path);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.me.path] });
    },
  });
}

export function useAdminPosts() {
  return useQuery({
    queryKey: [api.admin.posts.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.posts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return (await res.json()) as BlogPostResponse[];
    },
  });
}

export function useAdminPost(id: number | undefined) {
  return useQuery({
    queryKey: [api.admin.posts.list.path, id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/posts/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch post");
      return (await res.json()) as BlogPostResponse;
    },
    enabled: typeof id === "number" && !Number.isNaN(id),
  });
}

export function useCreateAdminPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogPostInput) => {
      const res = await apiRequest("POST", api.admin.posts.create.path, input);
      return (await res.json()) as BlogPostResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
  });
}

export function useUpdateAdminPost(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogPostUpdateInput) => {
      const res = await apiRequest("PUT", `/api/admin/posts/${id}`, input);
      return (await res.json()) as BlogPostResponse;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
  });
}

export function useDeleteAdminPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/posts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.admin.posts.list.path] });
    },
  });
}
```

- [ ] **Step 2: Write `client/src/components/AdminLayout.tsx`**

```tsx
import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminMe, useAdminLogout } from "@/hooks/use-admin";
import { LogOut } from "lucide-react";

export function AdminLayout(props: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { data: authenticated, isLoading } = useAdminMe();
  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && authenticated === false) {
      navigate("/admin/login");
    }
  }, [isLoading, authenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground" data-testid="admin-loading">
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="font-display text-lg" data-testid="admin-header-title">
            GAD Admin
          </div>
          <button
            type="button"
            onClick={() => logout.mutate()}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/70 transition-all duration-200"
            data-testid="admin-logout-button"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">{props.children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Write `client/src/pages/admin/AdminLogin.tsx`**

```tsx
import { type FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@/hooks/use-admin";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAdminLogin();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ email, password });
      navigate("/admin");
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-lg shadow-black/5"
        data-testid="admin-login-form"
      >
        <h1 className="text-2xl font-semibold" data-testid="admin-login-title">
          Admin login
        </h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-1.5">
            <div className="text-sm font-semibold text-foreground/90">Email</div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
              data-testid="admin-login-email"
            />
          </label>
          <label className="grid gap-1.5">
            <div className="text-sm font-semibold text-foreground/90">Password</div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
              data-testid="admin-login-password"
            />
          </label>
          {error ? (
            <div className="text-sm font-semibold text-destructive" data-testid="admin-login-error">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={login.isPending}
            className="mt-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60"
            data-testid="admin-login-submit"
          >
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Write `client/src/pages/admin/AdminDashboard.tsx`**

```tsx
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPosts, useDeleteAdminPost } from "@/hooks/use-admin";

export default function AdminDashboard() {
  const { data: posts, isLoading } = useAdminPosts();
  const del = useDeleteAdminPost();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold" data-testid="admin-dashboard-title">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
          data-testid="admin-new-post-link"
        >
          New post
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 text-sm text-muted-foreground">Loading…</div>
      ) : !posts || posts.length === 0 ? (
        <div
          className="mt-8 rounded-3xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground"
          data-testid="admin-posts-empty"
        >
          No posts yet.
        </div>
      ) : (
        <div className="mt-8 grid gap-3" data-testid="admin-posts-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4"
              data-testid={`admin-post-row-${post.id}`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold truncate">{post.title}</span>
                  <span
                    className={
                      post.status === "published"
                        ? "rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {post.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">/blog/{post.slug}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold hover:bg-muted/70"
                  data-testid={`admin-post-edit-${post.id}`}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${post.title}"? This can't be undone.`)) {
                      del.mutate(post.id);
                    }
                  }}
                  className="rounded-xl border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  data-testid={`admin-post-delete-${post.id}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
```

- [ ] **Step 5: Write `client/src/pages/admin/AdminPostForm.tsx`**

```tsx
import { type FormEvent, useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAdminPost, useCreateAdminPost, useUpdateAdminPost } from "@/hooks/use-admin";
import type { BlogPostInput } from "@shared/routes";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const emptyForm: BlogPostInput = {
  slug: "",
  title: "",
  excerpt: "",
  coverImageUrl: "",
  bodyMarkdown: "",
  status: "draft",
};

export function AdminPostForm(props: { mode: "create" | "edit" }) {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const postId = props.mode === "edit" ? Number(params.id) : undefined;
  const { data: existing, isLoading } = useAdminPost(postId);
  const create = useCreateAdminPost();
  const update = useUpdateAdminPost(postId ?? -1);

  const [form, setForm] = useState<BlogPostInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        slug: existing.slug,
        title: existing.title,
        excerpt: existing.excerpt,
        coverImageUrl: existing.coverImageUrl ?? "",
        bodyMarkdown: existing.bodyMarkdown,
        status: existing.status as "draft" | "published",
      });
      setSlugTouched(true);
    }
  }, [existing]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (props.mode === "create") {
        await create.mutateAsync(form);
      } else {
        await update.mutateAsync(form);
      }
      navigate("/admin");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save post.");
    }
  }

  if (props.mode === "edit" && isLoading) {
    return (
      <AdminLayout>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </AdminLayout>
    );
  }

  const saving = create.isPending || update.isPending;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold" data-testid="admin-post-form-title">
        {props.mode === "create" ? "New post" : "Edit post"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-5 max-w-2xl" data-testid="admin-post-form">
        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Title</div>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: slugTouched ? f.slug : slugify(title),
              }));
            }}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-title-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Slug</div>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm font-mono"
            data-testid="admin-post-form-slug-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Excerpt</div>
          <textarea
            required
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-excerpt-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Cover image URL (optional)</div>
          <input
            value={form.coverImageUrl ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm"
            data-testid="admin-post-form-cover-input"
          />
        </label>

        <label className="grid gap-1.5">
          <div className="text-sm font-semibold">Body (Markdown)</div>
          <textarea
            required
            rows={14}
            value={form.bodyMarkdown}
            onChange={(e) => setForm((f) => ({ ...f, bodyMarkdown: e.target.value }))}
            className="w-full rounded-2xl border-2 border-border/70 bg-background px-4 py-3 text-sm font-mono"
            data-testid="admin-post-form-body-input"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.status === "published"}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked ? "published" : "draft" }))}
            data-testid="admin-post-form-published-checkbox"
          />
          <span className="text-sm font-semibold">Published</span>
        </label>

        {error ? (
          <div className="text-sm font-semibold text-destructive" data-testid="admin-post-form-error">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-60 justify-self-start"
          data-testid="admin-post-form-submit"
        >
          {saving ? "Saving…" : "Save post"}
        </button>
      </form>
    </AdminLayout>
  );
}
```

- [ ] **Step 6: Register the admin routes in `client/src/App.tsx`**

Add imports:

```tsx
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { AdminPostForm } from "@/pages/admin/AdminPostForm";
```

Add inside the `<Switch>`, after the `/blog/:slug` route added in Task 7:

```tsx
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/posts/new">
          <AdminPostForm mode="create" />
        </Route>
        <Route path="/admin/posts/:id/edit">
          <AdminPostForm mode="edit" />
        </Route>
        <Route path="/admin" component={AdminDashboard} />
```

- [ ] **Step 7: Type-check and build**

Run: `npm run check`
Expected: no new errors.

Run: `npm run build`
Expected: builds successfully.

- [ ] **Step 8: Smoke-test the admin API flow end-to-end (server-side truth) and confirm client files compile**

The auth enforcement itself was already verified server-side in Task 4 and Task 6 — that's the real security boundary. For this task, confirm the new client files compile cleanly:

```bash
for f in src/components/AdminLayout.tsx src/pages/admin/AdminLogin.tsx src/pages/admin/AdminDashboard.tsx src/pages/admin/AdminPostForm.tsx; do
  echo -n "$f: "
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:5000/$f"
done
```

Expected: all four return `200`.

Then do one real end-to-end pass through the actual UI in a browser: log in at `/admin/login`, confirm redirect to `/admin`, create a post as a draft, confirm it's in the list but not on `/blog`, edit it and mark it published, confirm it now appears on `/blog` and `/blog/<slug>`, then delete it and confirm it's gone from both admin and public views. This is the one step in this whole plan that needs a real browser — do it manually since no reliable browser automation is available in this environment for this project.

- [ ] **Step 9: Commit**

```bash
git add client/src/hooks/use-admin.ts client/src/components/AdminLayout.tsx client/src/pages/admin/ client/src/App.tsx
git commit -m "Add admin dashboard UI (login, post list, post editor)"
```

---

### Task 9: Documentation and final verification

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: nothing new — this task only documents what Tasks 1–8 built.

- [ ] **Step 1: Add a "Blog & Admin" section to `CLAUDE.md`**

Add a new `###` section after the existing "Database: Neon Postgres, live" section:

```markdown
### Blog & Admin

Single-admin auth (`server/auth.ts`): a signed httpOnly cookie (`gad_admin_session`, stdlib `crypto` HMAC — no session table, deliberately stateless for Vercel serverless). Credentials live in env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (scrypt hash, generate with `npm run admin:hash-password -- <password>`), `SESSION_SECRET`. `requireAdminAuth` middleware guards every `/api/admin/*` route except `/api/admin/login`.

Blog posts (`blog_posts` table, `shared/schema.ts`) are Markdown (`bodyMarkdown`, rendered client-side with `react-markdown` on `/blog/:slug`), with a `draft`/`published` status and a `publishedAt` timestamp set once on first publish (not touched by later edits). Public routes (`GET /api/blog/posts`, `GET /api/blog/posts/:slug`) only ever return published posts. Admin CRUD lives at `/api/admin/posts*`, UI at `/admin` (`AdminLayout` client-side-guards these routes by calling `GET /api/admin/me` — the real enforcement is server-side).

Cover images are a pasted URL field, not a real upload — no object storage is wired up.
```

- [ ] **Step 2: Full clean verification**

Run: `npm run check`
Expected: no new errors.

Run: `rm -rf dist && npm run build`
Expected: builds successfully; `dist/public/index.html` and `dist/index.cjs` both present.

Run: `rm -rf dist` again afterward to avoid committing build output (already gitignored, but keep the working tree clean).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "Document blog and admin auth subsystem in CLAUDE.md"
```

- [ ] **Step 4: Push**

```bash
git push origin main
```

Confirm the Vercel deployment for this push succeeds (check the build logs or the live URL) before considering this plan done — this is the first real-infra confirmation that `api/index.ts`'s serverless entry (unchanged by this plan, but now serving a lot more routes) still works correctly with the new routes under load in production.
