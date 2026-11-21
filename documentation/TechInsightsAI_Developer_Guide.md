# TechInsightsAI (v2.0) - Developer Knowledge Transfer Guide

Hey there! If you're onboarding to the **TechInsightsAI v2.0** codebase, welcome. This guide is designed to walk you through the architecture, explain why specific design decisions were made, and give you the practical workflows needed to contribute effectively.

---

## What You'll Find in This Guide

1. [Project Overview & Philosophy](#1-project-overview--philosophy)
2. [Monorepo Architecture & Workspaces](#2-monorepo-architecture--workspaces)
3. [Frontend Deep Dive (`apps/web`)](#3-frontend-deep-dive-appsweb)
4. [Backend & API Architecture (`app/api/*`)](#4-backend--api-architecture-appapi)
5. [Autonomous AI Worker (`apps/ai-worker`)](#5-autonomous-ai-worker-appsai-worker)
6. [Shared Database Package (`packages/database`)](#6-shared-database-package-packagesdatabase)
7. [Offline Capabilities & IndexedDB (`idb`)](#7-offline-capabilities--indexeddb-idb)
8. [Local Development & CLI Workflows](#8-local-development--cli-workflows)
9. [Debugging & Troubleshooting Guide](#9-debugging--troubleshooting-guide)
10. [Deployment & Production Runbook](#10-deployment--production-runbook)

---

## 1. Project Overview & Philosophy

**TechInsightsAI** is an autonomous tech blogging and intelligence platform. It tracks trending technology developments, synthesizes technical articles using Google's Gemini LLM, and publishes them with zero human intervention.

### Core Design Principles
- **Separation of Read and Write Workloads:** User reads run on Vercel's global edge network via Next.js 15 serverless handlers; heavy AI background generation runs on decoupled GitHub Actions runners. User traffic never contends with slow LLM generation.
- **Strict Anti-Hallucination Grounding:** We never prompt an LLM to generate news from its frozen weights. Real-time RSS feeds (TechCrunch, MIT News, Wired, Hacker News) provide factual 48-hour context and mandatory canonical URLs.
- **Instant Load Times (Zero TTFB):** Pre-rendered server-side routes deliver content immediately to both users and search crawlers.
- **Offline First:** Any opened blog article is automatically cached in Promise-based IndexedDB for uninterrupted offline reading.
- **Cyber-Terminal Neo-Brutalist Aesthetic:** Monospace typography, high-contrast orange (`#ec5b13`) on obsidian (`#0a0a0c`), glass panels, and interactive HTML5 scratch-canvas daily intel decryptor.

---

## 2. Monorepo Architecture & Workspaces

The repository is organized as a **Turborepo monorepo** using npm workspaces:

```
TechInsightsAi/
├── apps/
│   ├── web/                    # Next.js 15 App Router (Frontend + API Routes)
│   └── ai-worker/              # Decoupled AI generation & cron worker
├── packages/
│   ├── database/               # Shared Mongoose models & connection pool
│   └── tsconfig/               # Shared TypeScript configurations
├── .github/workflows/          # Serverless background cron workflows
├── turbo.json                  # Turborepo task pipeline
└── package.json                # Root workspace configuration
```

### Why Turborepo?
- **Zero Code Duplication:** Both `apps/web` and `apps/ai-worker` import database models directly from `@techinsights/database`.
- **Topological Task Scheduling:** Turborepo builds `packages/database` *before* building dependent applications (`dependsOn: ["^build"]`).
- **Computation Caching:** Build artifacts are cached. If a package has not changed, Turborepo replays the build in milliseconds.

---

## 3. Frontend Deep Dive (`apps/web`)

### Directory Structure
```
apps/web/
├── app/                        # Next.js 15 App Router
│   ├── api/                    # Serverless API routes
│   ├── blog/                   # Latest blog & reading view (/blog/[id])
│   ├── blogs/                  # Filterable blog archive (/blogs)
│   ├── bookmarks/              # Saved articles (/bookmarks)
│   ├── profile/                # User settings & preferences (/profile)
│   ├── login/ & register/      # Cyber-terminal authentication views
│   ├── sitemap.ts & robots.ts  # Dynamic SEO crawlers
│   ├── globals.css             # Tailwind v4 theme & terminal styles
│   └── layout.tsx              # Root HTML shell & JSON-LD structured schemas
├── components/                 # UI components (Header, Footer, WhatsNewCard, etc.)
├── context/                    # AuthContext (non-blocking optimistic auth)
├── hooks/                      # Custom hooks (e.g., useBlogById)
└── services/                   # Data services (apiClient, blogService, offlineDataService)
```

### Key Architectural Patterns

#### 1. In-Memory Caching with TanStack Query
Configured in `app/providers.tsx`:
- `staleTime: 5 minutes`: Cached articles are served instantly without hitting the network on tab switches.
- `gcTime: 30 minutes`: Garbage collection keeps memory usage lean.
- Automatic background revalidation ensures data freshness.

#### 2. Centralized Axios Client (`services/apiClient.ts`)
- **Request Interceptor:** Automatically pulls the user's JWT from `localStorage` and attaches `Authorization: Bearer <token>` to outgoing requests.
- **Response Interceptor:** Traps `401 Unauthorized` responses and dispatches a window event (`auth:unauthorized`), allowing `AuthContext` to clear stale credentials gracefully without hard page reloads.

#### 3. Non-Blocking Optimistic Auth (`context/AuthContext.tsx`)
- Public pages render immediately on initial load (Zero TTFB).
- Stored tokens are verified asynchronously in the background. Only protected routes (like `/bookmarks` or `/profile`) conditionally gate access.

---

## 4. Backend & API Architecture (`app/api/*`)

All backend endpoints run as edge-ready Next.js Serverless Route Handlers in `apps/web/app/api/`:

```
apps/web/app/api/
├── auth/
│   ├── register/route.ts       # POST: Register user & issue JWT
│   ├── login/route.ts          # POST: Validate password via bcrypt & issue JWT
│   ├── profile/route.ts        # GET: User profile & bookmarks
│   ├── preferences/route.ts    # PUT: Update genre preferences & newsletter
│   └── bookmarks/route.ts      # GET & POST: Bookmark management
├── blogs/
│   ├── route.ts                # GET: Paginated archive with genre/search filters
│   ├── latest/route.ts         # GET: Instant retrieval of latest drop
│   └── [id]/route.ts           # GET: Single blog retrieval by ObjectId
├── intel/
│   └── today/route.ts          # GET: Daily tech hack bite
└── system-status/
    └── route.ts                # GET: Live cluster metrics (FLOPs, DB load, DEFCON)
```

> 💡 **Best Practice:** Always import `connectToDatabase` from `@techinsights/database` at the beginning of every route handler to ensure connection pooling in serverless environments.

---

## 5. Autonomous AI Worker (`apps/ai-worker`)

The AI worker is an isolated Node.js engine responsible for all background intelligence pipelines.

### Key Modules
- **`src/services/rssService.ts`:** Ingests live tech articles from RSS feeds across genres with a strict 10-second socket timeout.
- **`src/services/geminiService.ts`:** Communicates with the Gemini API (`gemini-3.1-flash-lite`). Features a custom state-machine extractor (`extractBalancedJson`) that safely strips markdown backticks and handles unescaped characters in generated HTML bodies.
- **`src/services/imageService.ts`:** Queries Unsplash for high-res editorial photography matching the generated article title.
- **`src/services/newsletterService.ts`:** Compiles a dark-mode cyberpunk HTML digest and dispatches it to active subscribers via Nodemailer.

### Standalone CLI Execution
You can run any worker task manually from the root:
```bash
# Generate a new coding blog post
npm run generate:blog --workspace=@techinsights/ai-worker -- --genre=coding

# Generate today's tech hack intel bite
npm run generate:intel --workspace=@techinsights/ai-worker -- --force

# Send weekly newsletter
npm run send:newsletter --workspace=@techinsights/ai-worker
```

---

## 6. Shared Database Package (`packages/database`)

### Serverless Connection Pooling (`src/connection.ts`)
To prevent connection exhaustion across ephemeral serverless invocations, we use a global promise cache:

```typescript
let cachedPromise: Promise<typeof mongoose> | null = 
  (global as any).mongooseConnectionPromise || null;

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

### Models & Index Optimization
- **`Blog`:** Indexed on `{ genre: 1, createdAt: -1 }`, `{ createdAt: -1 }`, and full-text index on `{ title: "text", body: "text" }`.
- **`User`:** Includes pre-save bcrypt salt hashing (10 rounds) and instance method `matchPassword(enteredPassword)`.
- **`Intel`:** Indexed on `{ displayDate: 1 }` for rapid daily lookup.

---

## 7. Offline Capabilities & IndexedDB (`idb`)

Located in `apps/web/services/offlineDataService.ts`, offline storage uses the Promise-based `idb` library.

### Storage Workflow
1. When a blog post is retrieved, `saveBlog()` automatically inserts or updates the record in the `blogs` IndexedDB object store.
2. If network access drops, `blogService.ts` seamlessly retrieves the cached post from IndexedDB.
3. **Storage Hygiene:** An automated 30-day FIFO policy (`cleanupOldBlogs()`) purges expired entries to prevent mobile browser storage quota warnings.

---

## 8. Local Development & CLI Workflows

### 1. Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB instance (local or MongoDB Atlas connection string)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/Yashpsct010/TechInsightsAi.git
cd TechInsightsAi

# Install all dependencies across the monorepo
npm install

# Set up environment variables
cp .env.example .env
```

### 3. Running Locally
```bash
# Start Next.js web application and worker in dev mode
npm run dev

# Run type checks across all workspaces
npm run check-types

# Compile production builds
npm run build
```

---

## 9. Debugging & Troubleshooting Guide

### Issue 1: Gemini API Rate Limit / Quota Exceeded (429)
- **Cause:** Free-tier Gemini keys have request-per-minute (RPM) limits.
- **Solution:** The worker automatically falls back to `gemini-3.1-flash-lite`. If you hit quota errors during testing, wait 60 seconds or use a dedicated project key.

### Issue 2: JSON Parsing Errors on LLM Output
- **Cause:** Gemini sometimes wraps JSON in markdown fences (` ```json `) or returns conversational preamble.
- **Solution:** Do not use naive `JSON.parse`. Always use `extractBalancedJson()` in `geminiService.ts`, which safely isolates curly-bracket depth and string escapes.

### Issue 3: Stalled RSS Feeds
- **Cause:** External tech news feeds can stall without terminating TCP connections.
- **Solution:** `rssService.ts` configures a 10-second timeout on `Parser`. Stalled feeds fail fast and degrade gracefully without stalling the generation loop.

### Issue 4: MongoDB Connection Pool Leaks
- **Cause:** Directly invoking `mongoose.connect()` inside route handlers instead of using the shared connection singleton.
- **Solution:** Always import `connectToDatabase()` from `@techinsights/database`. Never call `mongoose.connect()` directly in `apps/web`.

---

## 10. Deployment & Production Runbook

### Production Architecture
1. **Web Frontend & API Routes:** Deployed to **Vercel** with root directory set to `apps/web`.
2. **Background Automation:** Executed autonomously via **GitHub Actions** on scheduled cron triggers ($0.00/mo compute cost):
   - `.github/workflows/generate-blog.yml` (Runs nightly at `00:00 UTC`).
   - `.github/workflows/generate-newsletter.yml` (Runs Fridays at `17:00 UTC`).
3. **Database:** Hosted on **MongoDB Atlas**.

### Setting Up GitHub Actions Secrets
Ensure the following repository secrets are configured in GitHub Settings > Secrets and variables > Actions:
- `MONGODB_URI`
- `GEMINI_API_KEY`
- `UNSPLASH_ACCESS_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
