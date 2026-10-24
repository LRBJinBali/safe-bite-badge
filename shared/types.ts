import type { BadgeKey } from './badges'

export type VenueKind = 'stall' | 'restaurant'

/** What the client sees. Never carries gold/silver or 優/良. */
export interface Venue {
  id: string
  kind: VenueKind
  name: string
  /** Market (stalls) or district (restaurants) */
  group: string
  groupEn?: string
  seq: number
  /** ROC list years the stall was certified, ascending. Empty for restaurants. */
  years: number[]
  /** Label ended (hand-picked demo stalls only) */
  lapsed: boolean
  /** Made-up venue (demo mode only) */
  simulated: boolean
}

export interface VenueListItem extends Venue {
  /** Badges with at least one award (never zero counts) */
  badges: BadgeKey[]
}

export interface GroupInfo {
  key: string
  en?: string
  kind: VenueKind
  lat: number
  lng: number
  count: number
}

export type BadgeCounts = Partial<Record<BadgeKey, number>>

export interface VenueDetail extends Venue {
  counts: BadgeCounts
  /** Some counts include seed votes */
  simulatedVotes: boolean
}

export type AwardBlock = 'lapsed' | 'all-given' | 'month' | 'none-selected'

export interface MeResponse {
  given: BadgeKey[]
  canAward: boolean
  /** Why not, when canAward is false */
  reason?: AwardBlock
  /** Demo stall: limits are skipped */
  exempt: boolean
}

export type FeedKind = 'new' | 'streak' | 'milestone'
export type ReactionKind = 'congrats' | 'want' | 'been'

export interface FeedItem {
  id: string
  kind: FeedKind
  venueId?: string
  venueName?: string
  group?: string
  text: string
  simulated: boolean
  reactions: Partial<Record<ReactionKind, number>>
  mine: ReactionKind[]
}

export type Role = 'vendor' | 'city'
