# GAD Legal Consult - Landing Page Website

> **Note**: This application has been migrated from Replit to local development. See `MIGRATION_FROM_REPLIT.md` for details on changes made. For local setup instructions, see `SETUP.md`.

## Overview

GAD Legal Consult is a professional landing page website for a modern law firm founded by Victor Momodu. The site is a single-page application with sections for services, about, contact, and newsletter subscription. It's built as a full-stack TypeScript application with a React frontend and Express backend, backed by PostgreSQL. The primary goal is lead generation through a contact form and newsletter signup, while establishing the firm's credibility in corporate law, contract drafting, litigation, and real estate services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses a three-folder monorepo pattern:
- **`client/`** — React SPA (Vite-powered)
- **`server/`** — Express API server
- **`shared/`** — Code shared between client and server (schema, route definitions, validation)

This avoids code duplication for types, validation schemas, and API contracts.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router) — currently only has `/` and a 404 fallback
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style). Custom CSS variables define brand colors (Navy #000053, Firebrick Red #B22222, Near Black #111111)
- **Typography**: IBM Plex Sans (body) and Fraunces (display/headings) loaded via Google Fonts
- **State Management**: TanStack React Query for server state; no global client state library
- **Forms**: React Hook Form with Zod resolvers for validation
- **Build Tool**: Vite with HMR in development, static build for production
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express 5 on Node.js
- **API Pattern**: REST endpoints under `/api/` prefix. Route definitions live in `shared/routes.ts` with Zod schemas for input validation and response typing — both client and server reference the same contract
- **Development**: Vite dev server is integrated as Express middleware (via `server/vite.ts`) for HMR
- **Production**: Client is built to `dist/public/`, server is bundled with esbuild to `dist/index.cjs`. Express serves the static files with SPA fallback

### API Endpoints
- `GET /api/public/site-config` — Returns organization info, contact details, social links
- `GET /api/public/seo/:slug` — Returns SEO metadata for a given page slug
- `POST /api/contact` — Accepts contact form submissions (validated with Zod)
- `POST /api/newsletter/subscribe` — Newsletter email signup (409 on duplicate)

### Database Layer
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation bridges
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema changes directly (no migration files needed for development)
- **Tables**:
  - `contact_submissions` — id, full_name, email, phone, service_interested_in, message, created_at
  - `newsletter_subscriptions` — id, email (unique), created_at
  - `seo_pages` — slug (PK), title, description
- **Storage Pattern**: `IStorage` interface in `server/storage.ts` with `DatabaseStorage` implementation. Site config is currently hardcoded in the storage class (not DB-driven)

### Shared Contract Pattern
The `shared/routes.ts` file defines API routes as typed objects with method, path, input schema, and response schemas. Both the server (for validation) and client hooks (for type-safe fetching) import from this single source of truth. This ensures the API contract stays synchronized.

### Client-Side SEO
Since there's no SSR, SEO is handled client-side via a `MetaManager` component that dynamically updates `document.title`, meta tags, Open Graph tags, canonical links, and JSON-LD structured data.

### Key Scripts
- `npm run dev` — Starts development server with Vite HMR
- `npm run build` — Builds client (Vite) and server (esbuild) to `dist/`
- `npm start` — Runs production build
- `npm run db:push` — Pushes Drizzle schema to PostgreSQL

## External Dependencies

### Database
- **PostgreSQL** — Required. Connection string must be provided via `DATABASE_URL` environment variable. Used with `pg` (node-postgres) driver and Drizzle ORM. Session store uses `connect-pg-simple`.

### UI Libraries
- **shadcn/ui** — Pre-installed component library built on Radix UI primitives. Components live in `client/src/components/ui/`. Configuration in `components.json`.
- **Lucide React** — Icon library used throughout the UI
- **Embla Carousel** — Carousel component dependency

### Build & Development
- **Vite** — Frontend build tool and dev server
- **esbuild** — Server bundling for production
- **tsx** — TypeScript execution for development server

### Validation
- **Zod** — Schema validation used on both client and server
- **drizzle-zod** — Generates Zod schemas from Drizzle table definitions

### No Authentication
The application has no authentication or authorization. All API endpoints are public. The `credentials: "include"` on fetch calls is a template convention but no session/auth middleware is active.