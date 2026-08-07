export interface FormatDateOptions {
  locale?: string;
  dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
  timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
  timeZone?: string;
  suffix?: string;
}

export function formatDate(
  value: string | Date,
  {
    locale = "en-GB",
    dateStyle = "medium",
    timeStyle = "short",
    timeZone = "UTC",
    suffix = "UTC",
  }: FormatDateOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatted = new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle,
    timeZone,
  }).format(date);

  return suffix ? `${formatted} ${suffix}` : formatted;
}
