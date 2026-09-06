import { useEffect, useState } from "react";

export function resolveAvatarUrl(picture?: string) {
  const trimmed = picture?.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    if (url.hostname.endsWith("googleusercontent.com") && !trimmed.includes("=")) {
      return `${trimmed}=s128-c`;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

export function useAvatarSrc(picture?: string) {
  const src = resolveAvatarUrl(picture);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return {
    src: failed ? undefined : src,
    onError: () => setFailed(true),
  };
}
