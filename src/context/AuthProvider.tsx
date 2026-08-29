import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { GoogleProfile, UserProfile } from "../lib/types";
import { convexUserToProfile, googleProfileToUpsertArgs } from "../lib/convex-mappers";
import { clearSession, loadSession, saveSession } from "../lib/session";

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  signUp: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (profile: GoogleProfile) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => loadSession());
  const [isLoading, setIsLoading] = useState(false);

  const registerEmail = useMutation(api.users.registerEmailUser);
  const signInEmail = useMutation(api.users.signInEmailUser);
  const upsertGoogle = useMutation(api.users.upsertGoogleUser);

  useEffect(() => {
    const session = loadSession();
    if (session && !session.convexId) {
      clearSession();
      setUser(null);
    }
  }, []);

  const signUp = useCallback(
    async (input: Parameters<AuthContextValue["signUp"]>[0]) => {
      setIsLoading(true);
      try {
        const created = await registerEmail(input);
        const profile = convexUserToProfile(created);
        saveSession(profile);
        setUser(profile);
      } finally {
        setIsLoading(false);
      }
    },
    [registerEmail],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const signedIn = await signInEmail({ email, password });
        const profile = convexUserToProfile(signedIn);
        saveSession(profile);
        setUser(profile);
      } finally {
        setIsLoading(false);
      }
    },
    [signInEmail],
  );

  const signInWithGoogle = useCallback(
    async (profile: GoogleProfile) => {
      setIsLoading(true);
      try {
        const upserted = await upsertGoogle(googleProfileToUpsertArgs(profile));
        const userProfile = convexUserToProfile(upserted);
        saveSession(userProfile);
        setUser(userProfile);
      } finally {
        setIsLoading(false);
      }
    },
    [upsertGoogle],
  );

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signUp, signIn, signInWithGoogle, signOut }),
    [user, isLoading, signUp, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
