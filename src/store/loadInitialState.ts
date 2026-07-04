/*
 * One-time load + day/week rollover, mirroring the handoff's mount logic:
 *  - hydrate every slice from localStorage, falling back to seed data
 *  - reset weekly goals when a new week starts (snapshotting last week's %)
 *  - on a new day, snapshot yesterday's done/total (+ its lines) into the
 *    day records, keep only repeating lines, and stage the rest as the
 *    carry-over prompt
 */
import {
  seedChapters,
  seedIeltsEntries,
  seedMsDone,
  seedMsItems,
  seedTodos,
  seedWeekly,
} from '../data/seed'
import { epochDay, weekKey } from '../lib/date'
import { KEYS, readJson, readRaw, writeJson, writeRaw } from './persistence'
import type {
  Chapter,
  Days,
  IeltsEntries,
  MsDone,
  MsItems,
  Todo,
  WeeklyItem,
  WeeklyStore,
} from './types'
import { SKILL_KEYS } from './types'

export interface InitialState {
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

function load(): InitialState {
  // IELTS entries
  let entries = seedIeltsEntries()
  const storedEntries = readJson<IeltsEntries>(KEYS.ielts)
  if (storedEntries && SKILL_KEYS.every((k) => Array.isArray(storedEntries[k]))) {
    entries = storedEntries
  }

  // Today's lines
  let todos = seedTodos()
  const storedTodos = readJson<Todo[]>(KEYS.todos)
  if (Array.isArray(storedTodos)) todos = storedTodos

  // Chapters: seed → legacy progress merge → stored chapters win outright
  let chapters = seedChapters()
  const progress = readJson<Record<string, { current?: number; spark?: number[] }>>(
    KEYS.progress,
  )
  if (progress && typeof progress === 'object') {
    chapters = chapters.map((c) => {
      const m = progress[c.id]
      if (!m) return c
      return {
        ...c,
        current: typeof m.current === 'number' ? m.current : c.current,
        spark: Array.isArray(m.spark) && m.spark.length ? m.spark : c.spark,
      }
    })
  }
  const storedChapters = readJson<Chapter[]>(KEYS.chapters)
  if (Array.isArray(storedChapters) && storedChapters.length) chapters = storedChapters

  // Milestone done-counts and items
  let msDone = seedMsDone()
  const storedMsDone = readJson<MsDone>(KEYS.msDone)
  if (storedMsDone && typeof storedMsDone === 'object') {
    msDone = { ...msDone, ...storedMsDone }
  }
  let msItems = seedMsItems()
  const storedMsItems = readJson<MsItems>(KEYS.msItems)
  if (storedMsItems && typeof storedMsItems === 'object') {
    msItems = { ...msItems, ...storedMsItems }
  }

  // Weekly goals: unchecked again when an ISO-ish week boundary passed;
  // the finished week's % is kept under `history` for the year/month chart.
  const wkNow = weekKey()
  let weekly = seedWeekly()
  let weeklyHistory: Record<number, number> = {}
  const storedWeekly = readJson<WeeklyStore>(KEYS.weekly)
  if (storedWeekly && Array.isArray(storedWeekly.items)) {
    weeklyHistory = storedWeekly.history ?? {}
    if (storedWeekly.week === wkNow) {
      weekly = storedWeekly.items
    } else {
      if (typeof storedWeekly.week === 'number' && storedWeekly.items.length) {
        const doneN = storedWeekly.items.filter((w) => w.done).length
        weeklyHistory = {
          ...weeklyHistory,
          [storedWeekly.week]: Math.round((doneN / storedWeekly.items.length) * 100),
        }
      }
      weekly = storedWeekly.items.map((w) => ({ ...w, done: false }))
      writeJson(KEYS.weekly, { week: wkNow, items: weekly, history: weeklyHistory })
    }
  }

  // Per-day records — start empty; real history accrues at each rollover
  const todayK = epochDay()
  let days: Days = {}
  const storedDays = readJson<Days>(KEYS.days)
  if (storedDays && typeof storedDays === 'object') days = storedDays

  // One-time cleanup: earlier builds seeded four fake demo days. Real
  // rollover records always carry `lines` (and reflections carry `note`),
  // so a bare {done:3, total:4} can only be that old seed — drop it.
  let strippedSeed = false
  for (const k of Object.keys(days)) {
    const r = days[Number(k)]
    if (r && r.done === 3 && r.total === 4 && r.lines === undefined && r.note === undefined) {
      delete days[Number(k)]
      strippedSeed = true
    }
  }
  if (strippedSeed) writeJson(KEYS.days, days)

  // Day rollover. The carry-over prompt is persisted until answered, so
  // closing the tab mid-prompt never silently loses lines.
  const storedPending = readJson<Todo[]>(KEYS.carryover)
  let pending: Todo[] = Array.isArray(storedPending) ? storedPending : []
  const lastRaw = readRaw(KEYS.dayKey)
  const lastK = lastRaw ? parseInt(lastRaw, 10) : NaN
  if (isNaN(lastK)) {
    writeRaw(KEYS.dayKey, String(todayK))
  } else if (lastK < todayK) {
    const doneN = todos.filter((t) => t.done).length
    days = {
      ...days,
      [lastK]: {
        ...(days[lastK] || {}),
        done: doneN,
        total: todos.length,
        lines: todos.map((t) => ({ text: t.text, done: t.done, ch: t.chapter })),
      },
    }
    const leftovers = todos.filter((t) => !t.done && !t.repeat)
    todos = todos.filter((t) => t.repeat).map((t) => ({ ...t, done: false }))
    const seen = new Set(pending.map((t) => t.id))
    pending = [...pending, ...leftovers.filter((t) => !seen.has(t.id))]
    writeJson(KEYS.todos, todos)
    writeJson(KEYS.days, days)
    writeJson(KEYS.carryover, pending)
    writeRaw(KEYS.dayKey, String(todayK))
  }
  const carryover: Todo[] | null = pending.length ? pending : null

  return { todos, weekly, weeklyHistory, chapters, msItems, msDone, days, entries, carryover }
}

let cached: InitialState | null = null

/** Runs the load/rollover exactly once per page load. */
export function loadInitialState(): InitialState {
  if (!cached) cached = load()
  return cached
}
