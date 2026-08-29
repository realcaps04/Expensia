import type { GoogleProfile } from "./types";

const GOOGLE_STORAGE_KEY = "expensia-google-auth";

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";
}

export function loadGoogleAuth() {
  try {
    const raw = localStorage.getItem(GOOGLE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GoogleProfile;
  } catch {
    return null;
  }
}

export function saveGoogleAuth(profile: GoogleProfile) {
  localStorage.setItem(GOOGLE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearGoogleAuth() {
  localStorage.removeItem(GOOGLE_STORAGE_KEY);
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Could not load your Google profile.");
  }

  const data = (await response.json()) as GoogleProfile;
  return data;
}
