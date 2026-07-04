/* Calendar math shared across the app — mirrors the handoff logic exactly. */

export const DAY = 86400000

/** Days since the Unix epoch (UTC-based, as in the handoff). */
export function epochDay(t: number = Date.now()): number {
  return Math.floor(t / DAY)
}

/** ISO-ish week key: Monday-aligned week counter used for weekly resets. */
export function weekKey(t: number = Date.now()): number {
  return Math.floor((epochDay(t) + 3) / 7)
}

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Whole days from now until an ISO date, clamped at 0. */
export function daysTo(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / DAY))
}

/** Time-of-day greeting for the Today header. */
export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Up late'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
