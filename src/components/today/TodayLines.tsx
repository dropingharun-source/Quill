/*
 * Lower panel A — "Today's lines": the day's to-dos, fed into chapters via
 * the chip row, with carry-over prompt, repeat-daily, inline edit, and the
 * end-of-day reflection once every line is done.
 */
import { useState, type KeyboardEvent } from 'react'
import { chapterShort } from '../../data/palette'
import { epochDay } from '../../lib/date'
import { useQuill } from '../../store/QuillContext'
import styles from './TodayLines.module.css'

export function TodayLines() {
  const {
    todos,
    chapters,
    days,
    carryover,
    feedChapter,
    setFeedChapter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    toggleRepeat,
    resolveCarry,
    saveReflection,
  } = useQuill()

  const [newTodo, setNewTodo] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editVal, setEditVal] = useState('')
  const [reflectVal, setReflectVal] = useState('')
  const [reflectEditing, setReflectEditing] = useState(false)

  const openChapters = chapters.filter((c) => !c.closed)
  const feedId = openChapters.some((c) => c.id === feedChapter) ? feedChapter : null

  const total = todos.length
  const done = todos.filter((t) => t.done).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const chTag: Record<string, { short: string; accent: string; tint: string }> = {}
  chapters.forEach((c) => {
    chTag[c.id] = { short: chapterShort(c), accent: c.accent, tint: c.tint }
  })

  const submitNew = () => {
    addTodo(newTodo, feedId)
    if (newTodo.trim()) setNewTodo('')
  }

  const saveEdit = () => {
    if (editId == null) return
    editTodo(editId, editVal)
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

  const todayNote = days[epochDay()]?.note ?? ''
  const reflectOn = total > 0 && done === total
  const reflectSaved = !!todayNote && !reflectEditing

  const submitReflection = () => {
    saveReflection(reflectVal.trim())
    setReflectVal('')
    setReflectEditing(false)
  }

  const carryN = carryover?.length ?? 0

  const chips: { id: string | null; label: string; accent: string; tint: string }[] = [
    { id: null, label: 'General', accent: '#6F6354', tint: '#F0E7D6' },
    ...openChapters.map((c) => ({
      id: c.id as string | null,
      label: chapterShort(c),
      accent: c.accent,
      tint: c.tint,
    })),
  ]

  return (
    <>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className="eyebrow eyebrowWide">Today's lines</div>
          <div className={`serif ${styles.count}`}>
            {done} of {total} done
          </div>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {carryover && (
        <div className={styles.carry}>
          <span className={styles.carryLabel}>
            {carryN} {carryN === 1 ? 'line was' : 'lines were'} left unfinished yesterday. Carry{' '}
            {carryN === 1 ? 'it' : 'them'} into today?
          </span>
          <div className={styles.carryBtns}>
            <button className={styles.carryKeep} onClick={() => resolveCarry(true)}>
              Carry them over
            </button>
            <button className={styles.carryDrop} onClick={() => resolveCarry(false)}>
              Let them go
            </button>
          </div>
        </div>
      )}

      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.addInput}
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNew()
          }}
          placeholder="Write a line — press Enter…"
        />
        <button className={styles.addBtn} onClick={submitNew}>
          Add
        </button>
      </div>

      <div className={styles.chips}>
        <span className={styles.chipsLabel}>Feeds:</span>
        {chips.map((cd) => {
          const on = feedId === cd.id
          return (
            <span
              key={cd.id ?? 'general'}
              className={`${styles.chip} ${on ? styles.chipOn : ''}`}
              style={on ? { background: cd.tint, color: cd.accent, borderColor: cd.accent } : undefined}
              onClick={() => setFeedChapter(cd.id)}
            >
              {cd.label}
            </span>
          )
        })}
      </div>

      <div className={styles.grid}>
        {todos.map((t) => {
          const meta = t.chapter ? chTag[t.chapter] : undefined
          const editing = editId === t.id
          return (
            <div key={t.id} className={styles.row}>
              <span
                className={`${styles.box} ${t.done ? styles.boxDone : ''}`}
                onClick={() => toggleTodo(t.id)}
              >
                {t.done ? '✓' : ''}
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
                  <>
                    <span
                      className={`${styles.text} ${t.done ? styles.textDone : ''}`}
                      onClick={() => toggleTodo(t.id)}
                    >
                      {t.text}
                    </span>
                    {meta && (
                      <span
                        className={styles.tag}
                        style={{ background: meta.tint, color: meta.accent }}
                      >
                        {meta.short}
                      </span>
                    )}
                    {t.repeat && <span className={styles.daily}>daily</span>}
                  </>
                )}
              </div>
              <button
                className={`${styles.repeatBtn} ${t.repeat ? styles.repeatOn : ''}`}
                title="Repeat every day"
                onClick={() => toggleRepeat(t.id)}
              >
                ↺
              </button>
              <button
                className={styles.editBtn}
                title="Edit line"
                onClick={() => {
                  setEditId(t.id)
                  setEditVal(t.text)
                }}
              >
                ✎
              </button>
              <button className={styles.delBtn} onClick={() => deleteTodo(t.id)}>
                ×
              </button>
            </div>
          )
        })}
        {total === 0 && (
          <div className={styles.empty}>A blank page. Write your first line above.</div>
        )}
      </div>

      {reflectOn && (
        <div className={styles.reflect}>
          <div className={`eyebrow eyebrowWide ${styles.reflectKicker}`}>
            Close the page — one sentence about today
          </div>
          {reflectSaved ? (
            <div className={styles.reflectSaved}>
              <span className={`serif ${styles.reflectQuote}`}>“{todayNote}”</span>
              <span
                className={styles.reflectEditLink}
                onClick={() => {
                  setReflectEditing(true)
                  setReflectVal(todayNote)
                }}
              >
                Edit
              </span>
            </div>
          ) : (
            <div className={styles.reflectRow}>
              <input
                type="text"
                className={styles.reflectInput}
                value={reflectVal}
                onChange={(e) => setReflectVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitReflection()
                }}
                placeholder="The page is full. How did today read?"
              />
              <button className={styles.reflectSave} onClick={submitReflection}>
                Save
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
