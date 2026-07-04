/* Derived numbers for the Today view — formulas from the handoff. */
import { MOMENTUM_BASE } from '../data/constants'
import type { Todo, WeeklyItem } from '../store/types'

/** % of today's lines done (0 when there are none). */
export function todayPct(todos: Todo[]): number {
  return todos.length ? (todos.filter((t) => t.done).length / todos.length) * 100 : 0
}

/** Momentum blends a steady base with today's completion, half and half. */
export function momentumScore(todos: Todo[]): number {
  return Math.round(MOMENTUM_BASE * 0.5 + todayPct(todos) * 0.5)
}

export function momentumLabel(m: number): string {
  return m >= 70 ? 'Strong & steady' : m >= 45 ? 'Finding rhythm' : 'Needs a spark'
}

/** Sky layers awakened by weekly-goal completion: 0 none … 4 full sky. */
export function atmoLevel(weekly: WeeklyItem[]): number {
  if (!weekly.length) return 0
  const done = weekly.filter((w) => w.done).length
  return Math.round((done / weekly.length) * 4)
}

export const ATMO_NOTES = [
  'check one to wake the sky',
  'the sun is up',
  'clouds drift in',
  'petals on the wind',
  'birdsong — a full sky',
]
