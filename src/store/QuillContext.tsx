/*
 * App-wide store. One provider owns every persisted slice plus the bits of
 * UI state that survive switching views (route, carousel panels, chart
 * ranges, feed selection) — matching the handoff, where a single component
 * held everything. Each mutation persists its slice, exactly like the
 * prototype's handlers.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { CHAPTER_PALETTE } from '../data/palette'
import { epochDay, weekKey } from '../lib/date'
import { loadInitialState } from './loadInitialState'
import { KEYS, removeKey, writeJson, writeRaw } from './persistence'
import type {
  Chapter,
  Days,
  IeltsEntries,
  MsDone,
  MsItems,
  Milestone,
  SkillKey,
  Todo,
  WeeklyItem,
} from './types'
import { SKILL_KEYS } from './types'

export type Route =
  | { view: 'today' }
  | { view: 'pages' }
  | { view: 'chapter'; chapterId: string }
  | { view: 'ielts' }

export type HistRange = 'week' | 'month' | 'year'
export type LogMode = 'mock' | 'single'
export type Panel = 0 | 1

interface QuillStore {
  // persisted data
  todos: Todo[]
  weekly: WeeklyItem[]
  weeklyHistory: Record<number, number>
  chapters: Chapter[]
  msItems: MsItems
  msDone: MsDone
  days: Days
  entries: IeltsEntries
  carryover: Todo[] | null

  // navigation + cross-view UI state
  route: Route
  goToday: () => void
  goPages: () => void
  openChapter: (id: string) => void
  goIelts: () => void
  heroPanel: Panel
  setHeroPanel: (p: Panel) => void
  todoPanel: Panel
  setTodoPanel: (p: Panel) => void
  histRange: HistRange
  setHistRange: (r: HistRange) => void
  feedChapter: string | null
  setFeedChapter: (id: string | null) => void
  chartSkill: 'all' | SkillKey
  setChartSkill: (k: 'all' | SkillKey) => void
  logMode: LogMode
  setLogMode: (m: LogMode) => void
  singleSkill: SkillKey
  setSingleSkill: (k: SkillKey) => void

  // today's lines
  addTodo: (text: string, chapter: string | null) => void
  toggleTodo: (id: number) => void
  deleteTodo: (id: number) => void
  editTodo: (id: number, text: string) => void
  toggleRepeat: (id: number) => void
  resolveCarry: (keep: boolean) => void
  saveReflection: (note: string) => void

  // weekly goals
  addWeekly: (text: string) => void
  toggleWeekly: (id: string) => void
  removeWeekly: (id: string) => void
  editWeekly: (id: string, text: string) => void

  // chapters
  addChapter: (title: string) => void
  deleteChapter: (id: string) => void
  setChapterClosed: (id: string, closed: boolean) => void
  setCheckpoint: (id: string, dateStr: string) => void
  renameChapter: (id: string, title: string) => void

  // milestones
  toggleMilestone: (chId: string, i: number) => void
  addMilestone: (chId: string, label: string) => void
  moveMilestone: (chId: string, i: number, dir: -1 | 1) => void
  removeMilestone: (chId: string, i: number) => void
  addTinyGoal: (chId: string, i: number, text: string) => void
  toggleTinyGoal: (chId: string, i: number, gi: number) => void
  removeTinyGoal: (chId: string, i: number, gi: number) => void

  // IELTS
  logMock: (bands: Record<SkillKey, number>) => void
  addSingle: (skill: SkillKey, band: number) => void
  updateEntry: (skill: SkillKey, i: number, band: number) => void
  deleteEntry: (skill: SkillKey, i: number) => void
}

const QuillContext = createContext<QuillStore | null>(null)

export function QuillProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState()

  const [todos, setTodos] = useState(initial.todos)
  const [weekly, setWeekly] = useState(initial.weekly)
  const [weeklyHistory, setWeeklyHistory] = useState(initial.weeklyHistory)
  const [chapters, setChapters] = useState(initial.chapters)
  const [msItems, setMsItems] = useState(initial.msItems)
  const [msDone, setMsDone] = useState(initial.msDone)
  const [days, setDays] = useState(initial.days)
  const [entries, setEntries] = useState(initial.entries)
  const [carryover, setCarryover] = useState(initial.carryover)

  const [route, setRoute] = useState<Route>({ view: 'today' })
  const [heroPanel, setHeroPanel] = useState<Panel>(0)
  const [todoPanel, setTodoPanel] = useState<Panel>(0)
  const [histRange, setHistRange] = useState<HistRange>('week')
  const [feedChapter, setFeedChapter] = useState<string | null>(null)
  const [chartSkill, setChartSkill] = useState<'all' | SkillKey>('all')
  const [logMode, setLogMode] = useState<LogMode>('mock')
  const [singleSkill, setSingleSkill] = useState<SkillKey>('l')

  const mutateTodos = (fn: (prev: Todo[]) => Todo[]) =>
    setTodos((prev) => {
      const next = fn(prev)
      writeJson(KEYS.todos, next)
      return next
    })

  const mutateWeekly = (fn: (prev: WeeklyItem[]) => WeeklyItem[]) =>
    setWeekly((prev) => {
      const next = fn(prev)
      writeJson(KEYS.weekly, { week: weekKey(), items: next, history: weeklyHistory })
      return next
    })

  const mutateChapters = (fn: (prev: Chapter[]) => Chapter[]) =>
    setChapters((prev) => {
      const next = fn(prev)
      writeJson(KEYS.chapters, next)
      return next
    })

  const mutateMsItems = (fn: (prev: MsItems) => MsItems) =>
    setMsItems((prev) => {
      const next = fn(prev)
      writeJson(KEYS.msItems, next)
      return next
    })

  const mutateMsDone = (fn: (prev: MsDone) => MsDone) =>
    setMsDone((prev) => {
      const next = fn(prev)
      writeJson(KEYS.msDone, next)
      return next
    })

  const mutateDays = (fn: (prev: Days) => Days) =>
    setDays((prev) => {
      const next = fn(prev)
      writeJson(KEYS.days, next)
      return next
    })

  const mutateEntries = (fn: (prev: IeltsEntries) => IeltsEntries) =>
    setEntries((prev) => {
      const next = fn(prev)
      writeJson(KEYS.ielts, next)
      return next
    })

  /** Per-chapter milestone list update (mirrors the prototype's updateMs). */
  const updateMs = (chId: string, fn: (arr: Milestone[]) => Milestone[]) =>
    mutateMsItems((prev) => ({ ...prev, [chId]: fn((prev[chId] ?? []).slice()) }))

  // Live day/week rollover: the load-time logic only runs once per page
  // load, so a tab left open past midnight (or across a week boundary)
  // would keep writing to the old day. Check once a minute and whenever
  // the tab regains focus, and roll over in place.
  const dayRef = useRef(epochDay())
  const weekRef = useRef(weekKey())
  useEffect(() => {
    const check = () => {
      const todayK = epochDay()
      if (todayK > dayRef.current) {
        const lastK = dayRef.current
        dayRef.current = todayK
        const doneN = todos.filter((t) => t.done).length
        mutateDays((prev) => ({
          ...prev,
          [lastK]: {
            ...(prev[lastK] || {}),
            done: doneN,
            total: todos.length,
            lines: todos.map((t) => ({ text: t.text, done: t.done, ch: t.chapter })),
          },
        }))
        const leftovers = todos.filter((t) => !t.done && !t.repeat)
        mutateTodos(() => todos.filter((t) => t.repeat).map((t) => ({ ...t, done: false })))
        if (leftovers.length) {
          setCarryover((prev) => {
            const seen = new Set((prev ?? []).map((t) => t.id))
            const merged = [...(prev ?? []), ...leftovers.filter((t) => !seen.has(t.id))]
            writeJson(KEYS.carryover, merged)
            return merged
          })
        }
        writeRaw(KEYS.dayKey, String(todayK))
      }
      const wkNow = weekKey()
      if (wkNow > weekRef.current) {
        const lastW = weekRef.current
        weekRef.current = wkNow
        const doneW = weekly.filter((w) => w.done).length
        const history = weekly.length
          ? { ...weeklyHistory, [lastW]: Math.round((doneW / weekly.length) * 100) }
          : weeklyHistory
        const items = weekly.map((w) => ({ ...w, done: false }))
        setWeeklyHistory(history)
        setWeekly(items)
        writeJson(KEYS.weekly, { week: wkNow, items, history })
      }
    }
    const id = window.setInterval(check, 60_000)
    window.addEventListener('focus', check)
    document.addEventListener('visibilitychange', check)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', check)
      document.removeEventListener('visibilitychange', check)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos, weekly, weeklyHistory])

  const store: QuillStore = {
    todos,
    weekly,
    weeklyHistory,
    chapters,
    msItems,
    msDone,
    days,
    entries,
    carryover,

    route,
    goToday: () => setRoute({ view: 'today' }),
    goPages: () => setRoute({ view: 'pages' }),
    openChapter: (id) => setRoute({ view: 'chapter', chapterId: id }),
    goIelts: () => setRoute({ view: 'ielts' }),
    heroPanel,
    setHeroPanel,
    todoPanel,
    setTodoPanel,
    histRange,
    setHistRange,
    feedChapter,
    setFeedChapter,
    chartSkill,
    setChartSkill,
    logMode,
    setLogMode,
    singleSkill,
    setSingleSkill,

    addTodo: (text, chapter) => {
      const t = text.trim()
      if (!t) return
      mutateTodos((prev) => [...prev, { id: Date.now(), text: t, done: false, chapter }])
    },
    toggleTodo: (id) =>
      mutateTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    deleteTodo: (id) => mutateTodos((prev) => prev.filter((t) => t.id !== id)),
    editTodo: (id, text) => {
      const t = text.trim()
      if (!t) return
      mutateTodos((prev) => prev.map((x) => (x.id === id ? { ...x, text: t } : x)))
    },
    toggleRepeat: (id) =>
      mutateTodos((prev) => prev.map((t) => (t.id === id ? { ...t, repeat: !t.repeat } : t))),
    resolveCarry: (keep) => {
      if (carryover && keep) {
        const kept = carryover.map((t) => ({ ...t, done: false }))
        mutateTodos((prev) => [...kept, ...prev])
      }
      setCarryover(null)
      removeKey(KEYS.carryover)
    },
    saveReflection: (note) =>
      mutateDays((prev) => {
        const k = epochDay()
        return { ...prev, [k]: { ...(prev[k] || {}), note } }
      }),

    addWeekly: (text) => {
      const t = text.trim()
      if (!t) return
      mutateWeekly((prev) => [...prev, { id: 'w' + Date.now(), text: t, done: false }])
    },
    toggleWeekly: (id) =>
      mutateWeekly((prev) => prev.map((w) => (w.id === id ? { ...w, done: !w.done } : w))),
    removeWeekly: (id) => mutateWeekly((prev) => prev.filter((w) => w.id !== id)),
    editWeekly: (id, text) => {
      const t = text.trim()
      if (!t) return
      mutateWeekly((prev) => prev.map((w) => (w.id === id ? { ...w, text: t } : w)))
    },

    addChapter: (title) => {
      const t = title.trim()
      if (!t) return
      const id = 'c' + Date.now()
      setChapters((prev) => {
        const p = CHAPTER_PALETTE[prev.length % CHAPTER_PALETTE.length]
        const next: Chapter[] = [
          ...prev,
          {
            id,
            title: t,
            accent: p.accent,
            tint: p.tint,
            start: 0,
            target: 100,
            current: 0,
            unit: '%',
            checkpoint: null,
            spark: [],
          },
        ]
        writeJson(KEYS.chapters, next)
        return next
      })
      mutateMsItems((prev) => ({ ...prev, [id]: [] }))
      setRoute({ view: 'chapter', chapterId: id })
    },
    deleteChapter: (id) => {
      mutateChapters((prev) => prev.filter((c) => c.id !== id))
      mutateMsItems((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      mutateMsDone((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      mutateTodos((prev) =>
        prev.map((t) => (t.chapter === id ? { ...t, chapter: null } : t)),
      )
      setFeedChapter((f) => (f === id ? null : f))
      setRoute({ view: 'today' })
    },
    setChapterClosed: (id, closed) => {
      mutateChapters((prev) => prev.map((c) => (c.id === id ? { ...c, closed } : c)))
      if (closed) setRoute({ view: 'today' })
    },
    setCheckpoint: (id, dateStr) =>
      mutateChapters((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                checkpoint: dateStr
                  ? { label: c.checkpoint?.label || 'Target date', date: dateStr }
                  : null,
              }
            : c,
        ),
      ),
    renameChapter: (id, title) => {
      const t = title.trim()
      if (!t) return
      mutateChapters((prev) => prev.map((c) => (c.id === id ? { ...c, title: t } : c)))
    },

    toggleMilestone: (chId, i) =>
      mutateMsDone((prev) => {
        const cur = prev[chId] ?? 0
        return { ...prev, [chId]: i < cur ? i : i + 1 }
      }),
    addMilestone: (chId, label) => {
      const t = label.trim()
      if (!t) return
      updateMs(chId, (arr) => [...arr, { id: 'm' + Date.now(), label: t, sub: '', goals: [] }])
    },
    moveMilestone: (chId, i, dir) =>
      updateMs(chId, (arr) => {
        const j = i + dir
        if (j < 0 || j >= arr.length) return arr
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
        return arr
      }),
    removeMilestone: (chId, i) => {
      updateMs(chId, (arr) => {
        arr.splice(i, 1)
        return arr
      })
      mutateMsDone((prev) => {
        const cur = prev[chId] ?? 0
        const len = (msItems[chId] ?? []).length - 1
        return { ...prev, [chId]: Math.min(i < cur ? cur - 1 : cur, Math.max(len, 0)) }
      })
    },
    addTinyGoal: (chId, i, text) => {
      const t = text.trim()
      if (!t) return
      updateMs(chId, (arr) => {
        arr[i] = {
          ...arr[i],
          goals: [...(arr[i].goals || []), { id: Date.now(), text: t, done: false }],
        }
        return arr
      })
    },
    toggleTinyGoal: (chId, i, gi) =>
      updateMs(chId, (arr) => {
        arr[i] = {
          ...arr[i],
          goals: (arr[i].goals || []).map((g, k) => (k === gi ? { ...g, done: !g.done } : g)),
        }
        return arr
      }),
    removeTinyGoal: (chId, i, gi) =>
      updateMs(chId, (arr) => {
        arr[i] = { ...arr[i], goals: (arr[i].goals || []).filter((_, k) => k !== gi) }
        return arr
      }),

    logMock: (bands) => {
      if (SKILL_KEYS.some((k) => isNaN(bands[k]) || bands[k] < 0 || bands[k] > 9)) return
      mutateEntries((prev) => {
        const t = nextT(prev)
        return {
          l: [...prev.l, { band: bands.l, t }],
          r: [...prev.r, { band: bands.r, t }],
          w: [...prev.w, { band: bands.w, t }],
          s: [...prev.s, { band: bands.s, t }],
        }
      })
    },
    addSingle: (skill, band) => {
      if (isNaN(band) || band < 0 || band > 9) return
      mutateEntries((prev) => ({
        ...prev,
        [skill]: [...prev[skill], { band, t: nextT(prev) }],
      }))
    },
    updateEntry: (skill, i, band) => {
      if (isNaN(band) || band < 0 || band > 9) return
      mutateEntries((prev) => {
        if (!prev[skill][i]) return prev
        const arr = prev[skill].slice()
        arr[i] = { ...arr[i], band }
        return { ...prev, [skill]: arr }
      })
    },
    deleteEntry: (skill, i) =>
      mutateEntries((prev) => {
        const arr = prev[skill].slice()
        arr.splice(i, 1)
        return { ...prev, [skill]: arr }
      }),
  }

  return <QuillContext.Provider value={store}>{children}</QuillContext.Provider>
}

/** Monotonic timestamp for new score entries (mirrors the prototype). */
function nextT(entries: IeltsEntries): number {
  const all = SKILL_KEYS.flatMap((k) => entries[k].map((x) => x.t))
  return Math.max(Date.now(), (all.length ? Math.max(...all) : 0) + 1)
}

export function useQuill(): QuillStore {
  const ctx = useContext(QuillContext)
  if (!ctx) throw new Error('useQuill must be used inside QuillProvider')
  return ctx
}
