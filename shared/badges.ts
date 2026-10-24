export type BadgeKey = 'detour' | 'sit' | 'time' | 'access'

export interface BadgeDef {
  key: BadgeKey
  zh: string
  en: string
  /** CSS variable holding the fill (see theme.css) */
  cssVar: string
  shape: 'diamond' | 'squircle' | 'circle' | 'arch'
  icon: string
  hint: string
}

export const BADGES: BadgeDef[] = [
  { key: 'detour', zh: '值得繞路', en: 'Worth the Detour', cssVar: '--sb-badge-detour', shape: 'diamond', icon: 'i-lucide-corner-up-right', hint: '我願意特地繞路來吃' },
  { key: 'sit', zh: '放心坐下', en: 'Sit Down Easy', cssVar: '--sb-badge-sit', shape: 'squircle', icon: 'i-lucide-armchair', hint: '如果有位子可以坐' },
  { key: 'time', zh: '慢慢吃', en: 'Take Your Time', cssVar: '--sb-badge-time', shape: 'circle', icon: 'i-lucide-soup', hint: '步調悠閒,不趕時間' },
  { key: 'access', zh: '進得來', en: 'Easy to Get In', cssVar: '--sb-badge-access', shape: 'arch', icon: 'i-lucide-accessibility', hint: '無障礙進出、空間夠、廁所能用' },
]

export const BADGE_KEYS = BADGES.map(b => b.key) as BadgeKey[]

export const badgeByKey = (key: string) => BADGES.find(b => b.key === key)
