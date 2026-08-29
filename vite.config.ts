import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

/** SPA routes (with query strings) — excludes static files like /assets/*.js */
const SPA_NAV_ALLOWLIST = [/^\/(?!.*\.[^/]+$).*$/];

function devServiceWorkerCleanup(): Plugin {
  return {
    name: "dev-service-worker-cleanup",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const script = `<script id="dev-sw-cleanup">
(function () {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    regs.forEach(function (reg) { reg.unregister(); });
  });
  if (window.caches && caches.keys) {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) { caches.delete(key); });
    });
  }
})();
</script>`;
        return html.replace("<head>", `<head>\n    ${script}`);
      },
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    devServiceWorkerCleanup(),
    VitePWA({
      registerType: "prompt",
      injectRegister: mode === "production" ? "auto" : null,
      includeAssets: ["logo.png", "favicon.png", "favicon.svg", "icon-maskable.png"],
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
            purpose: "any",
          },
          {
            src: "icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpg,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: SPA_NAV_ALLOWLIST,
        navigateFallbackDenylist: [
          /^\/assets\//,
          /^\/api\//,
          /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|json|webmanifest|map)$/,
        ],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Dev SW caches index.html and breaks styling when asset hashes change.
        enabled: false,
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
}));
