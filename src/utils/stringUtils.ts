// String helpers shared across ERP frontend apps.

export interface TruncateOptions {
  length?: number;
  suffix?: string;
}

// Truncate a string to `length` characters, appending a suffix when cut.
export function truncateString(value = "", { length = 9, suffix = "..." }: TruncateOptions = {}): string {
  if (!value || value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}${suffix}`;
}

// Uppercase the first character of a string; leave the rest untouched.
export function capitalize(value = ""): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Title-case a string: every word starts with an uppercase letter.
export function toTitleCase(value = ""): string {
  if (!value) return value;
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Format a number as a localized currency string.
export function formatPrice(
  value: number,
  { currency = "USD", locale = "en-US", minimumFractionDigits = 2, maximumFractionDigits = 2 }: CurrencyOptions = {}
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

// Convert a string to a URL-friendly slug.
export function slugify(value = ""): string {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Collapse consecutive whitespace into single spaces and trim.
export function normalizeWhitespace(value = ""): string {
  return value.replace(/\s+/g, " ").trim();
}
