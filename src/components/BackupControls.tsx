/*
 * Sidebar footer — save the whole book to a JSON file, or restore one.
 * Restoring asks for confirmation inline (it replaces everything), then
 * reloads so the app rehydrates from the imported storage.
 */
import { useRef, useState, type ChangeEvent } from 'react'
import { applyBackup, downloadBackup, inspectBackup, type BackupSummary } from '../store/backup'
import { useQuill } from '../store/QuillContext'
import styles from './BackupControls.module.css'

export function BackupControls() {
  const store = useQuill()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ text: string; summary: BackupSummary } | null>(null)
  const [error, setError] = useState(false)

  const exportBook = () => {
    setError(false)
    setPending(null)
    downloadBackup({
      todos: store.todos,
      weekly: store.weekly,
      weeklyHistory: store.weeklyHistory,
      chapters: store.chapters,
      msItems: store.msItems,
      msDone: store.msDone,
      days: store.days,
      entries: store.entries,
      carryover: store.carryover,
    })
  }

  const pickFile = () => {
    setError(false)
    fileRef.current?.click()
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const text = await file.text()
    const summary = inspectBackup(text)
    if (summary) {
      setPending({ text, summary })
    } else {
      setPending(null)
      setError(true)
    }
  }

  const restore = () => {
    if (pending && applyBackup(pending.text)) {
      window.location.reload()
    }
  }

  return (
    <div className={styles.wrap}>
      {pending ? (
        <div className={styles.confirm}>
          <div className={styles.confirmText}>
            Replace the current book? ({pending.summary.chapters}{' '}
            {pending.summary.chapters === 1 ? 'chapter' : 'chapters'} ·{' '}
            {pending.summary.daysRecorded} {pending.summary.daysRecorded === 1 ? 'day' : 'days'})
          </div>
          <div className={styles.confirmBtns}>
            <button className={styles.replaceBtn} onClick={restore}>
              Replace
            </button>
            <button className={styles.cancelBtn} onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.action} onClick={exportBook}>
            Back up the book
          </div>
          <div className={styles.action} onClick={pickFile}>
            Restore a backup
          </div>
          {error && <div className={styles.error}>That file isn't a Quill backup.</div>}
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className={styles.file}
        onChange={onFile}
      />
    </div>
  )
}
