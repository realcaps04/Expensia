const STORAGE_KEY = "expensia-profile-extras";

export type ProfileExtras = {
  dateOfBirth?: string;
  gender?: string;
  country?: string;
  biometricLogin?: boolean;
  twoFactorAuth?: boolean;
};

const DEFAULT_EXTRAS: ProfileExtras = {
  biometricLogin: false,
  twoFactorAuth: false,
};

export function loadProfileExtras(): ProfileExtras {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_EXTRAS };
    return { ...DEFAULT_EXTRAS, ...(JSON.parse(raw) as ProfileExtras) };
  } catch {
    return { ...DEFAULT_EXTRAS };
  }
}

export function saveProfileExtras(extras: ProfileExtras) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
}

export function formatMemberSince(ms: number) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(ms));
}
