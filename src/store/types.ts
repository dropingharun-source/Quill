/* Data shapes persisted to localStorage — field names match the handoff. */

export interface Todo {
  id: number
  text: string
  done: boolean
  chapter: string | null
  repeat?: boolean
}

export interface WeeklyItem {
  id: string
  text: string
  done: boolean
}

/** Shape stored under quill_weekly_v1. `history` maps past week keys to the
 *  completion % they ended on (snapshotted when a new week starts). */
export interface WeeklyStore {
  week: number
  items: WeeklyItem[]
  history?: Record<number, number>
}

export interface Checkpoint {
  label: string
  date: string
}

export interface Chapter {
  id: string
  title: string
  accent: string
  tint: string
  start: number
  target: number
  current?: number
  unit: string
  checkpoint: Checkpoint | null
  spark: number[]
  closed?: boolean
}

export interface TinyGoal {
  id: number
  text: string
  done: boolean
}

export interface Milestone {
  id: string
  label: string
  sub: string
  goals: TinyGoal[]
}

/** Milestone lists per chapter id (quill_ms_items_v1). */
export type MsItems = Record<string, Milestone[]>

/** Completed-milestone count per chapter id (quill_milestones_v1). */
export type MsDone = Record<string, number>

/** One line as snapshotted into a day record at rollover. */
export interface DayLine {
  text: string
  done: boolean
  ch: string | null
}

export interface DayRecord {
  done?: number
  total?: number
  note?: string
  lines?: DayLine[]
}

/** Per-day records keyed by epoch day (quill_days_v1). */
export type Days = Record<number, DayRecord>

export type SkillKey = 'l' | 'r' | 'w' | 's'

export const SKILL_KEYS: SkillKey[] = ['l', 'r', 'w', 's']

export interface IeltsEntry {
  band: number
  t: number
}

export type IeltsEntries = Record<SkillKey, IeltsEntry[]>
