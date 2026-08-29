import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { getGoogleClientId } from "./lib/google-auth";
import { getConvexUrl, isConvexEnabled } from "./lib/convex-config";
import "./index.css";

const googleClientId = getGoogleClientId();
const convexUrl = getConvexUrl();
const convex = isConvexEnabled ? new ConvexReactClient(convexUrl) : null;

function AppProviders({ children }: { children: React.ReactNode }) {
  if (!convex) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || "placeholder.apps.googleusercontent.com"}>
      <AppProviders>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProviders>
    </GoogleOAuthProvider>
  </StrictMode>,
);
