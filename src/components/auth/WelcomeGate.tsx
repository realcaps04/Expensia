import { Navigate } from "react-router-dom";
import { hasSeenWelcome } from "../../lib/onboarding";
import { hasActiveSession } from "../../lib/session";
import { WelcomeScreen } from "../../screens/WelcomeScreen";

/** Shows welcome once; returning users go to login or home. */
export function WelcomeGate() {
  if (!hasSeenWelcome()) {
    return <WelcomeScreen />;
  }

  if (hasActiveSession()) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}
