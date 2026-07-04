/*
 * View 2 — Chapter detail: milestone timeline on the left; checkpoint
 * countdown, progress chart (IELTS) or chapter tree, and lifecycle actions
 * (complete / reopen / delete) on the right.
 */
import { useState, type KeyboardEvent } from 'react'
import { ChapterTree } from '../components/chapter/ChapterTree'
import { MilestoneTimeline } from '../components/chapter/MilestoneTimeline'
import { lineGeometry } from '../lib/chart'
import { daysTo } from '../lib/date'
import { useQuill } from '../store/QuillContext'
import { SKILL_KEYS } from '../store/types'
import styles from './ChapterDetail.module.css'

interface ChapterDetailProps {
  chapterId: string
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function ChapterDetail({ chapterId }: ChapterDetailProps) {
  const {
    chapters,
    msItems,
    msDone,
    entries,
    goIelts,
    setChapterClosed,
    deleteChapter,
    setCheckpoint,
    renameChapter,
  } = useQuill()
  const [delAsking, setDelAsking] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [titleVal, setTitleVal] = useState('')

  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) return null
  const isIelts = chapter.id === 'ielts'

  const milestones = msItems[chapter.id] ?? []
  const doneCount = Math.min(msDone[chapter.id] ?? 0, milestones.length)

  // "% inked": milestone completion — except IELTS, whose journey is the
  // overall band moving from start to target. Closed chapters read 100.
  const latest = SKILL_KEYS.map((k) => {
    const arr = entries[k]
    return arr.length ? arr[arr.length - 1].band : null
  })
  const overallNum = latest.every((v) => v != null)
    ? (latest as number[]).reduce((a, b) => a + b, 0) / 4
    : null
  const msRatio = milestones.length ? doneCount / milestones.length : 0
  const pct = chapter.closed
    ? 100
    : Math.round(
        (isIelts && overallNum != null && chapter.target !== chapter.start
          ? clamp01((overallNum - chapter.start) / (chapter.target - chapter.start))
          : msRatio) * 100,
      )

  // IELTS chart: overall band (mean of the four skills) per mock
  let ieltsGeo = null
  if (isIelts) {
    const n = Math.min(...SKILL_KEYS.map((k) => entries[k].length))
    const series: number[] = []
    for (let i = 0; i < n; i++) {
      series.push((entries.l[i].band + entries.r[i].band + entries.w[i].band + entries.s[i].band) / 4)
    }
    ieltsGeo = lineGeometry(series.length ? series : [7], 340, 130, 12, 5, 9)
  }

  const checkpoint = chapter.checkpoint

  const saveTitle = () => {
    renameChapter(chapter.id, titleVal)
    setRenaming(false)
    setTitleVal('')
  }

  const onTitleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') saveTitle()
    if (e.key === 'Escape') {
      setRenaming(false)
      setTitleVal('')
    }
  }

  return (
    <div className={styles.view}>
      <div>
        <div className={styles.titleRow}>
          <span className={styles.titleDot} style={{ background: chapter.accent }} />
          {renaming ? (
            <input
              type="text"
              className={`serif ${styles.titleInput}`}
              value={titleVal}
              onChange={(e) => setTitleVal(e.target.value)}
              onKeyDown={onTitleKey}
              autoFocus
            />
          ) : (
            <>
              <div className={`serif ${styles.title}`}>{chapter.title}</div>
              <span
                className={styles.pctChip}
                style={{ background: chapter.tint, color: chapter.accent }}
              >
                {pct}% inked
              </span>
              <button
                className={styles.renameBtn}
                title="Rename chapter"
                onClick={() => {
                  setRenaming(true)
                  setTitleVal(chapter.title)
                }}
              >
                ✎
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <MilestoneTimeline chapterId={chapter.id} accent={chapter.accent} />

        <div className={styles.rightCol}>
          {checkpoint ? (
            <div className={styles.ckCard} style={{ background: chapter.tint }}>
              <div className={styles.ckHead}>
                <span className={styles.ckStar} style={{ background: chapter.accent }}>
                  ✦
                </span>
                <div className={styles.ckHeadText}>
                  <div className="eyebrow">Next checkpoint</div>
                  <div className={`serif ${styles.ckLabel}`}>{checkpoint.label}</div>
                </div>
              </div>
              <div className={styles.ckFoot}>
                <div>
                  <span className={`serif ${styles.ckNum}`} style={{ color: chapter.accent }}>
                    {daysTo(checkpoint.date)}
                  </span>
                  <span className={styles.ckUnit}> days away</span>
                </div>
                <input
                  type="date"
                  className={styles.ckDate}
                  value={checkpoint.date}
                  onChange={(e) => setCheckpoint(chapter.id, e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className={styles.noCkCard}>
              <div>
                <div className="eyebrow">Target date</div>
                <div className={styles.noCkText}>Give this chapter a deadline to write toward.</div>
              </div>
              <input
                type="date"
                className={`${styles.ckDate} ${styles.noCkDate}`}
                value=""
                onChange={(e) => setCheckpoint(chapter.id, e.target.value)}
              />
            </div>
          )}

          <div className={styles.chartCard}>
            {isIelts && ieltsGeo ? (
              <>
                <div className={`eyebrow eyebrowWide ${styles.chartKicker}`}>
                  Overall band over mocks
                </div>
                <svg viewBox="0 0 340 130" className={styles.chartSvg}>
                  <line x1="6" y1="18" x2="334" y2="18" stroke="var(--grid)" strokeWidth="1" />
                  <line x1="6" y1="64" x2="334" y2="64" stroke="var(--grid)" strokeWidth="1" />
                  <line x1="6" y1="110" x2="334" y2="110" stroke="var(--grid)" strokeWidth="1" />
                  <path d={ieltsGeo.area} fill={chapter.accent} fillOpacity="0.08" />
                  <path
                    d={ieltsGeo.line}
                    fill="none"
                    stroke={chapter.accent}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={ieltsGeo.last.x}
                    cy={ieltsGeo.last.y}
                    r="4.5"
                    fill={chapter.accent}
                  />
                </svg>
              </>
            ) : (
              <>
                <div className={styles.treeHead}>
                  <span className="eyebrow eyebrowWide">This chapter's tree</span>
                  <span className={styles.treeNote}>
                    {doneCount} of {milestones.length} milestones done
                  </span>
                </div>
                <ChapterTree
                  accent={chapter.accent}
                  doneCount={doneCount}
                  total={milestones.length}
                />
              </>
            )}
          </div>

          {isIelts && (
            <button className={styles.logBtn} onClick={goIelts}>
              Open full IELTS log
            </button>
          )}

          {chapter.closed ? (
            <div className={styles.closedBanner}>
              <span className={styles.closedCheck}>✓</span>
              <span className={styles.closedText}>Chapter complete. The book remembers it.</span>
              <button
                className={styles.reopenBtn}
                onClick={() => setChapterClosed(chapter.id, false)}
              >
                Reopen
              </button>
            </div>
          ) : (
            <button
              className={styles.completeBtn}
              onClick={() => setChapterClosed(chapter.id, true)}
            >
              ✓ Mark chapter complete
            </button>
          )}

          {delAsking ? (
            <div className={styles.delBanner}>
              <span className={styles.delText}>
                Delete this chapter for good? Its milestones go with it.
              </span>
              <div className={styles.delBtns}>
                <button className={styles.delYes} onClick={() => deleteChapter(chapter.id)}>
                  Yes, delete
                </button>
                <button className={styles.delCancel} onClick={() => setDelAsking(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className={styles.delGhost} onClick={() => setDelAsking(true)}>
              Delete chapter…
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
