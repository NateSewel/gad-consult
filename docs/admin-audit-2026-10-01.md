# Admin dashboard audit, 2026-10-01

Scope: `client/src/pages/admin/*`, `client/src/components/AdminLayout.tsx`, `client/src/hooks/use-admin.ts` (admin-only). Register: product. Method: manual code audit (the bundled detector returned no findings), contrast computed from `index.css` tokens. Line numbers refer to the files before this audit's fixes.

## Anti-pattern verdict

Does not read as AI-generated slop, but had two product-register tells: a four-up identical icon-circle stat-card grid ("Welcome back" hero) in `AdminOverview.tsx:189-222`, and a decorative donut for a two-value split. Display font (Fraunces) was used for a UI label (`AdminLayout.tsx:156`). No gradient text, glass, or side-stripe borders in the admin pages.

## Health Score

| Dimension | Before | After | Notes |
|---|---|---|---|
| Accessibility | 1 | 3 | Missing focus rings, labels via wrapping only, no aria-current/landmarks, sub-AA contrast, 1.2:1 input borders |
| Performance | 2 | 3 | 1.5s chart animations, unmemoized derived data, unbounded submissions list |
| Responsive | 2 | 3 | Logout hidden off-screen in mobile nav, 36px touch targets, truncation bugs |
| Theming | 2 | 3 | Published badge 1.7:1 in dark, fire text 3.8:1 in dark, red "draft" semantic clash |
| Anti-patterns / UX states | 1 | 3 | No error states (failures shown as "empty"), native confirm, no success feedback, truncated messages unreadable |
| **Total /20** | **8** | **15** | Good, minor gaps (see Left) |

## Findings

### P0
None. (No data loss or auth bypass; enforcement is server-side.)

### P1
1. **Load failures render as empty states.** `AdminDashboard.tsx:36`, `AdminSubmissions.tsx:44`, `AdminOverview.tsx:116-119` ignore `isError`; a 5xx or expired session shows "No posts yet." / zeroed stats. Fix: error panel with retry on every page (`AdminStates.tsx`).
2. **Session expiry never handled.** `use-admin.ts:5-13` caches `/me` forever (`staleTime: Infinity`); an expired cookie leaves the UI open with failing queries. `useAdminMe` also returned `false` for 5xx, redirecting to login on a blip, and threw on network error leaving a blank page (`AdminLayout.tsx:57`). Fix: 401 from any admin query or mutation flips the `/me` cache, redirect with `replace`; non-401 shows a retry screen. WCAG 2.2.1 related.
3. **Edit form with failed load is an empty editable form.** `AdminPostForm.tsx:76-92`. Saving would overwrite the post with blank-based input. Fix: error state with back link.
4. **Submission messages truncated with no way to read them.** `AdminSubmissions.tsx:80` (`line-clamp-3`). Data inaccessible in the UI. Fix: "Show full message" toggle with `aria-expanded`.
5. **Contrast below 4.5:1 (WCAG 1.4.3).** Published badge `text-secondary` navy on dark: 1.7:1 (`AdminDashboard.tsx:57`). `text-primary` fire on dark card: 3.8:1, active nav 4.1:1 (`AdminLayout.tsx:120,173`). `text-destructive` on light: 4.1:1 (login/form errors, delete button). Fix: admin-only `text-admin-accent/danger/navy` utilities (all >= 5.6:1 light and dark).
6. **Form control borders 1.2:1 (WCAG 1.4.11).** All inputs `border-border/70` (login:41,52; form:106-154). Fix: `border-muted-foreground/80` (about 3.3:1).
7. **No visible focus styles on custom links/buttons (WCAG 2.4.7)** and no skip link/aria-current/nav labels (2.4.1, 1.3.1, 4.1.2). `AdminLayout.tsx:92-148,169-190`, row buttons in dashboard. Fix: focus rings, `aria-current="page"`, labelled navs, skip link, `<main>` on login.
8. **Errors not announced, not associated (WCAG 3.3.1, 4.1.3).** `admin-login-error`, `admin-post-form-error` plain divs. Raw `409: {"message":...}` strings shown to users in the post form. Fix: `role="alert"`, `aria-describedby`/`aria-invalid`, focus the form error, parse server message.
9. **Login masks all failures as "Invalid email or password."** (`AdminLogin.tsx:18-19`). Fix: only 401 says that; others say the server could not be reached.

### P2
10. Native `window.confirm` for delete, no pending/success/failure feedback (`AdminDashboard.tsx:77`). Fix: shadcn AlertDialog, toast, per-row "Deleting...".
11. Login inputs lack `autocomplete` (WCAG 1.3.5), no autofocus, no brand.
12. Mobile: Log out hidden at end of a horizontally scrolling nav (`AdminLayout.tsx:161-191`); touch targets about 36px (2.5.8). Fix: logout moved to header row, equal-width nav, 44px targets.
13. Stat-card icon grid + "Welcome back" hero (`AdminOverview.tsx:164-222`): product-register anti-pattern. Fix: single divided stat strip, no decorative icons, "Overview" with real subtitle.
14. Recharts 1.5s mount animation on all charts (product motion rule 150-250ms). Fix: `isAnimationActive={false}`; donut replaced by a labelled proportion bar (also removes red "draft" colour); top-services bar chart replaced by an HTML list (labels were clipped at `YAxis width={110}`).
15. No chart text alternatives. Fix: `role="img"` + `aria-label` summary; legends already textual.
16. Submissions list unbounded, no search (`AdminSubmissions.tsx:53`). Fix: client search (shown above 25 rows) and "Show N more" paging at 25. Email/phone are now mailto/tel links.
17. Display font on UI label "GAD Admin" (`AdminLayout.tsx:156`) and chart panel titles. Fix: sans.
18. `localStorage` read/write unguarded (`AdminLayout.tsx:31,44`). Fix: try/catch.
19. Post form: no cancel/back, no unsaved-changes warning, no field hints, no success feedback, checkbox is a bare native input; row Edit/Delete buttons share identical accessible names. Fix: back/cancel, `beforeunload` guard, hints, toast, shadcn Checkbox/Label, `aria-label` with post title.
20. Long post titles do not truncate (`AdminDashboard.tsx:52-53`, inner flex lacks `min-w-0`).
21. Logout keeps cached admin data in memory. Fix: remove admin queries on logout.
22. Loading is plain "Loading..." text. Fix: skeletons shaped like rows.
23. Logo (navy wordmark) near-invisible on dark surface. Fix: white chip behind logo in dark mode (admin usages only).

### P3
24. `ThemeToggle` (shared with public site) uses `backdrop-blur`, hover lift and 300ms transitions. Left: shared component, public page is out of scope.
25. No in-app (router-level) unsaved-changes guard on Cancel/nav links; only `beforeunload`.
26. Redirect to login does not preserve the originally requested admin URL.
27. No Markdown preview in the post editor; cover image is a pasted URL (known design decision).
28. Submissions are cards, not a `<table>`; chosen deliberately for the long message body and mobile reflow (list semantics used).
29. Bundle: single 1.0 MB+ client chunk (Vite warning); admin pages are not code-split from the landing page.

## Systemic patterns
- Raw brand tokens used as small-text colours (`text-primary`, `text-secondary`, `text-destructive`) fall below AA on one theme; now routed through admin utilities in `index.css`.
- Hand-rolled form controls and buttons duplicated chrome and skipped shadcn's focus handling; admin now uses `Button`, `Input`, `Textarea`, `Label`, `Checkbox`, `AlertDialog`, `Skeleton`.
- Query layer swallowed non-2xx as empty; centralised in `adminGet` and `getAdminErrorMessage`.

## Positive findings
Server-side auth on every admin route; stateless cookie scheme; stable `data-testid` coverage (preserved); sidebar collapse persists; chart colours were pre-validated for CVD; copy has no em dashes; cache invalidation after mutations is correct (list key is a prefix of the item key).

## Verification
`npm run check` and `npm run build` pass. Browser check limited to the unauthenticated login page at 1366 and 375 wide, light and dark, no horizontal overflow. Authenticated pages were not visually verified (a session cookie could not be minted under this environment's credential restrictions); those were verified by code review, type check and build only.
