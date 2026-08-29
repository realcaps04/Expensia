import { Navigate, Route, Routes } from "react-router-dom";
import { RedirectIfAuthed, RequireAuth } from "./components/auth/RequireAuth";
import { AppFrame } from "./components/layout/AppFrame";
import { MainShell } from "./components/layout/MainShell";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ActivityScreen, InsightsScreen, ProfileScreen } from "./screens/AppScreens";

export default function App() {
  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppFrame>
  );
}
