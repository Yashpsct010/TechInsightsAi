import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Tech Insights AI",
        short_name: "TechInsights",
        description: "Stay updated with the latest tech insights",
        theme_color: "#0a0a0c",
        background_color: "#0a0a0c",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        // Only precache essential app shell files — no fonts, no extra assets
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        // Limit total precache size to 3MB to avoid bloating on install
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // Auth & non-blog API routes — always go network first, short cache
            urlPattern: /^https?:\/\/.*\/api\/(?!blogs).*$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 20,        // reduced from 50
                maxAgeSeconds: 60 * 60 * 6, // reduced from 24h → 6h
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Blog list/feed — fresh copy preferred, cache as fallback
            urlPattern: /^https?:\/\/.*\/api\/blogs(\?.*|\/(all|latest).*)$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "blog-list-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 5,         // only keep last 5 list responses
                maxAgeSeconds: 60 * 60 * 2, // 2 hours
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Individual blog articles — stable content, cache aggressively
            urlPattern: /^https?:\/\/.*\/api\/blogs\/[a-f0-9]{24}$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "blog-detail-cache",
              expiration: {
                maxEntries: 30,        // reduced from 50
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Blog images — cache but cap tight to save disk
            urlPattern: /\.(?:png|jpg|jpeg|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 30,        // reduced from 100
                maxAgeSeconds: 60 * 60 * 24 * 14, // reduced 30d → 14d
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // NOTE: Removed the greedy /.*/  fallback-cache rule that previously
          // cached every URL hit. This was the biggest source of unbounded SW
          // cache growth and had overlap with the api-cache rule above.
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
      outDir: "dist", // Use the standard Vite output directory instead of dev-dist
      strategies: "generateSW",
    }),
  ],
});
