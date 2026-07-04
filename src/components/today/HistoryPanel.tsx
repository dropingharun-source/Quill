/*
 * Hero panel B — "% goals done" history. Today's point is the live % of
 * lines done; past days come from the stored per-day records (the prototype
 * faked them with demo data — the README asks the real build to read the
 * records instead). Clicking a day pins a selector line and opens a popover
 * with that day's snapshotted lines and reflection.
 */
import { useEffect, useState } from 'react'
import { area as areaOf, smooth } from '../../lib/chart'
import { DAY, MONTHS, WEEKDAYS, epochDay, weekKey } from '../../lib/date'
import { todayPct } from '../../lib/today'
import { chapterShort } from '../../data/palette'
import { useQuill, type HistRange } from '../../store/QuillContext'
import type { DayLine } from '../../store/types'
import { Segmented } from '../Segmented'
import styles from './HistoryPanel.module.css'

interface HistDay {
  t: number
  pct: number
  goals: DayLine[]
}

const RANGE_OPTIONS: { value: HistRange; label: string }[] = [
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
]

export function HistoryPanel() {
  const { todos, days, chapters, weekly, weeklyHistory, histRange, setHistRange } = useQuill()
  const [selIdx, setSelIdx] = useState<number | null>(null)
  const [popOpen, setPopOpen] = useState(false)
  const [hover, setHover] = useState<number | null>(null)

  useEffect(() => {
    if (!popOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [popOpen])

  const n: number = histRange === 'week' ? 7 : histRange === 'month' ? 30 : 365
  const now = Date.now()

  const series: HistDay[] = []
  for (let i = n - 1; i >= 0; i--) {
    const t = now - i * DAY
    if (i === 0) {
      series.push({
        t,
        pct: Math.round(todayPct(todos)),
        goals: todos.map((td) => ({ text: td.text, done: td.done, ch: td.chapter })),
      })
    } else {
      const rec = days[epochDay(t)]
      series.push({
        t,
        pct: rec && rec.total ? Math.round(((rec.done ?? 0) / rec.total) * 100) : 0,
        goals: rec?.lines ?? [],
      })
    }
  }

  const xOf = (i: number) => 16 + 668 * (n === 1 ? 0.5 : i / (n - 1))
  const yOf = (p: number) => 10 + 124 * (1 - p / 100)
  const pts = series.map((e, i) => ({ x: xOf(i), y: yOf(e.pct) }))

  const selI = Math.max(0, Math.min(n - 1, selIdx ?? n - 1))
  const sel = series[selI]
  const selDate = new Date(sel.t)
  const selLabel =
    (selI === n - 1 ? 'Today' : WEEKDAYS[selDate.getDay()]) +
    ' · ' +
    MONTHS[selDate.getMonth()] +
    ' ' +
    selDate.getDate()

  // Weekly-goals overlay (month/year only): live for the current week,
  // otherwise the % snapshotted when that week ended.
  const wkOverlayOn = histRange !== 'week'
  let wkLine = ''
  if (wkOverlayOn) {
    const wkNow = weekKey(now)
    const wkPctNow = weekly.length
      ? (weekly.filter((w) => w.done).length / weekly.length) * 100
      : 0
    const wkPts = series.map((e, i) => {
      const wk = weekKey(e.t)
      const p = wk >= wkNow ? wkPctNow : (weeklyHistory[wk] ?? 0)
      return { x: xOf(i), y: yOf(p) }
    })
    wkLine = smooth(wkPts)
  }

  const showDots = n <= 31
  const dotR = n <= 7 ? 3.5 : 2.2
  const bandW = 668 / n

  const labCount = histRange === 'week' ? 7 : histRange === 'month' ? 6 : 12
  const labels = Array.from({ length: labCount }, (_, j) => {
    const li = Math.round((j * (n - 1)) / (labCount - 1))
    const d = new Date(series[li].t)
    return histRange === 'year'
      ? MONTHS[d.getMonth()]
      : MONTHS[d.getMonth()] + ' ' + d.getDate()
  })

  const hovI = hover != null && hover >= 0 && hover < n && hover !== selI ? hover : null

  const chTag: Record<string, { short: string; accent: string; tint: string }> = {}
  chapters.forEach((c) => {
    chTag[c.id] = { short: chapterShort(c), accent: c.accent, tint: c.tint }
  })

  const selGoals = sel.goals
  const selDoneN = selGoals.filter((g) => g.done).length
  const popEmpty = selGoals.length === 0
  const popSummary = popEmpty
    ? sel.pct + '%'
    : `${selDoneN} of ${selGoals.length} · ${sel.pct}%`
  const selNote = days[epochDay(sel.t)]?.note ?? ''
  const fSel = (pts[selI].x / 700).toFixed(4)

  const changeRange = (r: HistRange) => {
    setHistRange(r)
    setSelIdx(null)
    setPopOpen(false)
    setHover(null)
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <div className="eyebrow eyebrowWide">% goals done</div>
          <div className={styles.segWrap}>
            <Segmented options={RANGE_OPTIONS} value={histRange} onChange={changeRange} />
          </div>
        </div>
        <div className={styles.selReadout}>
          <div className={`serif ${styles.selPct}`}>{sel.pct}%</div>
          <div className={styles.selDate}>{selLabel}</div>
        </div>
      </div>
      {wkOverlayOn && (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendSolid} />
            daily lines
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDashed} />
            weekly goals
          </span>
        </div>
      )}
      <svg viewBox="0 0 700 150" className={styles.chart}>
        <line x1="16" y1="10" x2="684" y2="10" stroke="var(--grid)" strokeWidth="1" />
        <line x1="16" y1="72" x2="684" y2="72" stroke="var(--grid)" strokeWidth="1" />
        <line x1="16" y1="134" x2="684" y2="134" stroke="var(--grid)" strokeWidth="1" />
        <text x="696" y="14" textAnchor="end" className={styles.axisTick}>
          100%
        </text>
        <text x="696" y="76" textAnchor="end" className={styles.axisTick}>
          50%
        </text>
        <text x="696" y="138" textAnchor="end" className={styles.axisTick}>
          0%
        </text>
        <path d={areaOf(pts, 134)} fill="var(--accent)" fillOpacity="0.08" />
        {wkOverlayOn && (
          <path
            d={wkLine}
            fill="none"
            stroke="var(--olive)"
            strokeWidth="2"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}
        <path
          d={smooth(pts)}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={pts[selI].x.toFixed(1)}
          y1="10"
          x2={pts[selI].x.toFixed(1)}
          y2="134"
          stroke="var(--tan)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <circle
          cx={pts[selI].x.toFixed(1)}
          cy={pts[selI].y.toFixed(1)}
          r="4.5"
          fill="var(--accent)"
          stroke="var(--card)"
          strokeWidth="2"
        />
        {showDots &&
          pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r={dotR}
              fill="var(--accent)"
              stroke="var(--card)"
              strokeWidth="1.5"
            />
          ))}
        {hovI != null && (
          <circle
            cx={pts[hovI].x.toFixed(1)}
            cy={pts[hovI].y.toFixed(1)}
            r="6"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        )}
        {series.map((_, i) => (
          <rect
            key={i}
            x={(xOf(i) - bandW / 2).toFixed(1)}
            y="0"
            width={bandW.toFixed(2)}
            height="150"
            fill="transparent"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelIdx(i)
              setPopOpen(true)
            }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <div className={styles.xLabels}>
        {labels.map((l, j) => (
          <span key={j} className={styles.xLabel}>
            {l}
          </span>
        ))}
      </div>
      {popOpen && (
        <>
          <div className={styles.popBackdrop} onClick={() => setPopOpen(false)} />
          <div
            className={styles.popover}
            style={{ left: `clamp(12px, calc(${fSel} * (100% - 80px) - 108px), calc(100% - 276px))` }}
          >
            <div className={styles.popHead}>
              <span className={styles.popDate}>{selLabel}</span>
              <span className={styles.popSummary}>{popSummary}</span>
              <button className={styles.popClose} onClick={() => setPopOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles.popKicker}>Lines that day</div>
            <div className={styles.popList}>
              {selGoals.map((g, k) => {
                const meta = g.ch ? chTag[g.ch] : undefined
                return (
                  <div key={k} className={styles.popRow}>
                    <span
                      className={`${styles.popBox} ${g.done ? styles.popBoxDone : ''}`}
                    >
                      {g.done ? '✓' : ''}
                    </span>
                    <span className={`${styles.popText} ${g.done ? styles.popTextDone : ''}`}>
                      {g.text}
                    </span>
                    {meta && (
                      <span
                        className={styles.popTag}
                        style={{ background: meta.tint, color: meta.accent }}
                      >
                        {meta.short}
                      </span>
                    )}
                  </div>
                )
              })}
              {popEmpty && <div className={styles.popEmpty}>No lines written this day.</div>}
            </div>
            {selNote && <div className={`serif ${styles.popNote}`}>“{selNote}”</div>}
          </div>
        </>
      )}
    </>
  )
}
