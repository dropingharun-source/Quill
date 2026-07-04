/*
 * Placeholder starter data, shown only until the user's own data exists in
 * localStorage. Copied from the handoff prototype.
 */
import { DAY } from '../lib/date'
import type {
  Chapter,
  IeltsEntries,
  MsDone,
  MsItems,
  Todo,
  WeeklyItem,
} from '../store/types'

export function seedChapters(): Chapter[] {
  return [
    {
      id: 'ielts',
      title: 'Reach IELTS 8.0',
      accent: '#C5683F',
      tint: '#F7EDDD',
      start: 6.0,
      target: 8.0,
      unit: 'band',
      checkpoint: { label: 'IELTS mock', date: '2026-08-29' },
      spark: [6, 6.5, 7, 7, 7.25],
    },
    {
      id: 'bench',
      title: 'Bench press 100 kg',
      accent: '#DD9A36',
      tint: '#F7EAD2',
      start: 40,
      target: 100,
      current: 62.5,
      unit: 'kg',
      checkpoint: { label: 'Strength test', date: '2026-08-10' },
      spark: [40, 45, 50, 55, 62.5],
    },
    {
      id: 'uni',
      title: 'Enter a university',
      accent: '#8B9B6E',
      tint: '#E9EEDD',
      start: 0,
      target: 100,
      current: 45,
      unit: '%',
      checkpoint: { label: 'Application deadline', date: '2026-10-15' },
      spark: [10, 22, 32, 38, 45],
    },
  ]
}

export function seedTodos(): Todo[] {
  return [
    { id: 1, text: 'Finish IELTS writing task 2', done: true, chapter: 'ielts' },
    { id: 2, text: 'Bench press — 5×5 @ 60kg', done: true, chapter: 'bench' },
    { id: 3, text: 'Draft university personal statement', done: false, chapter: 'uni' },
    { id: 4, text: 'Review 30 vocab flashcards', done: false, chapter: 'ielts' },
    { id: 5, text: 'Plan tomorrow', done: false, chapter: null },
  ]
}

export function seedWeekly(): WeeklyItem[] {
  return [
    { id: 'w1', text: 'Write lines on 5 days', done: false },
    { id: 'w2', text: 'One full IELTS mock', done: true },
    { id: 'w3', text: 'Three gym sessions', done: false },
    { id: 'w4', text: 'Essay draft to a friend', done: false },
  ]
}

export function seedMsItems(): MsItems {
  return {
    ielts: [
      { id: 'i1', label: 'Band 7.0 overall', sub: 'First waypoint', goals: [] },
      { id: 'i2', label: 'Band 7.5 mock', sub: 'Next mock target', goals: [] },
      { id: 'i3', label: 'Band 8.0 target', sub: 'The chapter goal', goals: [] },
    ],
    bench: [
      { id: 'b1', label: 'Bench 50 kg', sub: 'Opening block', goals: [] },
      { id: 'b2', label: 'Bench 65 kg', sub: 'Almost there', goals: [] },
      { id: 'b3', label: 'Bench 80 kg', sub: 'Mid-season', goals: [] },
      { id: 'b4', label: 'Bench 100 kg', sub: 'The chapter goal', goals: [] },
    ],
    uni: [
      { id: 'u1', label: 'Shortlist universities', sub: 'Pick 5 schools', goals: [] },
      { id: 'u2', label: 'Personal statement draft', sub: 'One strong draft', goals: [] },
      { id: 'u3', label: 'Submit applications', sub: 'By October', goals: [] },
      { id: 'u4', label: 'Receive an offer', sub: 'The chapter goal', goals: [] },
    ],
  }
}

export function seedMsDone(): MsDone {
  return { ielts: 1, bench: 1, uni: 1 }
}

export function seedIeltsEntries(): IeltsEntries {
  const now = Date.now()
  const ts = [0, 1, 2, 3, 4].map((i) => now - (4 - i) * 7 * DAY)
  const seq = (bands: number[]) => bands.map((band, i) => ({ band, t: ts[i] }))
  return {
    l: seq([6.0, 6.5, 7.0, 7.0, 7.5]),
    r: seq([6.5, 6.5, 7.0, 7.5, 8.0]),
    w: seq([5.5, 6.0, 6.0, 6.5, 6.5]),
    s: seq([6.0, 6.5, 6.5, 7.0, 7.0]),
  }
}
