import styles from './Segmented.module.css'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  /** 'range' = history-chart control (6×12/r8); 'log' = IELTS log (5×13/r7). */
  variant?: 'range' | 'log'
}

/** Inset pill toggle; the active segment lifts onto a card-white chip. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  variant = 'range',
}: SegmentedProps<T>) {
  return (
    <div className={styles.wrap} role="tablist">
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.seg} ${styles[variant]} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
