/*
 * Backup & restore. Exports the live store as a single JSON file keyed by
 * the same localStorage keys the app persists to; restoring writes those
 * keys back and the caller reloads so everything rehydrates through
 * loadInitialState.
 */
import { epochDay, weekKey } from '../lib/date'
import { KEYS, writeJson, writeRaw } from './persistence'
import type {
  Chapter,
  Days,
  IeltsEntries,
  MsDone,
  MsItems,
  Todo,
  WeeklyItem,
} from './types'

export interface BackupState {
  todos: Todo[]
  weekly: WeeklyItem[]
  weeklyHistory: Record<number, number>
  chapters: Chapter[]
  msItems: MsItems
  msDone: MsDone
  days: Days
  entries: IeltsEntries
  carryover: Todo[] | null
}

function buildBackup(s: BackupState) {
  return {
    app: 'quill' as const,
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      [KEYS.todos]: s.todos,
      [KEYS.weekly]: { week: weekKey(), items: s.weekly, history: s.weeklyHistory },
      [KEYS.chapters]: s.chapters,
      [KEYS.msItems]: s.msItems,
      [KEYS.msDone]: s.msDone,
      [KEYS.days]: s.days,
      [KEYS.dayKey]: String(epochDay()),
      [KEYS.ielts]: s.entries,
      [KEYS.carryover]: s.carryover ?? [],
    } as Record<string, unknown>,
  }
}

/** Serialise the current book and hand it to the browser as a download. */
export function downloadBackup(s: BackupState): void {
  const blob = new Blob([JSON.stringify(buildBackup(s), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  a.href = url
  a.download = `quill-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export interface BackupSummary {
  chapters: number
  lines: number
  daysRecorded: number
}

function parseBackup(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as { app?: string; data?: unknown }
    if (!parsed || parsed.app !== 'quill') return null
    const data = parsed.data
    if (!data || typeof data !== 'object') return null
    const d = data as Record<string, unknown>
    if (!Array.isArray(d[KEYS.chapters]) && !Array.isArray(d[KEYS.todos])) return null
    return d
  } catch {
    return null
  }
}

/** Validate a candidate file and describe what it holds. */
export function inspectBackup(text: string): BackupSummary | null {
  const d = parseBackup(text)
  if (!d) return null
  const chapters = d[KEYS.chapters]
  const todos = d[KEYS.todos]
  const days = d[KEYS.days]
  return {
    chapters: Array.isArray(chapters) ? chapters.length : 0,
    lines: Array.isArray(todos) ? todos.length : 0,
    daysRecorded: days && typeof days === 'object' ? Object.keys(days).length : 0,
  }
}

/** Write every known key from the backup into localStorage. */
export function applyBackup(text: string): boolean {
  const d = parseBackup(text)
  if (!d) return false
  const jsonKeys = [
    KEYS.todos,
    KEYS.weekly,
    KEYS.chapters,
    KEYS.msItems,
    KEYS.msDone,
    KEYS.days,
    KEYS.ielts,
    KEYS.carryover,
  ]
  for (const key of jsonKeys) {
    if (key in d) writeJson(key, d[key])
  }
  if (KEYS.dayKey in d) writeRaw(KEYS.dayKey, String(d[KEYS.dayKey]))
  return true
}
