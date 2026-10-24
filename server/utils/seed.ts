import type { BadgeKey } from '../../shared/badges'
import type { ReactionKind } from '../../shared/types'
import { BADGE_KEYS } from '../../shared/badges'
import { MILESTONES, monthOf } from '../../shared/rules'
import { nowSec } from './db'
import { listVenues } from './venues'

/**
 * Simulated seed votes. Every row is marked simulated = 1 and uses a browser id
 * that starts with `seed-`, so it can be told apart from real awards and wiped.
 * Fixed PRNG seed: the same data every time, on every database.
 */
export const SEED_PREFIX = 'seed-'
const PRNG_SEED = 20261024
const DAYS = 60
const STALL_SHARE = 0.35
const RESTAURANT_SHARE = 0.4
const HOT_RESTAURANTS = 10
const WARM_RESTAURANTS = 40
const HOT_STALLS = 7
const WARM_STALLS = 25

/**
 * No seating data exists, so 'sit' (Sit Down Easy) is guessed from the stall name:
 * only names that sound like sit-down food may get it, and never ones that sound
 * like grab-and-go. Restaurants always have seats, so they may always get it.
 */
const SIT_YES = /[麵飯湯粥鍋羹滷餐]|水餃|小吃/
const SIT_NO = /[炸烤飲冰茶串餅糕球甜]|果汁|雞排/
export const mayHaveSeating = (name: string) => SIT_YES.test(name) && !SIT_NO.test(name)

/** Small, fast, deterministic PRNG. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Row { stall: string, browser: string, badge: BadgeKey, month: string, at: number }

const pad = (n: number, w = 4) => String(n).padStart(w, '0')

/** INSERT OR IGNORE of many rows with few statements (D1: 100 bound parameters, 50 statements per batch). */
async function insertAwards(db: D1Database, rows: Row[]) {
  const perStmt = 19 // 5 bound values per row, 95 of 100 parameters
  const stmts: D1PreparedStatement[] = []
  for (let i = 0; i < rows.length; i += perStmt) {
    const chunk = rows.slice(i, i + perStmt)
    const sql = `INSERT OR IGNORE INTO awards (stall_id, browser_id, badge, month, simulated, created_at) VALUES ${chunk.map(() => '(?, ?, ?, ?, 1, ?)').join(', ')}`
    stmts.push(db.prepare(sql).bind(...chunk.flatMap(r => [r.stall, r.browser, r.badge, r.month, r.at])))
  }
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50))
}

async function insertReactions(db: D1Database, rows: { item: string, browser: string, kind: ReactionKind }[]) {
  const perStmt = 33 // 3 bound values per row
  const stmts: D1PreparedStatement[] = []
  for (let i = 0; i < rows.length; i += perStmt) {
    const chunk = rows.slice(i, i + perStmt)
    const sql = `INSERT OR IGNORE INTO reactions (item_id, browser_id, kind, simulated) VALUES ${chunk.map(() => '(?, ?, ?, 1)').join(', ')}`
    stmts.push(db.prepare(sql).bind(...chunk.flatMap(r => [r.item, r.browser, r.kind])))
  }
  for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50))
}

/** Small starting numbers for the made-up demo stalls, so the first on-stage award visibly moves them. */
export async function applyDemoSeed(db: D1Database) {
  const now = nowSec()
  const at = (daysAgo: number) => now - daysAgo * 86400
  const row = (stall: string, n: number, badge: BadgeKey, daysAgo: number): Row =>
    ({ stall, browser: `${SEED_PREFIX}demo-${stall}-${n}`, badge, month: monthOf(at(daysAgo) * 1000), at: at(daysAgo) })
  const rows: Row[] = [
    // DEMO-001: 3 people on 2 badges
    row('DEMO-001', 1, 'detour', 3),
    row('DEMO-001', 2, 'detour', 2),
    row('DEMO-001', 3, 'detour', 1),
    row('DEMO-001', 1, 'time', 3),
    row('DEMO-001', 2, 'time', 2),
    row('DEMO-001', 3, 'time', 1),
    row('DEMO-002', 1, 'sit', 2),
    row('DEMO-002', 2, 'sit', 1),
    row('DEMO-002', 1, 'access', 2),
    // DEMO-R-001: a made-up restaurant, so the demo shows it is not only night markets
    row('DEMO-R-001', 1, 'sit', 4),
    row('DEMO-R-001', 2, 'sit', 3),
    row('DEMO-R-001', 3, 'sit', 1),
    row('DEMO-R-001', 1, 'time', 4),
    row('DEMO-R-001', 2, 'time', 2),
    row('DEMO-R-001', 1, 'access', 3),
  ]
  await insertAwards(db, rows)
}

/** Writes the simulated votes. Returns what it wrote. */
export async function runSeed(db: D1Database) {
  const rand = mulberry32(PRNG_SEED)
  const pick = <T>(list: T[]) => list[Math.floor(rand() * list.length)]!
  const shuffle = <T>(list: T[]) => {
    const a = [...list]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!]
    }
    return a
  }

  const now = nowSec()
  const stalls = listVenues({ kind: 'stall', demo: false })
  const restaurants = listVenues({ kind: 'restaurant', demo: false })
  const chosenStalls = shuffle(stalls).slice(0, Math.round(stalls.length * STALL_SHARE))
  const chosenRestaurants = shuffle(restaurants).slice(0, Math.round(restaurants.length * RESTAURANT_SHARE))

  // Popularity is skewed on purpose: a few hot stalls reach the milestones, most have a handful of fans.
  const plan = [...chosenStalls, ...chosenRestaurants].map((v, n) => {
    const isStall = v.kind === 'stall'
    const i = isStall ? n : n - chosenStalls.length
    const hot = i < (isStall ? HOT_STALLS : HOT_RESTAURANTS)
    const warm = !hot && i < (isStall ? HOT_STALLS + WARM_STALLS : HOT_RESTAURANTS + WARM_RESTAURANTS)
    const people = hot && i < 2 ? 32 + Math.floor(rand() * 5) : hot ? 18 + Math.floor(rand() * 15) : warm ? 4 + Math.floor(rand() * 6) : 1 + Math.floor(rand() * 3)
    const canSit = isStall ? mayHaveSeating(v.name) : true
    const weights = Object.fromEntries(BADGE_KEYS.map(b => [b, 0.2 + rand() * 0.4 + (hot && rand() < 0.5 ? 0.3 : 0)])) as Record<BadgeKey, number>
    if (!canSit)
      weights.sit = 0
    return { v, people, weights }
  })

  const rows: Row[] = []
  const counts = new Map<string, Partial<Record<BadgeKey, number>>>()
  let person = 0
  for (const { v, people, weights } of plan) {
    for (let p = 0; p < people; p++) {
      person++
      // Skewed towards recent days so this month looks lively.
      const daysAgo = DAYS * rand() ** 1.4
      const at = now - Math.floor(daysAgo * 86400) - Math.floor(rand() * 3600)
      const month = monthOf(at * 1000)
      let badges = BADGE_KEYS.filter(b => rand() < weights[b])
      if (!badges.length) {
        const options = BADGE_KEYS.filter(b => weights[b] > 0)
        badges = [pick(options)]
      }
      for (const badge of badges) {
        rows.push({ stall: v.id, browser: `${SEED_PREFIX}${pad(person)}`, badge, month, at })
        const c = counts.get(v.id) ?? {}
        c[badge] = (c[badge] ?? 0) + 1
        counts.set(v.id, c)
      }
    }
  }
  await insertAwards(db, rows)
  await applyDemoSeed(db)

  // A few simulated reactions on feed items that exist (milestones the seed reached).
  const targets: string[] = []
  for (const { v } of plan) {
    const c = counts.get(v.id) ?? {}
    for (const b of BADGE_KEYS) {
      const reached = [...MILESTONES].reverse().find(t => (c[b] ?? 0) >= t)
      if (reached && reached > 1)
        targets.push(`milestone:${v.id}:${b}:${reached}`)
    }
  }
  const reactionRows: { item: string, browser: string, kind: ReactionKind }[] = []
  const kinds: ReactionKind[] = ['congrats', 'congrats', 'congrats', 'want', 'want', 'been']
  for (const item of shuffle(targets).slice(0, 30)) {
    const n = 2 + Math.floor(rand() * 8)
    for (let r = 0; r < n; r++) reactionRows.push({ item, browser: `${SEED_PREFIX}r-${pad(r + 1, 3)}`, kind: pick(kinds) })
  }
  await insertReactions(db, reactionRows)

  return { awards: rows.length, stalls: counts.size, reactions: reactionRows.length }
}

/** What is in the database right now (simulated seed rows only). */
export async function seedCounts(db: D1Database) {
  const a = await db.prepare('SELECT COUNT(*) AS awards, COUNT(DISTINCT stall_id) AS stalls FROM awards WHERE browser_id LIKE ?').bind(`${SEED_PREFIX}%`).first<{ awards: number, stalls: number }>()
  const r = await db.prepare('SELECT COUNT(*) AS n FROM reactions WHERE browser_id LIKE ?').bind(`${SEED_PREFIX}%`).first<{ n: number }>()
  return { awards: a?.awards ?? 0, stalls: a?.stalls ?? 0, reactions: r?.n ?? 0 }
}

export async function wipeSeed(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM awards WHERE browser_id LIKE ?').bind(`${SEED_PREFIX}%`),
    db.prepare('DELETE FROM reactions WHERE browser_id LIKE ?').bind(`${SEED_PREFIX}%`),
  ])
}

/** True once the main seed (not just the demo stall rows) is in. */
export async function hasSeed(db: D1Database) {
  const r = await db.prepare('SELECT 1 AS x FROM awards WHERE browser_id LIKE ? AND browser_id NOT LIKE ? LIMIT 1').bind(`${SEED_PREFIX}%`, `${SEED_PREFIX}demo-%`).first()
  return !!r
}
