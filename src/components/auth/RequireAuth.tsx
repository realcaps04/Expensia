import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
