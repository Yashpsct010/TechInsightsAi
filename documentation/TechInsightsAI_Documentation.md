# TechInsightsAI (v2.0) - System Architecture & Technical Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo & System Architecture](#2-monorepo--system-architecture)
3. [Web Application Architecture (`apps/web`)](#3-web-application-architecture-appsweb)
4. [Autonomous AI Worker Service (`apps/ai-worker`)](#4-autonomous-ai-worker-service-appsai-worker)
5. [Shared Database Package (`packages/database`)](#5-shared-database-package-packagesdatabase)
6. [API Route Specifications (`app/api/*`)](#6-api-route-specifications-appapi)
7. [AI Grounding, RAG & Hallucination Prevention](#7-ai-grounding-rag--hallucination-prevention)
8. [Offline Capabilities & Data Resilience (`idb`)](#8-offline-capabilities--data-resilience-idb)
9. [Automated CI/CD & Serverless Cron Workflows](#9-automated-cicd--serverless-cron-workflows)
10. [Technologies Used](#10-technologies-used)
11. [Deployment Architecture & Production Setup](#11-deployment-architecture--production-setup)
12. [Appendix & Environment Configuration](#12-appendix--environment-configuration)

---

## 1. Project Overview

**TechInsightsAI v2.0** is an enterprise-ready, autonomous tech blogging and intelligence platform built on Next.js 15 (App Router), Turborepo, and a decoupled background AI worker.

The platform automatically tracks real-time tech developments from curated, authoritative RSS feeds (TechCrunch, MIT Tech Review, Wired, Hacker News), uses Google's Gemini LLM to synthesize deep-dive articles and developer hacks, and publishes them with zero human intervention.

### Core Value Propositions
- **Zero-TTFB & Instant SEO:** Pre-rendered via Next.js 15 Static Site Generation (SSG) and Server-Side Rendering (SSR) with dynamic OpenGraph cards and JSON-LD structured schemas (`TechArticle`, `WebSite`, `Organization`).
- **Decoupled Architecture:** Read-heavy web traffic on Vercel Edge is strictly separated from compute-heavy AI generation in background workers.
- **Hallucination Prevention:** Strict Retrieval-Augmented Grounding (RAG) constrains Gemini prompts to real-world 48-hour news events and mandatory canonical source URLs.
- **Offline PWA Capabilities:** Offline reading powered by modern Promise-based IndexedDB (`idb`) with automated storage quota management and FIFO cleanup.
- **Cyber-Terminal Neo-Brutalist Aesthetic:** High-contrast safety orange (`#ec5b13`) on obsidian black (`#0a0a0c`), glass panels, monospace terminal typography, and an interactive HTML5 scratch-canvas daily intel decryptor.

---

## 2. Monorepo & System Architecture

The project is structured as a **Turborepo monorepo** managed with npm workspaces, ensuring code sharing, type safety, and parallel task orchestration.

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             Turborepo Monorepo                                   │
│                                                                                  │
│   ┌───────────────────────────────────┐    ┌─────────────────────────────────┐   │
│   │             apps/web              │    │         apps/ai-worker          │   │
│   │      (Next.js 15 App Router)      │    │  (Standalone Node.js AI Engine) │   │
│   │                                   │    │                                 │   │
│   │  • Server-Side Rendering (SSR)    │    │  • RSS Ingestion (48h news)     │   │
│   │  • Serverless APIs (/api/*)       │    │  • Gemini Grounded Synthesis    │   │
│   │  • TanStack Query & Axios Client  │    │  • Unsplash Image Matcher       │   │
│   │  • Promise-based IndexedDB (idb)  │    │  • Nodemailer HTML Newsletter   │   │
│   │  • Edge Vercel Deployment         │    │  • GitHub Actions Daily Cron    │   │
│   └─────────────────┬─────────────────┘    └────────────────┬────────────────┘   │
│                     │                                       │                    │
│                     └───────────────────┬───────────────────┘                    │
│                                         │                                        │
│                                         ▼                                        │
│                        ┌─────────────────────────────────┐                       │
│                        │        packages/database        │                       │
│                        │                                 │                       │
│                        │  • Shared Mongoose Schemas      │                       │
│                        │  • Cached Connection Pool       │                       │
│                        │  • TypeScript Definitions       │                       │
│                        └────────────────┬────────────────┘                       │
└─────────────────────────────────────────┼────────────────────────────────────────┘
                                          │
                                          ▼
                               ┌─────────────────────┐
                               │    MongoDB Atlas    │
                               │   (Cloud Cluster)   │
                               └─────────────────────┘
```

### Monorepo Workspaces Layout
```
TechInsightsAi/
├── .github/
│   └── workflows/
│       ├── generate-blog.yml        # Daily 00:00 UTC blog & intel generator
│       └── generate-newsletter.yml  # Weekly Friday 17:00 UTC newsletter dispatch
├── apps/
│   ├── web/                         # Next.js 15 App Router (Frontend + API Routes)
│   └── ai-worker/                   # Gemini AI generation & RSS ingestion engine
├── packages/
│   ├── database/                    # Shared Mongoose models & connection pool
│   └── tsconfig/                    # Shared base TypeScript configurations
├── AGENTS.md                        # Architectural specification & agent guidelines
├── turbo.json                       # Turborepo task pipeline
└── package.json                     # Monorepo workspaces definition
```

---

## 3. Web Application Architecture (`apps/web`)

The web application is built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**.

### Key Architectural Layers

#### 1. Rendering & SEO Strategy
- **Static Site Generation (SSG) & SSR:** Article views (`app/blog/[id]/page.tsx`) and static pages (`/about`, `/`) are rendered server-side.
- **Dynamic SEO Metadata:** `generateMetadata` injects dynamic OpenGraph titles, descriptions, canonical URLs, and Twitter cards.
- **JSON-LD Structured Data:** Root layout injects `WebSite` and `Organization` schemas; blog pages inject `TechArticle` / `BlogPosting` schemas with author, publisher, and date metadata.

#### 2. Client-Side Data & Caching (`@tanstack/react-query`)
Managed inside `app/providers.tsx`:
```tsx
const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes cache
          gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
);
```
Articles and archive queries are served instantly from the in-memory cache upon navigation, with passive background revalidation.

#### 3. Centralized Axios Client & Interceptors (`services/apiClient.ts`)
- **Request Interceptor:** Automatically checks `localStorage` for active user credentials and injects `Authorization: Bearer <token>`.
- **Response Interceptor:** Traps `401 Unauthorized` responses and fires a decoupled `auth:unauthorized` window event so `AuthContext` can quietly log out stale sessions without hard page reloads.

#### 4. Non-Blocking Optimistic Authentication (`context/AuthContext.tsx`)
- Eliminates the traditional root-level loading spinner. Public pages render immediately (Zero TTFB).
- Profile verification runs asynchronously in the background. Only protected routes (e.g., `/bookmarks`, `/profile`, `/jobs`) conditionally require authentication.

---

## 4. Autonomous AI Worker Service (`apps/ai-worker`)

The background worker is an independent Node.js service running on `NodeNext` and `tsx`, strictly isolated from user HTTP traffic.

### Worker Subsystems

1. **RSS Ingestion Engine (`src/services/rssService.ts`):**
   Scrapes curated tech feeds across 5 distinct genres (`ai-ml`, `cybersecurity`, `coding`, `emerging-tech`, `tech-news`). Feeds include TechCrunch, The Verge, MIT News, KrebsOnSecurity, Ars Technica, and Dev.to. Enforces strict 10s socket timeouts to prevent network hangs.

2. **Grounded Gemini Synthesizer (`src/services/geminiService.ts`):**
   - Model: Google Gemini API (`gemini-3.1-flash-lite`).
   - Generation Config: `temperature: 0.7`, `responseMimeType: "application/json"`.
   - Balanced JSON Parser: A custom state-machine extractor (`extractBalancedJson`) that tracks curly-bracket depth and string escapes, safely bypassing markdown wrappers or conversational preamble.
   - Safety Fallback: Automatically catches `finishReason: SAFETY` and retries with a safe, generalized educational prompt.

3. **Image Matching Engine (`src/services/imageService.ts`):**
   Queries the Unsplash API using article keyword extracts with exponential retries and fallback placeholders.

4. **Automated Newsletter Engine (`src/services/newsletterService.ts`):**
   Compiles a weekly cyberpunk dark-mode HTML digest of the top articles and developer hacks, dispatched via Nodemailer in batches to active subscribers.

5. **Standalone Execution CLI Scripts:**
   - `npm run generate:blog`: Generates and persists a new blog post.
   - `npm run generate:intel`: Generates daily hacker/productivity tip (with 12-hour cadence lock).
   - `npm run send:newsletter`: Compiles and sends weekly email digest.

---

## 5. Shared Database Package (`packages/database`)

Both `apps/web` and `apps/ai-worker` consume database models and connection pooling logic from `@techinsights/database`.

### Serverless-Safe Connection Pooling (`src/connection.ts`)

In serverless platforms like Vercel, functions spin up on demand. Creating a new database connection per request exhausts MongoDB connection pools. We resolve this using a global cached promise singleton:

```typescript
let cachedPromise: Promise<typeof mongoose> | null = (global as any).mongooseConnectionPromise || null;

export async function connectToDatabase(uri?: string): Promise<typeof mongoose> {
  if (cachedPromise) return cachedPromise;
  
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not defined.");

  cachedPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    retryWrites: true,
    w: "majority",
  });

  (global as any).mongooseConnectionPromise = cachedPromise;
  return cachedPromise;
}
```

### Models & Indexing

- **`Blog` Model:**
  - Compound Index: `{ genre: 1, createdAt: -1 }` for instant filtered tab queries.
  - Sorting Index: `{ createdAt: -1 }` for the homepage latest-drop feed.
  - Text Search Index: `{ title: "text", body: "text" }` for full-text search.
- **`User` Model:**
  - Salted bcrypt password hashing with pre-save hooks and `matchPassword()` verification method.
  - Bookmarks array storing referenced `Blog` ObjectIds.
  - Topic preferences array and newsletter subscription boolean flag.
- **`Intel` Model:**
  - Daily micro-content bite with indexed `displayDate` string for fast calendar lookups.

---

## 6. API Route Specifications (`app/api/*`)

All API routes run as native Next.js Serverless Route Handlers in `apps/web/app/api/`:

| Route | Method | Description | Auth Required |
| :--- | :---: | :--- | :---: |
| `/api/blogs/latest` | `GET` | Retrieves the latest published blog (with optional `?genre=` filter). | Public |
| `/api/blogs` | `GET` | Paginated blog archive with genre, keyword search, and date filters. | Public |
| `/api/blogs/[id]` | `GET` | Fetches a single blog post by its MongoDB ObjectId. | Public |
| `/api/auth/register` | `POST` | Creates a new user account and issues a signed JWT token. | Public |
| `/api/auth/login` | `POST` | Authenticates user credentials via bcrypt and returns JWT. | Public |
| `/api/auth/profile` | `GET` | Returns authenticated user profile and bookmarks. | Bearer JWT |
| `/api/auth/preferences` | `PUT` | Updates user topic preferences and newsletter opt-in status. | Bearer JWT |
| `/api/auth/bookmarks` | `GET` | Retrieves all saved blog posts for the authenticated user. | Bearer JWT |
| `/api/auth/bookmarks/[id]`| `POST` | Atomically toggles a blog bookmark on/off. | Bearer JWT |
| `/api/intel/today` | `GET` | Retrieves today's daily hacker intelligence bite. | Public |
| `/api/system-status` | `GET` | Returns live cluster telemetry (database metrics, FLOPs load, DEFCON status). | Public |
| `/api/jobs/search` | `GET` | Searches live technology roles via RapidAPI JSearch. | Admin JWT |
| `/api/jobs/extract-skills`| `POST` | Multimodal PDF resume skill parser powered by Gemini. | Admin JWT |

---

## 7. AI Grounding, RAG & Hallucination Prevention

To prevent the LLM from fabricating breaking news, dates, or non-existent technologies, TechInsightsAI uses a 4-tier grounding protocol:

1. **Pre-Generation RSS Scraping:** The system retrieves real-world article titles, summaries, and URLs published in the last 48 hours from authoritative domains (e.g., `techcrunch.com`, `news.mit.edu`, `krebsonsecurity.com`).
2. **Context Injection:** Ingested articles are formatted as `ARTICLE_SOURCE` blocks and injected directly into the Gemini prompt.
3. **Mandatory Source Attribution Contract:** The prompt explicitly enforces:
   ```text
   CRITICAL INSTRUCTION: USE THESE REAL NEWS SOURCES FOR YOUR BLOG.
   MANDATORY: For the "links" section, ONLY USE THE URLs PROVIDED BELOW.
   DO NOT HALLUCINATE OR CREATE NEW URLs.
   ```
4. **Safety & Fallback Circuit Breaker:** If breaking news content trips Gemini safety filters, a `SafetyError` handler retries generation using a timeless technical curriculum (algorithms, design patterns) rather than publishing speculative rumors.

---

## 8. Offline Capabilities & Data Resilience (`idb`)

Offline reading is powered by the browser's IndexedDB API, modernized using the Promise-based `idb` library in `services/offlineDataService.ts`.

### Storage Lifecycle
1. When a user opens any blog article, `blogService.ts` asynchronously writes the full post object into the local `blogs` IndexedDB object store.
2. If the user disconnects or navigates offline, `blogService.fetchBlogById()` catches the network failure and retrieves the cached article from IndexedDB.
3. **Quota & Storage Eviction:** To prevent mobile storage warnings, the service monitors `navigator.storage.estimate()` and runs an automated 30-day FIFO cleanup routine (`cleanupOldBlogs`) to purge stale articles.

---

## 9. Automated CI/CD & Serverless Cron Workflows

Rather than paying for 24/7 background servers, all background jobs run autonomously via **GitHub Actions** on free Ubuntu runners ($0.00/mo operating cost).

### Workflow Specifications

1. **Daily Blog & Intel Automation (`.github/workflows/generate-blog.yml`):**
   - **Trigger:** Nightly cron at `00:00 UTC` + manual `workflow_dispatch`.
   - **Execution:** Sets up Node.js 20, builds `@techinsights/database`, runs `npm run generate:blog`, and executes `npm run generate:intel`.

2. **Weekly Newsletter Automation (`.github/workflows/generate-newsletter.yml`):**
   - **Trigger:** Scheduled cron every Friday at `17:00 UTC`.
   - **Execution:** Runs `npm run send:newsletter` to compile top weekly reads and dispatch emails via Nodemailer.

---

## 10. Technologies Used

| Domain | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Monorepo** | Turborepo, npm workspaces | Multi-package task caching & topological builds |
| **Frontend Framework** | Next.js 15 (App Router), React 19 | Server-Side Rendering, edge routing, SEO |
| **Styling & Motion** | Tailwind CSS v4, Framer Motion | Cyberpunk / terminal brutalist UI design system |
| **Data Fetching** | TanStack Query (React Query v5) | In-memory caching, stale-while-revalidate |
| **HTTP Client** | Axios (with custom interceptors) | Centralized JWT attachment & 401 unauth traps |
| **Offline Storage** | `idb` (IndexedDB Promise wrapper) | Reliable local offline article caching |
| **AI Model** | Google Gemini API (`gemini-3.1-flash-lite`) | Autonomous content generation & synthesis |
| **RSS Ingestion** | `rss-parser` | Live 48-hour news grounding |
| **Image Engine** | Unsplash API | Real photography matching |
| **Email Service** | Nodemailer | Responsive dark-mode HTML newsletter delivery |
| **Database** | MongoDB Atlas, Mongoose ODM | Document storage & serverless connection caching |
| **Hosting & CI/CD** | Vercel Edge, GitHub Actions | Zero-cost serverless hosting and background automation |

---

## 11. Deployment Architecture & Production Setup

```
                                  ┌───────────────────────────┐
                                  │      User's Browser       │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │     Vercel Global Edge    │
                                  │   (Next.js 15 App Router) │
                                  │                           │
                                  │  • Static Prerendered UI  │
                                  │  • Serverless API Routes  │
                                  └─────────────┬─────────────┘
                                                │
                      ┌─────────────────────────┴────────────────────────┐
                      │                                                  │
                      ▼                                                  ▼
        ┌───────────────────────────┐                      ┌───────────────────────────┐
        │       MongoDB Atlas       │◄─────────────────────┤       GitHub Actions      │
        │      Cloud Database       │                      │    Serverless Runners     │
        │                           │                      │                           │
        │  • Shared Mongoose Schemas│                      │  • Daily 00:00 Blog Cron  │
        │  • Pooled Connections     │                      │  • Weekly Friday Digest   │
        └───────────────────────────┘                      └───────────────────────────┘
```

1. **Web Deployment (Vercel):**
   - Framework preset: Next.js.
   - Root directory: `apps/web`.
   - Environment variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`.

2. **Cron Workflows (GitHub Actions):**
   - Configured repository secrets: `MONGODB_URI`, `GEMINI_API_KEY`, `UNSPLASH_ACCESS_KEY`, `EMAIL_USER`, `EMAIL_PASS`.

---

## 12. Appendix & Environment Configuration

### Root `.env` Template
```bash
# Database Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/techinsights?retryWrites=true&w=majority"

# Google Gemini API
GEMINI_API_KEY="AIzaSy..."

# Authentication
JWT_SECRET="your_production_jwt_secret_key"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Unsplash Image API (Optional)
UNSPLASH_ACCESS_KEY="your_unsplash_client_id"

# Newsletter SMTP Configuration
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Essential Workspace Commands
```bash
# Start all dev servers concurrently
npm run dev

# Run type checks across all packages
npm run check-types

# Production build across all packages
npm run build

# Generate a new blog post manually
npm run generate:blog --workspace=@techinsights/ai-worker

# Generate today's tech hack manually
npm run generate:intel --workspace=@techinsights/ai-worker -- --force
```
