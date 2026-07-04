import type { Chapter, SkillKey } from '../store/types'

/** Accent/tint pairs cycled by newly created chapters. */
export const CHAPTER_PALETTE = [
  { accent: '#6E86A0', tint: '#E4EAF0' },
  { accent: '#A0678B', tint: '#F2E4EC' },
  { accent: '#5F8F8B', tint: '#E0EDEA' },
  { accent: '#B4512F', tint: '#F6E3DA' },
]

export const SKILL_META: Record<SkillKey, { name: string; color: string }> = {
  l: { name: 'Listening', color: '#C5683F' },
  r: { name: 'Reading', color: '#DD9A36' },
  w: { name: 'Writing', color: '#8B9B6E' },
  s: { name: 'Speaking', color: '#6E86A0' },
}

/** Chart-filter options: the four skills plus an "all" pseudo-entry. */
export const CHART_META: Record<string, { name: string; color: string }> = {
  all: { name: 'All skills', color: '#9A8C78' },
  ...SKILL_META,
}

/** Hand-tuned short labels for the seed chapters, applied only while their
 *  titles are unchanged — a renamed chapter derives from its new title. */
const BUILTIN_SHORT: Record<string, { title: string; short: string }> = {
  ielts: { title: 'Reach IELTS 8.0', short: 'IELTS' },
  bench: { title: 'Bench press 100 kg', short: 'Bench' },
  uni: { title: 'Enter a university', short: 'University' },
}

/** Short label used in the sidebar, feed chips, and line tags. */
export function chapterShort(c: Chapter): string {
  const builtin = BUILTIN_SHORT[c.id]
  if (builtin && c.title === builtin.title) return builtin.short
  const t = (c.title || '').trim()
  return t.length <= 14 ? t : t.split(' ').slice(0, 2).join(' ')
}
