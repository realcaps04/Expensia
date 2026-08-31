export function formatCurrency(amount: number, options?: { signed?: boolean; hide?: boolean }) {
  if (options?.hide) return "••••••";

  // No spaces between sign, rupee symbol, and digits — they wrap as one unit.
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Math.abs(amount))
    .replace(/[\s\u00A0\u202F\u2007\u2009\u200A]/g, "");

  if (!options?.signed) return formatted;
  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatTodayDate() {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}
