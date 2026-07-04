import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import styles from './SlidePanels.module.css'

interface SlidePanelsProps {
  panel: 0 | 1
  onPanelChange: (panel: 0 | 1) => void
  panelA: ReactNode
  panelB: ReactNode
  /** Extra class for each 50%-wide panel (padding/layout per use). */
  panelAClassName?: string
  panelBClassName?: string
  ariaLabel: string
  /** The hero card is a fixed 336px; the lines card sizes to content. */
  fixedHeight?: number
}

/**
 * Two-panel horizontal carousel with the handoff's pill drag-handle:
 * drag (with rubber-banding past the ends, >50% to switch), click to
 * toggle, arrow keys when focused, or the two dots.
 */
export function SlidePanels({
  panel,
  onPanelChange,
  panelA,
  panelB,
  panelAClassName,
  panelBClassName,
  ariaLabel,
  fixedHeight,
}: SlidePanelsProps) {
  const [dragPct, setDragPct] = useState<number | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  const startX = useRef<number | null>(null)
  const cardWidth = useRef(800)
  const moved = useRef(false)

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* unsupported pointer */
    }
    cardWidth.current = e.currentTarget.parentElement?.offsetWidth ?? 800
    startX.current = e.clientX
    moved.current = false
    setGrabbing(true)
  }

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 4) moved.current = true
    if (!moved.current) return
    const base = panel === 0 ? 0 : -50
    let tx = base + (dx / cardWidth.current) * 50
    if (tx > 0) tx = tx / 3
    if (tx < -50) tx = -50 + (tx + 50) / 3
    setDragPct(tx)
  }

  const onUp = () => {
    if (startX.current == null) return
    const didMove = moved.current
    startX.current = null
    moved.current = false
    if (!didMove || dragPct == null) {
      onPanelChange(panel === 0 ? 1 : 0)
    } else {
      onPanelChange(-dragPct / 50 > 0.5 ? 1 : 0)
    }
    setDragPct(null)
    setGrabbing(false)
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onPanelChange(0)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      onPanelChange(1)
    }
  }

  const tx = dragPct ?? (panel === 0 ? 0 : -50)

  return (
    <div className={styles.card} style={fixedHeight ? { height: fixedHeight } : undefined}>
      <div
        className={styles.track}
        style={{
          transform: `translateX(${tx}%)`,
          transition: dragPct != null ? 'none' : undefined,
        }}
      >
        <div className={`${styles.panel} ${panelAClassName ?? ''}`}>{panelA}</div>
        <div className={`${styles.panel} ${panelBClassName ?? ''}`}>{panelB}</div>
      </div>
      <div
        className={`${styles.handle} ${grabbing ? styles.grabbing : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        tabIndex={0}
        role="button"
        aria-label={ariaLabel}
      >
        {panel === 0 ? '›' : '‹'}
      </div>
      <div className={styles.dots}>
        <span
          className={`${styles.dot} ${panel === 0 ? styles.dotOn : ''}`}
          onClick={() => onPanelChange(0)}
        />
        <span
          className={`${styles.dot} ${panel === 1 ? styles.dotOn : ''}`}
          onClick={() => onPanelChange(1)}
        />
      </div>
    </div>
  )
}
