import { nowSec } from './db'

export type VisitStatus = 'received' | 'scheduled' | 'assessed'

/** SIMULATED: visit status is derived from age, no cron job. Seconds since the request was made. */
export const VISIT_STATUS_AFTER_SEC = { scheduled: 20, assessed: 45 } as const

export const VISIT_STATUS_ZH: Record<VisitStatus, string> = {
  received: '已收到',
  scheduled: '已排定訪視',
  assessed: '已完成訪視',
}

export function visitStatus(createdAt: number, now = nowSec()): VisitStatus {
  const age = now - createdAt
  if (age < VISIT_STATUS_AFTER_SEC.scheduled)
    return 'received'
  if (age < VISIT_STATUS_AFTER_SEC.assessed)
    return 'scheduled'
  return 'assessed'
}
