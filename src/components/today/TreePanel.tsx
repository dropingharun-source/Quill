/*
 * Hero panel A — "The book you're writing": the living tree that grows with
 * the number of today's lines and fills its leaves with completion, under a
 * sky whose layers (sun, clouds, petals, birds) wake with weekly progress.
 */
import type { CSSProperties } from 'react'
import { HERO_STAGES, heroStageFor } from '../../lib/tree'
import { ATMO_NOTES, atmoLevel, momentumScore } from '../../lib/today'
import { useQuill } from '../../store/QuillContext'
import styles from './TreePanel.module.css'

const PETALS = [
  { cx: 58, cy: 88, r: 2.4, fill: '#C5683F' },
  { cx: 176, cy: 96, r: 2, fill: '#DD9A36' },
  { cx: 40, cy: 142, r: 2.2, fill: '#8B9B6E' },
  { cx: 198, cy: 148, r: 2.4, fill: '#C5683F' },
  { cx: 92, cy: 40, r: 2, fill: '#DD9A36' },
  { cx: 152, cy: 34, r: 2.2, fill: '#8B9B6E' },
]

export function TreePanel() {
  const { todos, weekly, chapters, setTodoPanel } = useQuill()

  const total = todos.length
  const doneRatio = total ? todos.filter((t) => t.done).length / total : 0
  const stage = heroStageFor(total)
  const m = momentumScore(todos)

  const level = atmoLevel(weekly)
  const wkDone = weekly.filter((w) => w.done).length
  const openCount = chapters.filter((c) => !c.closed).length
  const doneCount = todos.filter((t) => t.done).length

  const headline =
    m >= 70
      ? 'Your page is filling in beautifully'
      : m >= 45
        ? 'The ink is flowing again'
        : 'A quiet page, waiting for you'
  const caption =
    m >= 70
      ? 'You have kept your hand moving. Momentum is high — most chapters saw a line written this week.'
      : m >= 45
        ? 'A steady pace. Keep adding lines and the page keeps filling; miss a few days and it fades — gently.'
        : 'Momentum has dipped. It is forgiving — a single line today starts the ink flowing again.'

  const layer = (n: number): CSSProperties => ({
    opacity: level >= n ? 1 : 0,
    transition: 'opacity .9s ease',
    pointerEvents: 'none',
  })

  return (
    <>
      <div className={styles.treeBox}>
        <svg viewBox="0 0 240 210" className={styles.treeSvg}>
          <g style={layer(1)}>
            <circle cx="206" cy="28" r="20" fill="var(--sun)" opacity="0.18" />
            <circle cx="206" cy="28" r="11" fill="var(--sun)" opacity="0.85" />
          </g>
          <g style={layer(2)}>
            <g style={{ animation: 'qdrift 14s ease-in-out infinite alternate' }}>
              <ellipse cx="42" cy="32" rx="20" ry="8" fill="var(--cloud)" opacity="0.95" />
              <ellipse cx="58" cy="27" rx="13" ry="6" fill="var(--cloud)" opacity="0.95" />
            </g>
            <g style={{ animation: 'qdrift 19s ease-in-out infinite alternate-reverse' }}>
              <ellipse cx="166" cy="58" rx="16" ry="6.5" fill="var(--cloud)" opacity="0.85" />
              <ellipse cx="179" cy="54" rx="10" ry="5" fill="var(--cloud)" opacity="0.85" />
            </g>
          </g>
          <g style={layer(3)}>
            {PETALS.map((p, j) => (
              <circle
                key={j}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill={p.fill}
                opacity="0.75"
                style={{
                  animation: `qfloat ${4.5 + j * 0.8}s ease-in-out infinite`,
                  animationDelay: `${j * 0.6}s`,
                }}
              />
            ))}
          </g>
          <g style={layer(4)}>
            <path
              d="M36 56 q5 -6 10 0 q5 -6 10 0"
              fill="none"
              stroke="var(--ink-dim)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M64 42 q4 -5 8 0 q4 -5 8 0"
              fill="none"
              stroke="var(--ink-dim)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M148 22 q4 -5 8 0 q4 -5 8 0"
              fill="none"
              stroke="var(--ink-dim)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
          <ellipse
            cx="120"
            cy="204"
            rx={HERO_STAGES[stage - 1].groundRx}
            ry="6"
            fill="var(--ground)"
            opacity="0.6"
            style={{ transition: 'rx .7s ease' }}
          />
          {HERO_STAGES.map((sd, idx) => {
            const on = idx + 1 === stage
            const lit = Math.round(doneRatio * sd.leafSpots.length)
            return (
              <g
                key={idx}
                style={{
                  opacity: on ? 1 : 0,
                  transform: on ? 'scale(1)' : idx + 1 < stage ? 'scale(1.08)' : 'scale(0.82)',
                  transformOrigin: '120px 202px',
                  transformBox: 'view-box',
                  transition: 'opacity .65s ease, transform .85s cubic-bezier(.22,.61,.36,1)',
                  pointerEvents: 'none',
                }}
              >
                {(sd.blobs ?? []).map((b, k) => (
                  <ellipse
                    key={k}
                    cx={b.cx}
                    cy={b.cy}
                    rx={b.rx}
                    ry={b.ry}
                    fill="var(--canopy-blob)"
                    opacity="0.45"
                  />
                ))}
                {sd.branches.map((b, k) => (
                  <path
                    key={k}
                    d={b.d}
                    fill="none"
                    stroke="var(--branch)"
                    strokeWidth={b.w}
                    strokeLinecap="round"
                  />
                ))}
                {sd.leafSpots.map((s, j) => {
                  const isLit = j < lit
                  return (
                    <ellipse
                      key={j}
                      cx={s.cx}
                      cy={s.cy}
                      rx={sd.leafRx}
                      ry={sd.leafRy}
                      fill={isLit ? (j % 2 ? '#C5683F' : '#8B9B6E') : '#F3EAD9'}
                      stroke={isLit ? 'none' : '#CFC1A8'}
                      strokeWidth="1.2"
                      opacity={isLit ? (doneRatio === 1 ? 1 : 0.9) : 0.85}
                      transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
                      style={{ transition: 'fill .45s ease, opacity .45s ease' }}
                    />
                  )
                })}
                {(sd.grass ?? []).map((gd, k) => (
                  <path
                    key={k}
                    d={gd}
                    fill="none"
                    stroke="var(--olive)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                ))}
                {sd.leafSpots
                  .filter((_, j) => j % 5 === 2)
                  .map((s, k) => (
                    <circle
                      key={k}
                      cx={s.cx}
                      cy={s.cy + 3}
                      r="2.6"
                      fill="var(--danger)"
                      opacity={on && total > 0 && doneRatio === 1 ? 1 : 0}
                      style={{ transition: 'opacity .5s ease' }}
                    />
                  ))}
              </g>
            )
          })}
        </svg>
      </div>
      <div className={styles.copy}>
        <div>
          <div className="eyebrow eyebrowWide">The book you're writing</div>
          <div className={`serif ${styles.headline}`}>{headline}</div>
        </div>
        <div className={styles.caption}>{caption}</div>
        <div className={styles.stats}>
          <div>
            <div className={`serif ${styles.statNum}`}>{openCount}</div>
            <div className={styles.statLabel}>chapters open</div>
          </div>
          <div className={styles.statDivider} />
          <div>
            <div className={`serif ${styles.statNum}`}>
              {doneCount} of {total} done
            </div>
            <div className={styles.statLabel}>lines today</div>
          </div>
          <div className={styles.statDivider} />
          <div>
            <div className={`serif ${styles.statNum}`}>{m}</div>
            <div className={styles.statLabel}>momentum</div>
          </div>
        </div>
        <div className={styles.weekPill} onClick={() => setTodoPanel(1)}>
          <span className="eyebrow eyebrowWide">This week</span>
          <span className={styles.weekCount}>
            {wkDone} of {weekly.length} done
          </span>
          <span className={styles.weekNote}>{ATMO_NOTES[level]} ›</span>
        </div>
      </div>
    </>
  )
}
