/** Interpret DB date + time in the user's local timezone for comparisons. */
export function slotEndDateTime(dateStr: string, endTimeStr: string): Date {
  const t = endTimeStr.slice(0, 5);
  return new Date(`${dateStr}T${t}:00`);
}
