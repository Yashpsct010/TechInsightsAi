# TechInsightsAI Version 2.0 (AGENTS.md)

This document is the single source of truth for the architecture, design guidelines, project structure, and progress for **TechInsightsAI v2.0**. All work must be conducted within the `techinsightsai_v2` directory.

---

## 1. Project Mission & High-Level Architecture

TechInsightsAI v2.0 is an enterprise-ready, high-performance tech blogging and intelligence platform built on Next.js 15 (App Router), Turborepo, and a decoupled event-driven background worker.

### The Core Architectural Shifts
1. **Next.js App Router (`apps/web`)**: Replaces the Vite SPA. Provides Static Site Generation (SSG) and Server-Side Rendering (SSR) for blogs, zero-TTFB initial loads, instant SEO indexability, and edge-ready serverless API handlers (`app/api/*`).
2. **Decoupled AI Worker (`apps/ai-worker`)**: Standalone background Node.js worker service solely responsible for Gemini AI generation, newsletter digests, and cron schedules. User-facing read requests never contend with heavy background writes.
3. **Shared Database Core (`packages/database`)**: Shared Mongoose connection pooling and type-safe schema layer used uniformly by both `apps/web` and `apps/ai-worker`.
4. **Modern Frontend Infrastructure**:
   - **TanStack Query (React Query)**: Intelligent in-memory caching, stale-while-revalidate data fetching, and request deduplication.
   - **Axios with Global Interceptors**: Dedicated API layer with automatic JWT bearer attachment and 401 unauth interception.
   - **Modernized IndexedDB (`idb`)**: Promise-based offline storage for saved blogs.
   - **Non-blocking Auth & Optimistic Routing**: Eliminates full-page loading spinners; allows instant access to public pages.
5. **Visual Identity & UI Design**:
   - **Requirement**: Maintain the **exact same UI and aesthetic from Version 1**. No visual changes to the UI styling.
   - **Theme**: Cyber-Terminal / Neo-Brutalist / Safety-Orange (`#ec5b13`) on deep obsidian (`#0a0a0c`).
   - **Styling**: Monospace typography headers, `glass-shard`, `glass-panel`, `glitch-text` animation, drop-caps in articles, and identical layouts, navigation, and footer.

---

## 2. Monorepo Structure

```
techinsightsai_v2/
├── AGENTS.md                   # This project guide & progress tracker
├── package.json                # Monorepo root workspace config
├── turbo.json                  # Turborepo task pipeline
├── .gitignore
├── apps/
│   ├── web/                    # Next.js 15 App Router (Frontend + API Routes)
│   └── ai-worker/              # Decoupled Gemini AI generator & cron worker
└── packages/
    ├── database/               # Shared Mongoose models & connection pool
    └── tsconfig/               # Shared TypeScript configurations
```

---

## 3. Staged Implementation Plan & Status

| Stage | Name | Status | Key Deliverables |
| :--- | :--- | :---: | :--- |
| **Stage 1** | **Monorepo Foundation & Shared DB** | **COMPLETED** | Turborepo workspaces, `@techinsights/database` with `Blog`, `User`, `Intel` models, compound indexes, text search, serverless cached connection pool, verified ES module build. |
| **Stage 2** | **Next.js Shell & Exact V1 UI** | **COMPLETED** | Next.js 15 App Router (`apps/web`), exact v1 cyber-orange terminal aesthetic, Tailwind v4, centralized Axios client with interceptors, non-blocking AuthContext, Header, Footer, WhatsNewCard, and Home page. |
| **Stage 3** | **Data Layer, Auth & Core Pages** | **COMPLETED** | Native API routes (`app/api/*`), Blog Feed (`/blog`), Archive (`/blogs`), Reading View (`/blog/[id]`), Auth (`/login`, `/register`), Bookmarks (`/bookmarks`), Profile (`/profile`), About (`/about`), Admin Jobs (`/jobs`), and Promise-based IndexedDB (`idb`). |
| **Stage 4** | **Decoupled AI Worker** | **COMPLETED** | Standalone background Node.js service, Gemini AI blog generator, RSS/news ingestion, daily intel cron, and newsletter automation (`apps/ai-worker`). |
| **Stage 5** | **SEO, PWA & Production Polish** | **COMPLETED** | Dynamic XML sitemap (`/sitemap.xml`), `robots.txt`, JSON-LD schema (`WebSite`, `Organization`, `TechArticle`), PWA manifest, and full Turborepo monorepo verification. |
| **Stage 6** | **Production Rollout & Cloud Consolidation** | **COMPLETED** | Migration from 3-tier hybrid to unified Next.js 15 Vercel edge + GitHub Actions serverless cron. Render decommissioned ($0.00/mo cost), repository promoted to root monorepo, and official release `v2.0.0` live. |

### Stage 1 Execution Summary
- **Workspace Architecture**: Configured root `package.json` with npm workspaces (`apps/*`, `packages/*`) and `turbo.json` caching build pipelines.
- **Shared Package (`@techinsights/database`)**:
  - Connection Pool: `connectToDatabase()` with serverless global singleton promise cache, connection reuse, and configurable pool limits.
  - `Blog` Model: Strongly typed schema with compound index `{ genre: 1, createdAt: -1 }`, latest index `{ createdAt: -1 }`, and full-text index on `{ title: "text", body: "text" }`.
  - `User` Model: Strongly typed schema with bcrypt pre-save salt/hash and `matchPassword()` instance method.
  - `Intel` Model: Strongly typed daily tech intel schema with `displayDate` indexing.
  - Shared Types: Exported TypeScript types (`IBlog`, `IUser`, `IIntel`, `BlogGenre`, `SystemStatus`).
- **Verification**: Compiled via `tsc` to `./dist` with full `.d.ts` declarations and verified clean dynamic ESM imports across the monorepo.

### Stage 2 Execution Summary
- **Next.js 15 App Router Scaffold**: Created `@techinsights/web` workspace linked to `@techinsights/database`.
- **Exact V1 Aesthetic**: Replicated the complete cyberpunk/terminal/orange theme (`#0a0a0c`, `#ec5b13`), glass-shard panels, glitch flicker animation, drop-caps, and monospace typography in `app/globals.css`.
- **Decoupled Client Architecture**:
  - `apiClient.ts`: Global Axios client with automatic JWT bearer attachment and 401 unauth event dispatcher.
  - `authService.ts`: Pure API layer cleanly separating network calls from state mutation.
  - `AuthContext.tsx`: Non-blocking optimistic auth provider eliminating the root loading spinner so public pages load with Zero TTFB.
  - `providers.tsx`: TanStack Query + AuthProvider wrapping the root layout.
- **Exact UI Components**:
  - `Header.tsx`: Terminal brand logo, desktop navigation with animated active underline, mobile menu portal, and user profile dropdown.
  - `Footer.tsx`: Interface nodes, system uptime status panel, social links, and newsletter sync form.
  - `WhatsNewCard.tsx`: Interactive HTML5 scratch canvas with daily intel decryptor and floating shake button.
  - `Home.tsx`: Kinetic typography hero section, live system status beacon, feature grid, and metrics row.
- **Verification**: Verified zero TypeScript errors (`tsc --noEmit`) and successful production compilation (`next build` generating static prerendered pages).

### Stage 3 Execution Summary
- **Serverless API Routes (`app/api/*`)**:
  - `/api/blogs`: Paginated query engine with regex search, genre filtering, and date filtering (`week`, `month`, `year`).
  - `/api/blogs/[id]`: Single blog retrieval by ObjectId or vanity slug.
  - `/api/blogs/latest`: Instant retrieval of latest published blog with optional genre filter.
  - `/api/auth/register` & `/api/auth/login`: JWT issuance with bcrypt password validation.
  - `/api/auth/profile` & `/api/auth/preferences`: Authenticated preference updates and newsletter toggling.
  - `/api/auth/bookmarks` & `/api/auth/bookmarks/[id]`: User bookmark retrieval and atomic toggle.
  - `/api/intel/today`: Today's encrypted daily intel packet with automatic fallback generation.
  - `/api/system-status`: Live cluster telemetry (integrity, FLOPs load, DEFCON security status).
  - `/api/jobs/search` & `/api/jobs/extract-skills`: Admin-protected job search via RapidAPI and Gemini multimodal PDF resume skill extraction.
- **Core Pages & Replicas (Exact V1 UI)**:
  - `/blog`: Latest blog reading view with dynamic genre pills and newsletter trigger (`Blog.tsx`).
  - `/blogs`: Complete searchable archive with trending signal hero card, grid cards, stats bar, and pagination (`BlogsPage.tsx`).
  - `/blog/[id]`: Dedicated article view with drop-caps, auth metadata, share protocols, and real-time status sidebar (`BlogDetailPage.tsx`).
  - `/login` & `/register`: Dual cyber-terminal auth forms with validation and glow effects (`Login.tsx`, `Register.tsx`).
  - `/profile`: Tabbed settings view for node profile, data protocols, and saved intel (`Profile.tsx`).
  - `/bookmarks`: Saved article library with confirmation modal (`Bookmarks.tsx`, `ConfirmDialog.tsx`).
  - `/about`: System origin manifest, core directives, and architect profile (`About.tsx`).
  - `/jobs`: Admin-only live roles terminal with PDF resume upload parser (`Jobs.tsx`).
- **Data & Storage Infrastructure**:
  - `offlineDataService.ts`: Replaced outdated callback-based IndexedDB with modern `idb` Promise wrappers for reliable offline blog caching.
  - `blogService.ts`: TanStack Query integration with automatic offline fallback.
  - `useBlogById.ts`: Cached single-blog query hook with background revalidation.
- **Verification**: Zero TypeScript errors (`tsc --noEmit`) and 100% successful production build (`next build` generating 14 static and dynamic routes).

### Stage 4 Execution Summary
- **Decoupled AI Worker (`apps/ai-worker`)**:
  - Independent Node.js service running on `tsx` / `NodeNext`, keeping background generation loads isolated from user-facing traffic.
  - `rssService.ts`: Real-time RSS ingestion from TechCrunch, The Verge, Wired, MIT, and Hacker News for grounding content in actual 48-hour developments.
  - `geminiService.ts`: Grounded synthesis using structured JSON output, balanced bracket extractor, exponential backoff, and safety fallbacks.
  - `imageService.ts`: Automated Unsplash landscape image query engine with graceful fallback generation.
  - `blogGenerator.ts`: Full autonomous article generator and Mongoose persistence via `@techinsights/database`.
  - `intelGenerator.ts`: Daily hacker/developer tip generator with automatic 12-hour cadence lock.
  - `newsletterService.ts`: Cyberpunk dark-mode HTML newsletter compiler with Nodemailer batch delivery to active subscribers.
  - `scheduler.ts`: Built-in `node-cron` orchestrator with schedules for Daily Blog (00:00), Daily Intel (06:00), and Weekly Newsletter (Friday 17:00).
  - Standalone CLI scripts: `generateBlog.ts`, `generateIntel.ts`, `sendNewsletter.ts` for CI/CD and manual trigger workflows.

### Stage 5 Execution Summary
- **Search Engine Optimization (SEO)**:
  - Dynamic `sitemap.ts` generating `/sitemap.xml` with priority routing for the latest 100 articles and static landing pages.
  - Dynamic `robots.ts` serving `/robots.txt` with sitemap referencing and protected route exclusion (`/api/`, `/jobs`, `/profile`).
  - Dynamic OpenGraph and Twitter cards in `app/blog/[id]/page.tsx` via `generateMetadata`.
  - JSON-LD Structured Data:
    - Root layout embeds schema.org `WebSite` and `Organization` with SiteSearch action and social profile links.
    - Article pages embed schema.org `TechArticle` / `BlogPosting` with publication dates, headline, author, and image objects.
- **Monorepo Build Verification**:
  - Turborepo `build` passes cleanly across all 3 packages (`@techinsights/database`, `@techinsights/web`, `@techinsights/ai-worker`).
  - Turborepo `check-types` verifies 0 errors across the entire codebase (`tsc --noEmit`).

---

## 4. Development & Engineering Standards

- **TypeScript First**: All packages and applications must be strictly typed.
- **Serverless-Safe DB Connections**: Always use cached connection promises to prevent connection pool exhaustion in serverless edge/lambda environments.
- **Pure API Layer**: UI components must never manage direct network calls or mutate `localStorage` directly; use centralized services and TanStack Query hooks.
- **Zero-Flicker UX**: Never block public pages behind auth checks; use optimistic rendering with passive redirect on auth failure.
- **Localhost Development Configuration**: Target host across Next.js metadata, dynamic SEO sitemaps, robots, JSON-LD schemas, and AI worker defaults to `http://localhost:3000` (instead of production Vercel domain) for seamless local running. Multi-tier `.env` files are configured in root, `apps/web/.env`, and `apps/ai-worker/.env`.

