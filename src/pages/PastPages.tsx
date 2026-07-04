/*
 * View — "Past pages": every finished day, newest first, with the lines it
 * held and the reflection that closed it.
 */
import { chapterShort } from '../data/palette'
import { DAY, MONTHS, WEEKDAYS, epochDay } from '../lib/date'
import { useQuill } from '../store/QuillContext'
import styles from './PastPages.module.css'

export function PastPages() {
  const { days, chapters } = useQuill()
  const todayK = epochDay()

  const chTag: Record<string, { short: string; accent: string; tint: string }> = {}
  chapters.forEach((c) => {
    chTag[c.id] = { short: chapterShort(c), accent: c.accent, tint: c.tint }
  })

  const thisYear = new Date().getFullYear()
  const pages = Object.keys(days)
    .map(Number)
    .filter((k) => k < todayK)
    .sort((a, b) => b - a)
    .map((k) => ({ k, rec: days[k] }))
    .filter(
      ({ rec }) =>
        rec && ((rec.total ?? 0) > 0 || !!rec.note || (rec.lines?.length ?? 0) > 0),
    )

  const dateLabel = (k: number) => {
    const d = new Date(k * DAY + DAY / 2)
    const base = `${WEEKDAYS[d.getDay()]} · ${MONTHS[d.getMonth()]} ${d.getDate()}`
    return d.getFullYear() === thisYear ? base : `${base} ${d.getFullYear()}`
  }

  return (
    <div className={styles.view}>
      <div>
        <div className={`serif ${styles.title}`}>Past pages</div>
        <div className={styles.subtitle}>Every finished day, kept in the book.</div>
      </div>

      {pages.length === 0 && (
        <div className={styles.emptyCard}>
          No pages yet. When a day ends, it's kept here — lines, ink, and all.
        </div>
      )}

      {pages.map(({ k, rec }) => {
        const total = rec.total ?? 0
        const done = rec.done ?? 0
        const pct = total ? Math.round((done / total) * 100) : 0
        const lines = rec.lines ?? []
        return (
          <div key={k} className={styles.dayCard}>
            <div className={styles.dayHead}>
              <span className={`serif ${styles.dayDate}`}>{dateLabel(k)}</span>
              {total > 0 && (
                <span className={styles.daySummary}>
                  {done} of {total} · {pct}%
                </span>
              )}
            </div>
            {lines.length > 0 && (
              <div className={styles.linesGrid}>
                {lines.map((g, i) => {
                  const meta = g.ch ? chTag[g.ch] : undefined
                  return (
                    <div key={i} className={styles.lineRow}>
                      <span className={`${styles.lineBox} ${g.done ? styles.lineBoxDone : ''}`}>
                        {g.done ? '✓' : ''}
                      </span>
                      <span className={`${styles.lineText} ${g.done ? styles.lineTextDone : ''}`}>
                        {g.text}
                      </span>
                      {meta && (
                        <span
                          className={styles.lineTag}
                          style={{ background: meta.tint, color: meta.accent }}
                        >
                          {meta.short}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {rec.note && <div className={`serif ${styles.note}`}>“{rec.note}”</div>}
          </div>
        )
      })}
    </div>
  )
}
