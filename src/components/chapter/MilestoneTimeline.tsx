/*
 * Chapter detail, left card — the vertical milestone timeline. Clicking a
 * circle marks everything up to it done (clicking a done one un-marks back).
 * Each milestone can carry "tiny goals" with accent-coloured checkboxes.
 */
import { useState, type KeyboardEvent } from 'react'
import { useQuill } from '../../store/QuillContext'
import styles from './MilestoneTimeline.module.css'

interface MilestoneTimelineProps {
  chapterId: string
  accent: string
}

export function MilestoneTimeline({ chapterId, accent }: MilestoneTimelineProps) {
  const {
    msItems,
    msDone,
    toggleMilestone,
    addMilestone,
    moveMilestone,
    removeMilestone,
    addTinyGoal,
    toggleTinyGoal,
    removeTinyGoal,
  } = useQuill()

  const [newMs, setNewMs] = useState('')
  const [tgFor, setTgFor] = useState<string | null>(null)
  const [tgVal, setTgVal] = useState('')

  const milestones = msItems[chapterId] ?? []
  const doneCount = Math.min(msDone[chapterId] ?? 0, milestones.length)

  const submitNew = () => {
    addMilestone(chapterId, newMs)
    if (newMs.trim()) setNewMs('')
  }

  const submitTiny = (i: number) => {
    addTinyGoal(chapterId, i, tgVal)
    if (tgVal.trim()) {
      setTgVal('')
      setTgFor(null)
    }
  }

  const onTinyKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Enter') submitTiny(i)
    if (e.key === 'Escape') {
      setTgFor(null)
      setTgVal('')
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <span className="eyebrow eyebrowWide">Milestones</span>
        <span className={styles.hint}>Tap a circle to mark done</span>
      </div>
      {milestones.map((m, i) => {
        const state = i < doneCount ? 'done' : i === doneCount ? 'current' : 'todo'
        const key = chapterId + ':' + m.id
        const isLast = i === milestones.length - 1
        return (
          <div key={m.id} className={styles.msRow}>
            <div className={styles.rail}>
              <span
                role="button"
                className={`${styles.dot} ${
                  state === 'done' ? styles.dotDone : state === 'current' ? styles.dotCurrent : styles.dotTodo
                }`}
                style={
                  state === 'done'
                    ? { background: accent }
                    : state === 'current'
                      ? { borderColor: accent }
                      : undefined
                }
                onClick={() => toggleMilestone(chapterId, i)}
              >
                {state === 'done' ? '✓' : ''}
              </span>
              <span className={`${styles.railLine} ${isLast ? styles.railLineLast : ''}`} />
            </div>
            <div className={styles.msBody}>
              <div className={styles.labelRow}>
                <span
                  className={`${styles.label} ${state === 'todo' ? styles.labelTodo : ''}`}
                >
                  {m.label}
                </span>
                <span className={styles.controls}>
                  <button
                    className={styles.ctl}
                    title="Move up"
                    disabled={i === 0}
                    onClick={() => moveMilestone(chapterId, i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className={styles.ctl}
                    title="Move down"
                    disabled={isLast}
                    onClick={() => moveMilestone(chapterId, i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    className={`${styles.ctl} ${styles.ctlDel}`}
                    title="Remove"
                    onClick={() => removeMilestone(chapterId, i)}
                  >
                    ×
                  </button>
                </span>
              </div>
              <div className={styles.sub}>
                {state === 'done' ? 'Done' : state === 'current' ? 'In progress' : m.sub || 'Up next'}
              </div>
              {(m.goals ?? []).map((g, gi) => (
                <div key={g.id} className={styles.tinyRow}>
                  <span
                    className={styles.tinyBox}
                    style={
                      g.done
                        ? { background: accent, borderColor: accent }
                        : undefined
                    }
                    onClick={() => toggleTinyGoal(chapterId, i, gi)}
                  >
                    {g.done ? '✓' : ''}
                  </span>
                  <span
                    className={`${styles.tinyText} ${g.done ? styles.tinyTextDone : ''}`}
                    onClick={() => toggleTinyGoal(chapterId, i, gi)}
                  >
                    {g.text}
                  </span>
                  <button className={styles.tinyDel} onClick={() => removeTinyGoal(chapterId, i, gi)}>
                    ×
                  </button>
                </div>
              ))}
              {tgFor === key ? (
                <div className={styles.tinyAddRow}>
                  <input
                    type="text"
                    className={styles.tinyInput}
                    value={tgVal}
                    onChange={(e) => setTgVal(e.target.value)}
                    onKeyDown={(e) => onTinyKey(e, i)}
                    placeholder="A tiny goal…"
                    autoFocus
                  />
                  <button className={styles.tinyAddBtn} onClick={() => submitTiny(i)}>
                    Add
                  </button>
                  <button
                    className={styles.tinyCancel}
                    onClick={() => {
                      setTgFor(null)
                      setTgVal('')
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  className={styles.tinyGhost}
                  onClick={() => {
                    setTgFor(key)
                    setTgVal('')
                  }}
                >
                  + Tiny goal
                </div>
              )}
            </div>
          </div>
        )
      })}
      {milestones.length === 0 && (
        <div className={styles.empty}>A fresh chapter. Add its first milestone below.</div>
      )}
      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.addInput}
          value={newMs}
          onChange={(e) => setNewMs(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNew()
          }}
          placeholder="Add a milestone…"
        />
        <button className={styles.addBtn} onClick={submitNew}>
          Add
        </button>
      </div>
    </div>
  )
}
