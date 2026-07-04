import { OWNER_NAME } from '../data/constants'
import { epochDay, greetingForHour } from '../lib/date'
import { momentumLabel, momentumScore } from '../lib/today'
import { useQuill } from '../store/QuillContext'
import { SlidePanels } from '../components/SlidePanels'
import { HistoryPanel } from '../components/today/HistoryPanel'
import { TodayLines } from '../components/today/TodayLines'
import { TreePanel } from '../components/today/TreePanel'
import { WeeklyGoals } from '../components/today/WeeklyGoals'
import styles from './Today.module.css'

const RING_C = 2 * Math.PI * 24

export function Today() {
  const { todos, days, heroPanel, setHeroPanel, todoPanel, setTodoPanel } = useQuill()

  const greeting = greetingForHour(new Date().getHours())
  const doneCount = todos.filter((t) => t.done).length
  const m = momentumScore(todos)
  const onLen = (RING_C * m) / 100

  // Streak: today counts if ≥1 line is done, then walk back while done > 0.
  const todayK = epochDay()
  let streak = doneCount > 0 ? 1 : 0
  for (let i = 1; i < 3700; i++) {
    const r = days[todayK - i]
    if (r && (r.done ?? 0) > 0) streak++
    else break
  }

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div>
          <div className={`serif ${styles.greeting}`}>
            {greeting}, {OWNER_NAME}
          </div>
          <div className={styles.subtitle}>
            Every line you write today fills a page in one of your chapters.
          </div>
        </div>
        <div className={styles.pills}>
          {streak > 0 && (
            <div className={styles.streakPill}>
              <div className="eyebrow">Days written</div>
              <div className={styles.streakRow}>
                <span className={`serif ${styles.streakNum}`}>{streak}</span>
                <span className={styles.streakUnit}>in a row</span>
              </div>
            </div>
          )}
          <div className={styles.momentumPill}>
            <svg viewBox="0 0 60 60" className={styles.ring}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="var(--ground)" strokeWidth="6" />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${onLen.toFixed(1)} ${(RING_C - onLen).toFixed(1)}`}
                transform="rotate(-90 30 30)"
              />
              <text x="30" y="36" textAnchor="middle" className={styles.ringText}>
                {m}
              </text>
            </svg>
            <div>
              <div className="eyebrow">Momentum</div>
              <div className={styles.momentumLabel}>{momentumLabel(m)}</div>
            </div>
          </div>
        </div>
      </div>

      <SlidePanels
        panel={heroPanel}
        onPanelChange={setHeroPanel}
        ariaLabel="Slide between book and progress"
        fixedHeight={336}
        panelA={<TreePanel />}
        panelB={<HistoryPanel />}
        panelAClassName={styles.heroPanelA}
        panelBClassName={styles.heroPanelB}
      />

      <SlidePanels
        panel={todoPanel}
        onPanelChange={setTodoPanel}
        ariaLabel="Slide between today and this week"
        panelA={<TodayLines />}
        panelB={<WeeklyGoals />}
        panelAClassName={styles.linesPanel}
        panelBClassName={`${styles.linesPanel} ${styles.weeklyPanel}`}
      />
    </div>
  )
}
