/*
 * Chapter detail, right card — the accent-coloured mini tree that grows
 * through 4 stages as milestones are completed.
 */
import { CHAPTER_STAGES, chapterStageFor } from '../../lib/tree'
import styles from './ChapterTree.module.css'

interface ChapterTreeProps {
  accent: string
  doneCount: number
  total: number
}

export function ChapterTree({ accent, doneCount, total }: ChapterTreeProps) {
  const stage = chapterStageFor(doneCount, total)
  return (
    <svg viewBox="0 0 340 164" className={styles.svg}>
      <ellipse
        cx="170"
        cy="152"
        rx={CHAPTER_STAGES[stage - 1].groundRx}
        ry="5"
        fill="var(--ground)"
        opacity="0.6"
        style={{ transition: 'rx .6s ease' }}
      />
      {CHAPTER_STAGES.map((sd, idx) => {
        const on = idx + 1 === stage
        return (
          <g
            key={idx}
            style={{
              opacity: on ? 1 : 0,
              transform: on ? 'scale(1)' : idx + 1 < stage ? 'scale(1.1)' : 'scale(0.8)',
              transformOrigin: '170px 150px',
              transformBox: 'view-box',
              transition: 'opacity .6s ease, transform .8s cubic-bezier(.22,.61,.36,1)',
              pointerEvents: 'none',
            }}
          >
            {sd.canopy.map((c, k) => (
              <circle key={k} cx={c.cx} cy={c.cy} r={c.r} fill={accent} opacity="0.16" />
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
            {sd.dots.map((p, k) => (
              <circle key={k} cx={p.cx} cy={p.cy} r="3.2" fill={accent} opacity="0.85" />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
