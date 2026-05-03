import { toDate } from "date-fns-tz";

/**
 * Interprets DB `date` + `start_time` as wall-clock in APP_TIMEZONE (IANA), returns absolute instant.
 * Example APP_TIMEZONE: UTC, Asia/Kolkata, America/New_York
 */
export function slotStartInstant(
  dateStr: string,
  startTimeStr: string,
  timeZone: string,
): Date {
  const safeTz = timeZone?.trim() || "UTC";
  const timePart =
    startTimeStr.length >= 8
      ? startTimeStr.slice(0, 8)
      : `${startTimeStr.slice(0, 5)}:00`;
  const isoLocal = `${dateStr}T${timePart}`;
  try {
    return toDate(isoLocal, { timeZone: safeTz });
  } catch {
    return new Date(`${dateStr}T${startTimeStr.slice(0, 5)}:00.000Z`);
  }
}
