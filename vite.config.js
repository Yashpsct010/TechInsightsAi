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
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/(?!blogs).*$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache latest/all blog fetching
            urlPattern: /^https?:\/\/.*\/api\/blogs(\?.*|\/(all|latest).*)$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "blog-api-cache",
              networkTimeoutSeconds: 3, // If network takes >3s, use cache
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 2, // 2 hours freshness
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Individual blog by ID
            urlPattern: /^https?:\/\/.*\/api\/blogs\/[a-f0-9]+$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "blog-detail-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            // Cache blog images
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Fallback for everything else
            urlPattern: /.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "fallback-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
            },
          },
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
