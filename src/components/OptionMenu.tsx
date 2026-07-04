import { useEffect } from 'react'
import styles from './OptionMenu.module.css'

export interface ColorOption {
  key: string
  name: string
  color: string
}

interface OptionMenuProps {
  options: ColorOption[]
  value: string
  onSelect: (key: string) => void
  onClose: () => void
  /** 'down' anchors under the trigger (chart filter); 'up' opens above it. */
  direction: 'down' | 'up'
}

/**
 * Swatch dropdown used by the IELTS chart filter and the single-skill
 * picker. Rendered inside a `position: relative` trigger wrapper; an
 * invisible fixed backdrop closes it on outside click.
 */
export function OptionMenu({ options, value, onSelect, onClose, direction }: OptionMenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.menu} ${direction === 'down' ? styles.down : styles.up}`}>
        {options.map((o) => (
          <div
            key={o.key}
            className={`${styles.option} ${o.key === value ? styles.optionOn : ''}`}
            onClick={() => onSelect(o.key)}
          >
            <span className={styles.swatch} style={{ background: o.color }} />
            {o.name}
            <span className={styles.check}>{o.key === value ? '✓' : ''}</span>
          </div>
        ))}
      </div>
    </>
  )
}
