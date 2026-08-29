import { Navigate, Route, Routes } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./components/auth/RequireAuth";
import { WelcomeGate } from "./components/auth/WelcomeGate";
import { AppFrame } from "./components/layout/AppFrame";
import { MainShell } from "./components/layout/MainShell";
import { PwaPrompts } from "./components/pwa/PwaPrompts";
import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ActivityScreen, InsightsScreen, ProfileScreen } from "./screens/AppScreens";
import { getInitialRoute } from "./lib/onboarding";

export default function App() {
  return (
    <AppFrame>
      <PwaPrompts />
      <Routes>
        <Route path="/" element={<WelcomeGate />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginScreen />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <SignUpScreen />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <MainShell />
            </RequireAuth>
          }
        >
          <Route index element={<HomeScreen />} />
          <Route path="activity" element={<ActivityScreen />} />
          <Route path="insights" element={<InsightsScreen />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={getInitialRoute()} replace />} />
      </Routes>
    </AppFrame>
  );
}
