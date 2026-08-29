import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { getGoogleClientId } from "./lib/google-auth";
import { getConvexUrl } from "./lib/convex-config";
import "./index.css";

/** Stale dev/prod service workers can serve old index.html without CSS. */
if (import.meta.env.DEV && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
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
