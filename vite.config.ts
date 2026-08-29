import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["logo.png", "favicon.png"],
      manifest: {
        name: "Expensia — Track. Understand. Grow.",
        short_name: "Expensia",
        description:
          "Track daily income and expenses. Understand your cash flow. Grow your money with clarity.",
        theme_color: "#FAFAF8",
        background_color: "#FAFAF8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/assets\//,
          /^\/api\//,
          /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|json|webmanifest|map)$/,
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5176,
    strictPort: true,
    host: true,
  },
});
