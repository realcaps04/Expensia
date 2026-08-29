export function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toTimeInputValue(date = new Date()) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDisplayDate(dateInput: string) {
  const [y, m, d] = dateInput.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export function formatDisplayTime(timeInput: string) {
  const [h, m] = timeInput.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(2000, 0, 1, h, m));
}

export function combineDateAndTime(dateInput: string, timeInput: string) {
  const [y, m, d] = dateInput.split("-").map(Number);
  const [h, min] = timeInput.split(":").map(Number);
  return new Date(y, m - 1, d, h, min).getTime();
}

export function parseDateInputToMs(dateInput: string) {
  const [y, m, d] = dateInput.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function dateKeyFromMs(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDayMs(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatActivityDateHeader(ms: number) {
  const day = startOfDayMs(new Date(ms));
  const today = startOfDayMs();
  const yesterday = startOfDayMs(new Date(Date.now() - 86_400_000));

  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

export function formatCompactDate(ms: number) {
  return formatDisplayDate(dateKeyFromMs(ms));
}

export function formatMonthHeader(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function monthKeyFromMs(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
