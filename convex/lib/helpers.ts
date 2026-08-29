/** Simple deterministic hash for demo email auth — replace with Convex Auth in production. */
export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `expensia:${(hash >>> 0).toString(16)}:${password.length}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  return hashPassword(password) === passwordHash;
}

export function hashOtp(code: string): string {
  return hashPassword(`otp:${code}`);
}

export function verifyOtp(code: string, codeHash: string): boolean {
  return hashOtp(code) === codeHash;
}

export function hashToken(token: string): string {
  return hashPassword(`token:${token}`);
}

export function verifyToken(token: string, tokenHash: string): boolean {
  return hashToken(token) === tokenHash;
}

export function generateOtp(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

export function generateResetToken(): string {
  const parts = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0xffff_ffff).toString(16).padStart(8, "0"),
  );
  return parts.join("");
}

export function validateNewPassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (!hasLetter || !hasNumber || !hasSymbol) {
    throw new Error("Use a mix of letters, numbers, and symbols.");
  }
}

export function passwordStrengthLabel(password: string): "Weak" | "Fair" | "Strong" {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return "Weak";
  if (score <= 2) return "Fair";
  return "Strong";
}

export function monthKeyFromDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function startOfDayMs(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfDayMs(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function startOfMonthMs(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfMonthMs(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function dateKeyFromMs(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
