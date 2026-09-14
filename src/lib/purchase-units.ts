export const PURCHASE_UNITS = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "ml", label: "ml" },
  { value: "m", label: "m" },
  { value: "pcs", label: "pcs" },
  { value: "dozen", label: "dozen" },
  { value: "packet", label: "packet" },
  { value: "box", label: "box" },
] as const;

export type PurchaseUnit = (typeof PURCHASE_UNITS)[number]["value"];

export const DEFAULT_PURCHASE_UNIT: PurchaseUnit = "kg";

export function isPurchaseUnit(value: string): value is PurchaseUnit {
  return PURCHASE_UNITS.some((unit) => unit.value === value);
}

export function normalizePurchaseUnit(value?: string | null): PurchaseUnit {
  if (value && isPurchaseUnit(value)) return value;
  return DEFAULT_PURCHASE_UNIT;
}

export function formatPurchaseQty(quantity: number, unit?: string | null) {
  const qty = quantity % 1 === 0 ? String(quantity) : quantity.toFixed(2);
  return `${qty} ${normalizePurchaseUnit(unit)}`;
}
