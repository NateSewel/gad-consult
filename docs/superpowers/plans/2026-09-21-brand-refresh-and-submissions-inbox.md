# Brand Refresh & Admin Submissions Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Do NOT create a git worktree for this plan — the user has a standing preference to work directly on `main` in this project. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (A) Correct the landing page's brand colors, service list, founder name, and address to match the real business, and (B) give the admin real visibility into contact form submissions (today they only land silently in Postgres — no email, no admin UI).

**Spec:** none (bounded task, approved in chat — see conversation).

## Global Constraints

- No test suite exists in this repo. Every task is verified with `npm run check` (TypeScript) and a functional smoke check against the real dev server / real Neon DB.
- Follow existing conventions exactly: `shared/routes.ts`'s typed-endpoint-object pattern, `server/storage.ts`'s `IStorage`/`DatabaseStorage` style, `client/src/hooks/use-admin.ts`'s `useQuery`/`useMutation` pattern, `client/src/pages/admin/AdminDashboard.tsx`'s page structure (loading/empty/data states, `data-testid` attributes), raw-Tailwind-styled buttons/inputs (no shadcn `Button`/`Input`).
- No new npm dependencies in this plan.
- A route not in `shared/routes.ts`'s typed `api` object (e.g. a non-JSON file download) may still be registered directly in `server/routes.ts` with a literal path string — precedent: the existing `/sitemap.xml` route.

---

### Task 1: Brand & content refresh

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/src/pages/Landing.tsx`
- Modify: `server/storage.ts`

**Interfaces:** None produced for other tasks — Task 2 also touches `server/storage.ts` (adding a new method) but does not depend on anything Task 1 adds; Task 2's dispatch will note Task 1 already landed so its diff doesn't clobber this one.

- [ ] **Step 1: Swap the brand color tokens in `client/src/index.css`**

At lines 19-20, replace:
```css
--navy: 240 100% 16%; /* #000053 */
--fire: 0 68% 42%; /* #B22222 */
```
with:
```css
--navy: 234 53% 36%; /* #2B348C */
--fire: 359 84% 52%; /* #EC1D21 */
```
These are the exact HSL equivalents of the brand hex values `#2B348C` (navy blue) and `#EC1D21` (red). Every other token in this file (`--primary`, `--secondary`, `--ring`, `--chart-1/2`, `--sidebar-*`, the mesh-gradient background) already derives from `var(--navy)`/`var(--fire)`, so this one edit cascades through buttons, charts, and the background — don't touch those derived lines.

- [ ] **Step 2: Replace hardcoded brand hex literals in `client/src/pages/Landing.tsx`**

These four spots use raw hex Tailwind arbitrary values (not the CSS vars from Step 1), so they need direct literal swaps. Use these exact replacement values — don't compute your own tints:

| Line (approx) | Old | New | Context |
|---|---|---|---|
| ~276 | `from-[#000053]/85 via-[#000053]/75` | `from-[#2B348C]/85 via-[#2B348C]/75` | hero background gradient (leave `to-[#111111]/90` unchanged — neutral, not brand) |
| ~309 | `text-[#e8a0a0]` | `text-[#F69899]` | light tint of the red, used on "Business" in the hero headline for contrast against the navy background |
| ~340 | `bg-[#B22222] ... border border-[#d43c3c]` | `bg-[#EC1D21] ... border border-[#EF3F42]` | primary hero CTA button (fill + border) |
| ~989 | `bg-[#B22222]` | `bg-[#EC1D21]` | "Founder" badge on the team card |

Leave `shadow-red-900/*` Tailwind palette classes near the CTA button alone — those are Tailwind's built-in palette, not a brand hex, out of scope.

- [ ] **Step 3: Replace the `SERVICES` array (lines ~71-112) with the real 9 services**

```tsx
const SERVICES = [
  {
    title: "Corporate Law & Regulatory Compliance",
    description: "Structure, governance, and compliance guidance for startups and growing businesses.",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Fintech & Tech",
    description: "Legal support for fintech and technology companies navigating a fast-moving regulatory landscape.",
    icon: <Cpu className="h-5 w-5" />,
  },
  {
    title: "Fintech Licenses",
    description: "Licensing strategy and regulatory filings to get fintech ventures operating compliantly.",
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    title: "Intellectual Property",
    description: "Protect your brand, creative works, and innovations with smart filings and strategy.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Taxation",
    description: "Practical tax advisory to keep your business compliant and efficiently structured.",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: "Sports & Entertainment",
    description: "Contracts, rights, and representation for athletes, artists, and entertainment ventures.",
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    title: "Corporate & Commercial Litigation",
    description: "Strategic representation — negotiation first, courtroom-ready when needed.",
    icon: <Gavel className="h-5 w-5" />,
  },
  {
    title: "Data Protection & Privacy",
    description: "Navigate data protection requirements with clear, actionable compliance steps.",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Real Estate",
    description: "Due diligence, documentation, and transaction support for property matters.",
    icon: <Landmark className="h-5 w-5" />,
  },
] as const;
```

Add `Cpu`, `FileCheck`, `Calculator`, `Trophy` to the `lucide-react` import block at the top of the file. After the replacement, check whether `FileSignature`, `Handshake`, and `Users` are still referenced elsewhere in this same file (they were previously used by services this list removes) — `FileSignature` and `Handshake` are also used later in the file (footer badges / `WhyCard` calls) so stay imported; if `Users` ends up with zero remaining references in the file after this edit, remove it from the import to avoid an unused import.

- [ ] **Step 4: Fix the founder name and address fallback in `client/src/pages/Landing.tsx`**

- Line ~199, inside the `jsonLd` `useMemo`: `founder: org?.founder ?? "Victor Momodu"` → `founder: org?.founder ?? "Victor Ayegbeni"`
- Line ~607, the founder `<TeamCard>` call: `name="Victor Momodu"` → `name="Victor Ayegbeni"`
- Line ~793, the address `<InfoCard>` fallback: `value={contact?.address ?? "Lagos, Nigeria"}` → `value={contact?.address ?? "No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State"}`

Do not touch the `Adaeze Nwosu` / `Chukwudi Eze` team cards — confirmed real people, left as-is.

- [ ] **Step 5: Update `server/storage.ts`**

- `SEED_SEO_PAGES` "about" entry description (~line 54): `"Founded by Victor Momodu, GAD Legal Consult is a forward-thinking law firm built to meet modern legal and regulatory needs."` → replace `Victor Momodu` with `Victor Ayegbeni`.
- `getPublicSiteConfig()`'s `organization.founder` (~line 70): `"Victor Momodu"` → `"Victor Ayegbeni"`.
- `getPublicSiteConfig()`'s `contact.address` (~line 75): currently `undefined` → set to `"No. 4 Helen Gomwalk Way, off Old Airport Roundabout, Jos, Plateau State"`.

- [ ] **Step 6: Verify**

Run `npm run check` — expect no new errors (pre-existing framer-motion error, if any, is unrelated and fine).

Run `npm run dev`, load `/`, and confirm: hero uses the new navy/red, the services grid shows all 9 new services in a 3×3 grid with distinct icons, the About/Team sections show "Victor Ayegbeni", and the Contact section's address card shows the Jos address (should come from the live `/api/public/site-config` response now, not the fallback).

Commit.

---

### Task 2: Admin submissions inbox

**Depends on:** Task 1 complete and committed (this task edits `server/storage.ts` again — brief will note Task 1's founder/address edits are already in place, don't revert them).

**Files:**
- Modify: `shared/routes.ts`
- Modify: `server/storage.ts`
- Modify: `server/routes.ts`
- Modify: `client/src/hooks/use-admin.ts`
- Modify: `client/src/components/AdminLayout.tsx`
- Modify: `client/src/App.tsx`
- Create: `client/src/pages/admin/AdminSubmissions.tsx`

**Context:** Contact form submissions (`contact_submissions` table: `id`, `fullName`, `email`, `phone`, `serviceInterestedIn`, `message`, `createdAt`) are written on `POST /api/contact` but nothing today lets the admin see them — no email notification, no admin page. This task adds a read-only admin list page and a CSV export, reusing the existing admin cookie auth (`requireAdminAuth` from `server/auth.ts`) and the existing `contact_submissions` table — no schema change.

- [ ] **Step 1: Add the endpoint to `shared/routes.ts`**

Add a `submissions` block inside the existing `admin` object (alongside `login`/`logout`/`me`/`posts`):
```ts
submissions: {
  list: {
    method: "GET" as const,
    path: "/api/admin/submissions" as const,
    responses: {
      200: z.array(z.custom<typeof contactSubmissions.$inferSelect>()),
    },
  },
},
```
Add this export near the bottom with the other response type exports:
```ts
export type SubmissionResponse = z.infer<typeof api.admin.submissions.list.responses[200]>[number];
```
(`contactSubmissions` is already imported at the top of this file from `./schema.js`.)

The CSV export endpoint (`/api/admin/submissions/export.csv`) is NOT added here — it's a file download, not JSON, so it's registered directly in `server/routes.ts` with a literal path string, same as the existing `/sitemap.xml` route.

- [ ] **Step 2: Add `listContactSubmissions` to `server/storage.ts`**

Add to the `IStorage` interface:
```ts
listContactSubmissions(): Promise<ContactSubmissionResponse[]>;
```
(`ContactSubmissionResponse` is already imported at the top of this file — it's the same shape as `ContactSubmission`, matching this file's existing naming convention for return types.)

Add to `DatabaseStorage`, following the same style as `listAllBlogPosts`:
```ts
async listContactSubmissions(): Promise<ContactSubmissionResponse[]> {
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}
```
(`desc` and `contactSubmissions` are already imported at the top of this file.)

- [ ] **Step 3: Add both routes to `server/routes.ts`**

Add near the existing `api.admin.posts.*` routes:
```ts
app.get(api.admin.submissions.list.path, requireAdminAuth, async (_req, res) => {
  const submissions = await storage.listContactSubmissions();
  res.json(submissions);
});

app.get("/api/admin/submissions/export.csv", requireAdminAuth, async (_req, res) => {
  const submissions = await storage.listContactSubmissions();
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = ["ID", "Full Name", "Email", "Phone", "Service", "Message", "Submitted At"];
  const rows = submissions.map((s) =>
    [s.id, s.fullName, s.email, s.phone, s.serviceInterestedIn ?? "", s.message, s.createdAt.toISOString()]
      .map((v) => escape(String(v)))
      .join(","),
  );
  const csv = [header.map(escape).join(","), ...rows].join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="contact-submissions.csv"');
  res.send(csv);
});
```
Both use `requireAdminAuth` exactly like the existing admin routes in this file — no new middleware.

- [ ] **Step 4: Add `useAdminSubmissions` to `client/src/hooks/use-admin.ts`**

```ts
export function useAdminSubmissions() {
  return useQuery({
    queryKey: [api.admin.submissions.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.submissions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return (await res.json()) as SubmissionResponse[];
    },
  });
}
```
Add `SubmissionResponse` to the existing `@shared/routes` import at the top of this file.

- [ ] **Step 5: Create `client/src/pages/admin/AdminSubmissions.tsx`**

Follow `client/src/pages/admin/AdminDashboard.tsx`'s structure exactly (same `AdminLayout` wrapper, same loading/empty-state pattern, same card-row styling, `data-testid` on every row/field). Show one row per submission: full name, email, phone, service interested in (or "—" if null), message (truncate visually with CSS, don't slice the string), and a relative-or-formatted submission date. Add an "Export CSV" link at the top next to the page heading:
```tsx
<a
  href="/api/admin/submissions/export.csv"
  className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
  data-testid="admin-export-submissions-link"
>
  Export CSV
</a>
```
Plain `<a href download>` navigation carries the existing httpOnly admin cookie automatically — no fetch/blob handling needed.

- [ ] **Step 6: Wire up navigation**

In `client/src/components/AdminLayout.tsx`, add a "Posts" / "Submissions" nav link pair in the header (using wouter's `Link`, same visual style as the existing "Log out" button) so both admin pages are reachable from either one. No active-route highlighting needed — keep it simple.

In `client/src/App.tsx`, import `AdminSubmissions` and add `<Route path="/admin/submissions" component={AdminSubmissions} />` alongside the other `/admin/*` routes.

- [ ] **Step 7: Verify**

Run `npm run check` — expect no new errors.

Run `npm run dev`: submit a test contact form from `/`, log into `/admin`, navigate to `/admin/submissions`, confirm the test submission appears. Click "Export CSV", open the downloaded file, confirm the header row and the test row are present and correctly comma/quote-escaped (submit a second test entry with a comma and a quote in the message field to verify escaping).

Commit.

---

### Final step

After both tasks pass review, this plan's SDD workspace can be deleted per the skill's Finish section. Use superpowers:finishing-a-development-branch to decide how this lands on `main` (direct commits, since there's no worktree/branch isolation for this plan).
