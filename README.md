# TechInsightsAI (v2.0)

> **Autonomous AI-driven intelligence platform with Next.js 15 App Router, Turborepo monorepo, and decoupled GitHub Actions background workers.**

TechInsightsAI is an enterprise-grade blogging and technical intelligence platform. It features autonomous content synthesis powered by the Gemini API, real-time RSS tech news grounding, modern cyber-terminal neo-brutalist styling, offline capability via Promise-based IndexedDB, and serverless edge-ready architecture.

---

## ⚡ Architecture Highlights (v2.0)

- **Next.js 15 App Router (`apps/web`):** Replaces the legacy Vite SPA. Provides Static Site Generation (SSG), Server-Side Rendering (SSR), edge-ready API routes (`/api/*`), instant zero-TTFB initial loads, and automated SEO schema.
- **Turborepo Monorepo:** Clean separation of concerns between web interface, background autonomous workers, and shared database abstractions.
- **Decoupled AI Worker (`apps/ai-worker`):** Standalone Node.js service and CLI scripts solely responsible for Gemini AI generation, RSS ingestion, and weekly newsletter dispatching.
- **Shared Database Core (`packages/database`):** Strongly-typed Mongoose connection pooling with serverless singleton cache, shared across all workspaces.
- **Serverless Background Cron via GitHub Actions:** Zero-cost background scheduling ($0.00/mo) using native Ubuntu GitHub Actions runners to execute generation scripts on a schedule without needing dedicated 24/7 background servers.
- **Modern Data & Storage Layer:** TanStack Query (React Query) for in-memory caching and request deduplication; `idb` for Promise-based offline blog reading.

---

## 📁 Repository Structure

```
TechInsightsAi/
├── .github/
│   └── workflows/
│       ├── generate-blog.yml        # Daily midnight blog & tech hack generation
│       └── generate-newsletter.yml  # Weekly Friday newsletter dispatch
├── apps/
│   ├── web/                         # Next.js 15 App Router frontend & API routes
│   └── ai-worker/                   # Gemini AI generation & RSS ingestion engine
├── packages/
│   ├── database/                    # Shared Mongoose models & connection pool
│   └── tsconfig/                    # Shared TypeScript configurations
├── AGENTS.md                        # Architectural specification & agent guidelines
├── turbo.json                       # Turborepo task pipeline
└── package.json                     # Monorepo workspaces definition
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB connection string (local or MongoDB Atlas)
- Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))
- Unsplash Access Key (optional, for article hero photos)

### 1. Installation
Clone the repository and install all workspace dependencies from the root:
```bash
git clone https://github.com/Yashpsct010/TechInsightsAi.git
cd TechInsightsAi
npm install
```

### 2. Environment Setup
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```
Fill in your `MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL`.

### 3. Run Development Servers
Start both the Next.js web application and worker pipelines concurrently:
```bash
npm run dev
```
The web application will be live at `http://localhost:3000`.

### 4. Build & Typecheck
Verify builds and TypeScript across all workspaces:
```bash
# Typecheck all packages
npm run check-types

# Production build all packages
npm run build
```

---

## 🛠️ CLI Automation Scripts

You can manually trigger autonomous generation scripts at any time:

```bash
# Generate a new blog post (auto genre or specified genre)
npm run generate:blog --workspace=@techinsights/ai-worker -- --genre=coding

# Generate today's tech hack intel bite
npm run generate:intel --workspace=@techinsights/ai-worker -- --force

# Dispatch newsletter to active subscribers
npm run send:newsletter --workspace=@techinsights/ai-worker
```

---

## 🌐 Production Deployment

- **Web Application (`apps/web`):** Deployed on [Vercel](https://vercel.com) using the Next.js preset with root directory set to `apps/web`.
- **Background Cron Workflows:** Executed autonomously via GitHub Actions on scheduled cron triggers with repository secrets configured.
- **Database:** MongoDB Atlas M0 (Free Tier).

---

## 📜 Historical Releases

- **[Release v1.0.0](https://github.com/Yashpsct010/TechInsightsAi/releases/tag/v1.0.0):** Vite SPA + Express Hybrid Backend (Archived on `legacy-v1` branch).
- **[Release v2.0.0](https://github.com/Yashpsct010/TechInsightsAi/releases/tag/v2.0.0):** Turborepo Monorepo + Next.js 15 App Router + Decoupled GitHub Actions Workers.

---

## 📄 License

This project is licensed under the MIT License.
