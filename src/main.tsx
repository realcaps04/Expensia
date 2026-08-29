import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { getGoogleClientId } from "./lib/google-auth";
import { getConvexUrl } from "./lib/convex-config";
import { clearStaleServiceWorkers } from "./lib/clear-stale-service-worker";
import "./index.css";

if (import.meta.env.DEV) {
  clearStaleServiceWorkers();
}

const googleClientId = getGoogleClientId();
const convex = new ConvexReactClient(getConvexUrl());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <ConvexProvider client={convex}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ConvexProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
