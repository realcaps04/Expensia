import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { getGoogleClientId } from "./lib/google-auth";
import { getConvexUrl } from "./lib/convex-config";
import { clearStaleServiceWorkers } from "./lib/clear-stale-service-worker";
import { initTheme } from "./lib/theme";
import "./index.css";

if (import.meta.env.DEV) {
  clearStaleServiceWorkers();
}

initTheme();

const googleClientId = getGoogleClientId();
const convex = new ConvexReactClient(getConvexUrl());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </ConvexProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
