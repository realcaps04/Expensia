import { Navigate, useLocation } from "react-router-dom";
import { hasActiveSession } from "../../lib/session";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!hasActiveSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  if (hasActiveSession()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
