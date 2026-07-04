/*
 * View 3 — the full IELTS log: four smoothed band-score lines over mock
 * index (click a point to edit/delete it), plus the score-entry card
 * (full mock test or single skill).
 */
import { useState } from 'react'
import { OptionMenu } from '../components/OptionMenu'
import { Segmented } from '../components/Segmented'
import { CHART_META, SKILL_META } from '../data/palette'
import { smooth } from '../lib/chart'
import { useQuill, type LogMode } from '../store/QuillContext'
import { SKILL_KEYS, type SkillKey } from '../store/types'
import styles from './IeltsLog.module.css'

const MODE_OPTIONS: { value: LogMode; label: string }[] = [
  { value: 'mock', label: 'Full mock test' },
  { value: 'single', label: 'Single skill' },
]

const GRID_YS = [16, 58, 99, 141, 182]
const GRID_BANDS = ['9', '8', '7', '6', '5']

export function IeltsLog() {
  const {
    entries,
    openChapter,
    chartSkill,
    setChartSkill,
    logMode,
    setLogMode,
    singleSkill,
    setSingleSkill,
    logMock,
    addSingle,
    updateEntry,
    deleteEntry,
  } = useQuill()

  const [chartOpen, setChartOpen] = useState(false)
  const [skillOpen, setSkillOpen] = useState(false)
  const [hover, setHover] = useState<{ k: SkillKey; i: number } | null>(null)
  const [editing, setEditing] = useState<{ k: SkillKey; i: number } | null>(null)
  const [editBand, setEditBand] = useState('')
  const [draft, setDraft] = useState<Record<SkillKey, string>>({ l: '', r: '', w: '', s: '' })
  const [single, setSingle] = useState('')

  // Overall band = mean of the four latest bands, rounded to nearest 0.5
  const latest = SKILL_KEYS.map((k) => {
    const arr = entries[k]
    return arr.length ? arr[arr.length - 1].band : null
  })
  const overallBand = latest.every((v) => v != null)
    ? (Math.round(((latest as number[]).reduce((a, b) => a + b, 0) / 4) * 2) / 2).toFixed(1)
    : '—'

  // Chart geometry (bands 4–9 on a 700×240 canvas)
  const plotKeys: SkillKey[] = chartSkill === 'all' ? SKILL_KEYS : [chartSkill]
  const axisN = Math.max(1, ...plotKeys.map((k) => entries[k].length))
  const innerW = 700 - 32
  const xOf = (i: number) => 16 + (axisN <= 1 ? innerW / 2 : innerW * (i / (axisN - 1)))
  const yOf = (b: number) => {
    const c = Math.max(4, Math.min(9, b))
    return 16 + (240 - 32) * (1 - (c - 4) / 5)
  }
  const lineFor = (k: SkillKey) =>
    plotKeys.includes(k)
      ? smooth(entries[k].map((e, i) => ({ x: xOf(i), y: yOf(e.band) })))
      : ''
  const lastValOf = (k: SkillKey) => {
    const arr = entries[k]
    return arr.length ? arr[arr.length - 1].band.toFixed(1) : '—'
  }

  const hovered = hover && entries[hover.k][hover.i] ? hover : null
  const tipCx = hovered ? xOf(hovered.i) : 0
  const tipBand = hovered ? entries[hovered.k][hovered.i].band : 0
  const tipCy = hovered ? yOf(tipBand) : 0
  const tipY = tipCy - 34

  const mockReady = SKILL_KEYS.every((k) => draft[k] !== '' && !isNaN(parseFloat(draft[k])))
  const singleReady = single !== '' && !isNaN(parseFloat(single))
  const logHint =
    logMode === 'mock'
      ? mockReady
        ? 'Ready — adds one point to each line.'
        : 'Enter all four band scores (0–9) to add a mock test.'
      : singleReady
        ? `Ready — adds one point to ${SKILL_META[singleSkill].name}.`
        : 'Pick a skill and enter its band (0–9).'

  const submit = () => {
    if (logMode === 'mock') {
      if (!mockReady) return
      logMock({
        l: parseFloat(draft.l),
        r: parseFloat(draft.r),
        w: parseFloat(draft.w),
        s: parseFloat(draft.s),
      })
      setDraft({ l: '', r: '', w: '', s: '' })
    } else {
      if (!singleReady) return
      const n = parseFloat(single)
      if (isNaN(n) || n < 0 || n > 9) return
      addSingle(singleSkill, n)
      setSingle('')
    }
  }

  const saveEdit = () => {
    if (!editing) return
    const n = parseFloat(editBand)
    if (isNaN(n) || n < 0 || n > 9) return
    updateEntry(editing.k, editing.i, n)
    setEditing(null)
    setEditBand('')
  }

  const removeEdited = () => {
    if (!editing) return
    deleteEntry(editing.k, editing.i)
    setEditing(null)
    setEditBand('')
  }

  const chartOptions = ['all', ...SKILL_KEYS].map((k) => ({
    key: k,
    name: CHART_META[k].name,
    color: CHART_META[k].color,
  }))
  const skillOptions = SKILL_KEYS.map((k) => ({
    key: k,
    name: SKILL_META[k].name,
    color: SKILL_META[k].color,
  }))

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div>
          <span className={styles.backLink} onClick={() => openChapter('ielts')}>
            ‹ IELTS chapter
          </span>
          <div className={`serif ${styles.title}`}>IELTS log</div>
          <div className={styles.subtitle}>Band scores across your mock tests.</div>
        </div>
        <div className={styles.overallPill}>
          <span className="eyebrow">Overall band</span>
          <span className={`serif ${styles.overallNum}`}>{overallBand}</span>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHead}>
          <div className={styles.chartHeadLeft}>
            <div className="eyebrow eyebrowWide">Progress by skill</div>
            <div className={`serif ${styles.chartTitle}`}>Band score over time</div>
          </div>
          <div className={styles.filterWrap}>
            <div className={styles.filterTrigger} onClick={() => setChartOpen((o) => !o)}>
              <span
                className={styles.swatch}
                style={{ background: CHART_META[chartSkill].color }}
              />
              <span className={styles.filterName}>{CHART_META[chartSkill].name}</span>
              <span className={styles.filterCaret}>▼</span>
            </div>
            {chartOpen && (
              <OptionMenu
                options={chartOptions}
                value={chartSkill}
                onSelect={(k) => {
                  setChartSkill(k as 'all' | SkillKey)
                  setChartOpen(false)
                }}
                onClose={() => setChartOpen(false)}
                direction="down"
              />
            )}
          </div>
        </div>
        <div className={styles.legend}>
          {plotKeys.map((k) => (
            <span key={k} className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: SKILL_META[k].color }} />
              {SKILL_META[k].name}
            </span>
          ))}
        </div>
        <svg viewBox="0 0 700 240" className={styles.chartSvg}>
          {GRID_YS.map((y, i) => (
            <g key={y}>
              <line x1="14" y1={y} x2="686" y2={y} stroke="var(--grid)" strokeWidth="1" />
              <text x="694" y={y + 4} textAnchor="end" className={styles.axisTick}>
                {GRID_BANDS[i]}
              </text>
            </g>
          ))}
          {SKILL_KEYS.map((k) => (
            <path
              key={k}
              d={lineFor(k)}
              fill="none"
              stroke={SKILL_META[k].color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {plotKeys.flatMap((k) =>
            entries[k].map((e, i) => {
              const isHov = hovered != null && hovered.k === k && hovered.i === i
              return (
                <g key={`${k}-${i}`}>
                  <circle
                    cx={xOf(i)}
                    cy={yOf(e.band)}
                    r={isHov ? 4.5 : 3}
                    fill={SKILL_META[k].color}
                  />
                  <circle
                    cx={xOf(i)}
                    cy={yOf(e.band)}
                    r="12"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setEditing({ k, i })
                      setEditBand(String(e.band))
                    }}
                    onMouseEnter={() => setHover({ k, i })}
                    onMouseLeave={() => setHover(null)}
                  />
                </g>
              )
            }),
          )}
          {hovered && (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tipCx - 23} y={tipY} width="46" height="24" rx="7" fill="var(--ink)" />
              <path
                d={`M${tipCx - 5} ${tipY + 24} L${tipCx + 5} ${tipY + 24} L${tipCx} ${tipY + 30} Z`}
                fill="var(--ink)"
              />
              <text x={tipCx} y={tipY + 16} textAnchor="middle" className={styles.tipText}>
                {tipBand.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
        <div className={styles.xLabels}>
          {Array.from({ length: axisN }, (_, i) => (
            <span key={i} className={styles.xLabel}>
              {i + 1}
            </span>
          ))}
        </div>
        {editing && (
          <div className={styles.editBar}>
            <span
              className={styles.swatch}
              style={{ background: CHART_META[editing.k].color }}
            />
            <span className={styles.editLabel}>
              {CHART_META[editing.k].name} · #{editing.i + 1}
            </span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="9"
              className={styles.editInput}
              value={editBand}
              onChange={(e) => setEditBand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') {
                  setEditing(null)
                  setEditBand('')
                }
              }}
            />
            <button className={styles.editSave} onClick={saveEdit}>
              Save
            </button>
            <button className={styles.editDelete} onClick={removeEdited}>
              Delete
            </button>
            <button
              className={styles.editCancel}
              onClick={() => {
                setEditing(null)
                setEditBand('')
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className={styles.logCard}>
        <div className={styles.logHead}>
          <div>
            <div className="eyebrow eyebrowWide">Log scores</div>
            <div className={`serif ${styles.logTitle}`}>
              {logMode === 'mock' ? 'Enter the bands you got' : 'Add a single band score'}
            </div>
          </div>
          <button className={styles.addBtn} onClick={submit}>
            {logMode === 'mock' ? '+ Add mock test' : '+ Add band'}
          </button>
        </div>

        <div className={styles.segWrap}>
          <Segmented options={MODE_OPTIONS} value={logMode} onChange={setLogMode} variant="log" />
        </div>

        {logMode === 'mock' ? (
          <div className={styles.mockGrid}>
            {SKILL_KEYS.map((k) => (
              <div key={k} className={styles.tile}>
                <div className={styles.tileHead}>
                  <span className={styles.tileDot} style={{ background: SKILL_META[k].color }} />
                  <span className={styles.tileLabel}>{SKILL_META[k].name}</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  placeholder="0.0"
                  className={styles.tileInput}
                  value={draft[k]}
                  onChange={(e) => setDraft((d) => ({ ...d, [k]: e.target.value }))}
                />
                <div className={styles.tileLast}>Last: {lastValOf(k)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.singleGrid}>
            <div className={`${styles.tile} ${styles.skillTile}`}>
              <div className={styles.tileLabel}>Skill</div>
              <div className={styles.skillTrigger} onClick={() => setSkillOpen((o) => !o)}>
                <span className={styles.skillName}>
                  <span
                    className={styles.swatch}
                    style={{ background: SKILL_META[singleSkill].color }}
                  />
                  {SKILL_META[singleSkill].name}
                </span>
                <span className={styles.skillCaret}>▼</span>
              </div>
              {skillOpen && (
                <OptionMenu
                  options={skillOptions}
                  value={singleSkill}
                  onSelect={(k) => {
                    setSingleSkill(k as SkillKey)
                    setSkillOpen(false)
                  }}
                  onClose={() => setSkillOpen(false)}
                  direction="up"
                />
              )}
            </div>
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Band</div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="9"
                placeholder="0.0"
                className={styles.tileInput}
                value={single}
                onChange={(e) => setSingle(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={styles.hint}>{logHint}</div>
      </div>
    </div>
  )
}
