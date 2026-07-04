import { useState, type KeyboardEvent } from 'react'
import { OWNER_INITIAL, OWNER_NAME } from '../data/constants'
import { chapterShort } from '../data/palette'
import { useQuill } from '../store/QuillContext'
import { BackupControls } from './BackupControls'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { chapters, route, goToday, goPages, openChapter, addChapter } = useQuill()
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  const open = chapters.filter((c) => !c.closed)
  const finished = chapters.filter((c) => c.closed)
  const todayActive = route.view === 'today'
  const pagesActive = route.view === 'pages'

  const isActive = (id: string) =>
    (route.view === 'chapter' && route.chapterId === id) ||
    (route.view === 'ielts' && id === 'ielts')

  const onNewChapterKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addChapter(title)
      setAdding(false)
      setTitle('')
    }
    if (e.key === 'Escape') {
      setAdding(false)
      setTitle('')
    }
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoRow}>
        <span className={styles.logo}>Q</span>
        <span className={`serif ${styles.wordmark}`}>Quill</span>
      </div>

      <div className={styles.group}>
        <div
          className={`${styles.item} ${todayActive ? styles.itemActive : ''}`}
          onClick={goToday}
        >
          <span className={`${styles.roundDot} ${todayActive ? styles.roundDotActive : ''}`} />
          Today
        </div>
        <div
          className={`${styles.item} ${pagesActive ? styles.itemActive : ''}`}
          onClick={goPages}
        >
          <span className={`${styles.roundDot} ${pagesActive ? styles.roundDotActive : ''}`} />
          Past pages
        </div>
      </div>

      <div className={styles.group}>
        <div className={`eyebrow eyebrowWide ${styles.sectionLabel}`}>Chapters</div>
        {open.map((c) => {
          const active = isActive(c.id)
          return (
            <div
              key={c.id}
              className={`${styles.item} ${styles.chapterItem} ${active ? styles.itemActive : ''}`}
              onClick={() => openChapter(c.id)}
            >
              <span
                className={styles.squareDot}
                style={{ background: active ? 'var(--on-accent)' : c.accent }}
              />
              <span className={styles.itemLabel}>{chapterShort(c)}</span>
            </div>
          )
        })}
        {adding ? (
          <input
            type="text"
            className={styles.newInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onNewChapterKey}
            autoFocus
            placeholder="Chapter title…"
          />
        ) : (
          <div className={styles.addGhost} onClick={() => setAdding(true)}>
            + New chapter
          </div>
        )}
        {finished.length > 0 && (
          <>
            <div className={`eyebrow eyebrowWide ${styles.sectionLabel} ${styles.finishedLabel}`}>
              Finished
            </div>
            {finished.map((c) => (
              <div
                key={c.id}
                className={`${styles.item} ${styles.finishedItem}`}
                onClick={() => openChapter(c.id)}
              >
                <span className={styles.finishedCheck}>✓</span>
                <span className={`${styles.itemLabel} ${styles.finishedText}`}>
                  {chapterShort(c)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <div className={styles.footer}>
        <BackupControls />
        <div className={styles.user}>
          <span className={styles.avatar}>{OWNER_INITIAL}</span>
          <span className={styles.userName}>{OWNER_NAME}</span>
        </div>
      </div>
    </div>
  )
}
