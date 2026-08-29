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
