/*
 * Lower panel B — "This week's goals". Green checkboxes; completing goals
 * wakes the hero tree's sky. Items reset to unchecked when a new week starts
 * (handled at load).
 */
import { useState, type KeyboardEvent } from 'react'
import { ATMO_NOTES, atmoLevel } from '../../lib/today'
import { useQuill } from '../../store/QuillContext'
import styles from './WeeklyGoals.module.css'

export function WeeklyGoals() {
  const { weekly, addWeekly, toggleWeekly, removeWeekly, editWeekly } = useQuill()
  const [val, setVal] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  const total = weekly.length
  const done = weekly.filter((w) => w.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const submit = () => {
    addWeekly(val)
    if (val.trim()) setVal('')
  }

  const saveEdit = () => {
    if (editId == null) return
    editWeekly(editId, editVal)
    setEditId(null)
    setEditVal('')
  }

  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') {
      setEditId(null)
      setEditVal('')
    }
  }

  return (
    <>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className="eyebrow eyebrowWide">This week's goals</div>
          <div className={`serif ${styles.count}`}>
            {done} of {total} done
          </div>
        </div>
        <div className={styles.headRight}>
          <span className={styles.note}>{ATMO_NOTES[atmoLevel(weekly)]}</span>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.addInput}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Add a weekly goal — press Enter…"
        />
        <button className={styles.addBtn} onClick={submit}>
          Add
        </button>
      </div>

      <div className={styles.grid}>
        {weekly.map((w) => {
          const editing = editId === w.id
          return (
            <div key={w.id} className={styles.row}>
              <span
                className={`${styles.box} ${w.done ? styles.boxDone : ''}`}
                onClick={() => toggleWeekly(w.id)}
              >
                {w.done ? '✓' : ''}
              </span>
              <div className={styles.rowBody}>
                {editing ? (
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={onEditKey}
                    autoFocus
                  />
                ) : (
                  <span
                    className={`${styles.text} ${w.done ? styles.textDone : ''}`}
                    onClick={() => toggleWeekly(w.id)}
                  >
                    {w.text}
                  </span>
                )}
              </div>
              <button
                className={styles.editBtn}
                title="Edit goal"
                onClick={() => {
                  setEditId(w.id)
                  setEditVal(w.text)
                }}
              >
                ✎
              </button>
              <button className={styles.delBtn} onClick={() => removeWeekly(w.id)}>
                ×
              </button>
            </div>
          )
        })}
        {total === 0 && (
          <div className={styles.empty}>No weekly goals yet. Set one above — the sky is waiting.</div>
        )}
      </div>
    </>
  )
}
