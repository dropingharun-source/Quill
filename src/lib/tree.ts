/*
 * Geometry for the two state-driven trees, ported verbatim from the handoff:
 *  - the hero "book you're writing" tree (5 size stages, leaves fill with
 *    completion of today's lines)
 *  - the per-chapter mini tree (4 stages driven by milestone completion)
 */

export interface SpiralSpot {
  cx: number
  cy: number
  rot: number
}

/** Golden-angle spiral used to place leaves/dots inside a canopy ellipse. */
export function spiral(
  n: number,
  scx: number,
  scy: number,
  srx: number,
  sry: number,
  seed: number,
): SpiralSpot[] {
  const arr: SpiralSpot[] = []
  for (let j = 0; j < n; j++) {
    const a = j * 2.39996 + seed
    const rr = Math.sqrt((j + 0.7) / n)
    const x = scx + Math.cos(a) * rr * srx
    const y = scy + Math.sin(a) * rr * sry
    arr.push({
      cx: +x.toFixed(1),
      cy: +y.toFixed(1),
      rot: +((Math.atan2(y - scy, x - scx) * 180) / Math.PI + 90).toFixed(0),
    })
  }
  return arr
}

export interface Branch {
  d: string
  w: number
}

export interface HeroStageDef {
  groundRx: number
  leafRx: number
  leafRy: number
  blobs?: { cx: number; cy: number; rx: number; ry: number }[]
  branches: Branch[]
  grass?: string[]
  leafSpots: SpiralSpot[]
}

/** Five discrete tree sizes; the stage is picked by today's total line count. */
export const HERO_STAGES: HeroStageDef[] = [
  {
    groundRx: 36,
    leafRx: 6.5,
    leafRy: 10,
    branches: [
      { d: 'M120 202 C118 184 117 168 118 152', w: 4.5 },
      { d: 'M118 152 C112 140 106 130 100 122', w: 3 },
      { d: 'M118 152 C124 138 130 128 138 120', w: 3 },
    ],
    leafSpots: spiral(12, 119, 108, 33, 30, 0.9),
  },
  {
    groundRx: 40,
    leafRx: 6.5,
    leafRy: 10.5,
    branches: [
      { d: 'M120 202 C117 182 116 162 118 142', w: 6 },
      { d: 'M118 142 C108 130 98 122 88 114', w: 4 },
      { d: 'M118 142 C126 130 134 122 146 114', w: 4 },
      { d: 'M118 142 C119 130 120 120 120 110', w: 3 },
      { d: 'M104 126 C100 116 98 108 98 100', w: 2.5 },
      { d: 'M134 122 C138 112 140 104 142 96', w: 2.5 },
    ],
    leafSpots: spiral(14, 119, 104, 46, 26, 0.6),
  },
  {
    groundRx: 44,
    leafRx: 7,
    leafRy: 11,
    branches: [
      { d: 'M120 202 C116 180 116 155 119 132', w: 8 },
      { d: 'M119 132 C104 120 92 110 78 102', w: 5.5 },
      { d: 'M119 132 C132 120 144 112 158 102', w: 5.5 },
      { d: 'M119 132 C118 118 118 106 118 92', w: 4 },
      { d: 'M98 116 C94 104 92 94 94 84', w: 3 },
      { d: 'M140 114 C144 102 146 92 146 82', w: 3 },
      { d: 'M118 104 C112 96 106 90 102 82', w: 2.5 },
      { d: 'M118 100 C124 92 130 86 134 78', w: 2.5 },
    ],
    leafSpots: spiral(20, 118, 94, 62, 34, 1.2),
  },
  {
    groundRx: 48,
    leafRx: 7.5,
    leafRy: 11.5,
    blobs: [{ cx: 119, cy: 84, rx: 74, ry: 40 }],
    branches: [
      { d: 'M120 202 C115 178 116 148 119 122', w: 10.5 },
      { d: 'M119 122 C100 110 84 100 66 92', w: 6.5 },
      { d: 'M119 122 C138 110 154 102 172 92', w: 6.5 },
      { d: 'M119 122 C118 106 118 94 118 80', w: 5 },
      { d: 'M96 108 C90 96 88 86 90 74', w: 3.5 },
      { d: 'M82 100 C74 94 66 90 56 86', w: 3 },
      { d: 'M144 106 C150 94 152 84 150 72', w: 3.5 },
      { d: 'M158 100 C166 96 174 92 184 88', w: 3 },
      { d: 'M118 96 C110 86 104 78 100 68', w: 3.5 },
      { d: 'M118 92 C126 84 132 74 134 64', w: 3.5 },
    ],
    leafSpots: spiral(26, 119, 82, 76, 40, 2.1),
  },
  {
    groundRx: 56,
    leafRx: 7.5,
    leafRy: 11.5,
    blobs: [
      { cx: 119, cy: 74, rx: 90, ry: 46 },
      { cx: 64, cy: 92, rx: 30, ry: 18 },
      { cx: 176, cy: 92, rx: 30, ry: 18 },
    ],
    branches: [
      { d: 'M120 202 C114 176 115 140 119 112', w: 13 },
      { d: 'M120 200 C110 203 100 206 90 208', w: 4 },
      { d: 'M120 200 C130 203 140 206 150 208', w: 4 },
      { d: 'M119 112 C96 102 76 94 54 86', w: 7 },
      { d: 'M119 112 C142 102 162 94 186 86', w: 7 },
      { d: 'M119 112 C110 96 104 82 100 66', w: 5 },
      { d: 'M119 112 C128 96 134 82 138 64', w: 5 },
      { d: 'M88 98 C80 88 76 78 78 66', w: 3.5 },
      { d: 'M70 92 C60 88 52 84 42 82', w: 3 },
      { d: 'M150 98 C158 88 162 78 160 66', w: 3.5 },
      { d: 'M170 92 C180 88 190 86 198 82', w: 3 },
      { d: 'M104 84 C96 76 90 70 84 60', w: 3 },
      { d: 'M133 82 C142 74 148 66 152 56', w: 3 },
    ],
    grass: [
      'M92 206 Q94 197 99 193',
      'M104 206 Q104 198 108 194',
      'M136 206 Q136 197 132 193',
      'M148 206 Q146 198 141 194',
      'M78 207 Q81 200 86 197',
      'M162 207 Q159 200 154 197',
    ],
    leafSpots: spiral(32, 119, 72, 88, 44, 3.0),
  },
]

/** Stage (1–5) by number of lines written today. */
export function heroStageFor(totalLines: number): number {
  if (totalLines <= 6) return 1
  if (totalLines <= 8) return 2
  if (totalLines <= 10) return 3
  if (totalLines <= 12) return 4
  return 5
}

export interface ChapterStageDef {
  groundRx: number
  branches: Branch[]
  canopy: { cx: number; cy: number; r: number }[]
  dots: SpiralSpot[]
}

/** Four stages of the accent-coloured chapter tree. */
export const CHAPTER_STAGES: ChapterStageDef[] = [
  {
    groundRx: 22,
    branches: [{ d: 'M170 150 C169 143 169 137 170 130', w: 2.5 }],
    canopy: [{ cx: 170, cy: 121, r: 11 }],
    dots: spiral(4, 170, 119, 9, 7, 0.5),
  },
  {
    groundRx: 28,
    branches: [
      { d: 'M170 150 C168 138 168 126 170 114', w: 4 },
      { d: 'M170 122 C163 116 157 112 151 108', w: 2.5 },
      { d: 'M170 118 C177 112 183 108 189 104', w: 2.5 },
    ],
    canopy: [
      { cx: 170, cy: 103, r: 20 },
      { cx: 152, cy: 108, r: 12 },
      { cx: 188, cy: 104, r: 12 },
    ],
    dots: spiral(7, 170, 103, 24, 13, 1.3),
  },
  {
    groundRx: 34,
    branches: [
      { d: 'M170 150 C167 136 167 118 170 102', w: 5.5 },
      { d: 'M170 116 C160 108 150 102 140 98', w: 3 },
      { d: 'M170 112 C180 104 190 98 200 94', w: 3 },
      { d: 'M170 106 C169 98 169 92 170 84', w: 2.5 },
    ],
    canopy: [
      { cx: 170, cy: 88, r: 24 },
      { cx: 144, cy: 96, r: 15 },
      { cx: 198, cy: 92, r: 15 },
      { cx: 170, cy: 72, r: 13 },
    ],
    dots: spiral(10, 170, 88, 32, 19, 2.2),
  },
  {
    groundRx: 42,
    branches: [
      { d: 'M170 150 C166 134 166 112 170 92', w: 7 },
      { d: 'M170 148 C164 150 158 152 152 153', w: 2 },
      { d: 'M170 148 C176 150 182 152 188 153', w: 2 },
      { d: 'M170 110 C156 102 144 96 130 90', w: 3.5 },
      { d: 'M170 106 C184 98 196 92 210 88', w: 3.5 },
      { d: 'M170 100 C162 90 158 82 158 72', w: 2.5 },
      { d: 'M170 98 C178 88 182 80 184 70', w: 2.5 },
    ],
    canopy: [
      { cx: 170, cy: 78, r: 29 },
      { cx: 137, cy: 88, r: 19 },
      { cx: 203, cy: 86, r: 19 },
      { cx: 156, cy: 63, r: 15 },
      { cx: 186, cy: 62, r: 15 },
    ],
    dots: spiral(14, 170, 78, 42, 24, 3.1),
  },
]

/** Stage (1–4) for the chapter tree, from milestones done / total. */
export function chapterStageFor(doneCount: number, total: number): number {
  const ratio = Math.min(1, doneCount / (total || 1))
  if (doneCount <= 0) return 1
  if (ratio < 0.5) return 2
  if (ratio < 1) return 3
  return 4
}
