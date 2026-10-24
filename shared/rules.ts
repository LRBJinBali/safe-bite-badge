import type { BadgeKey } from './badges'
import { BADGE_KEYS } from './badges'
import type { AwardBlock } from './types'

export const MILESTONES = [1, 10, 25] as const
export const MAX_BADGES_PER_AWARD = 4

/** 'YYYY-MM' in Asia/Taipei */
export function monthOf(date: Date | number = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit' })
    .format(date)
    .slice(0, 7)
}

export interface AwardCheckInput {
  lapsed: boolean
  exempt: boolean
  requested: string[]
  alreadyGiven: BadgeKey[]
  sessionThisMonth: boolean
}

/** The only place the voting rules live. Returns null when the award is allowed. */
export function awardBlock(i: AwardCheckInput): AwardBlock | null {
  if (i.lapsed) return 'lapsed'
  if (!i.requested.length || i.requested.length > MAX_BADGES_PER_AWARD
    || i.requested.some(b => !BADGE_KEYS.includes(b as BadgeKey))
    || new Set(i.requested).size !== i.requested.length) return 'none-selected'
  if (i.exempt) return null
  if (i.requested.some(b => i.alreadyGiven.includes(b as BadgeKey))) return 'all-given'
  if (i.sessionThisMonth) return 'month'
  return null
}

/** Can this browser start a new award session at all? */
export function canStartAward(i: { lapsed: boolean, exempt: boolean, alreadyGiven: BadgeKey[], sessionThisMonth: boolean }): AwardBlock | null {
  if (i.lapsed) return 'lapsed'
  if (i.exempt) return null
  if (i.alreadyGiven.length >= BADGE_KEYS.length) return 'all-given'
  if (i.sessionThisMonth) return 'month'
  return null
}
