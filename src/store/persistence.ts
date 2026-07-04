/* localStorage access. Keys are fixed by the handoff — do not rename. */

export const KEYS = {
  todos: 'quill_todos_v2',
  weekly: 'quill_weekly_v1',
  chapters: 'quill_chapters_v1',
  msItems: 'quill_ms_items_v1',
  msDone: 'quill_milestones_v1',
  days: 'quill_days_v1',
  dayKey: 'quill_daykey_v1',
  ielts: 'quill_ielts_v2',
  /** Unanswered carry-over prompt, so closing the tab never loses lines. */
  carryover: 'quill_carryover_v1',
  /** Legacy key: read-only merge of chapter current/spark, never written. */
  progress: 'quill_progress_v1',
} as const

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — keep working in memory */
  }
}

export function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
