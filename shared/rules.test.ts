import { describe, expect, it } from 'vitest'
import { awardBlock, canStartAward, monthOf } from './rules'

const base = { lapsed: false, exempt: false, requested: ['detour'], alreadyGiven: [], sessionThisMonth: false } as const

describe('awardBlock', () => {
  it('allows a fresh award', () => expect(awardBlock({ ...base, alreadyGiven: [] })).toBeNull())
  it('blocks lapsed', () => expect(awardBlock({ ...base, alreadyGiven: [], lapsed: true })).toBe('lapsed'))
  it('blocks 0 or 5 badges, unknown and duplicates', () => {
    expect(awardBlock({ ...base, alreadyGiven: [], requested: [] })).toBe('none-selected')
    expect(awardBlock({ ...base, alreadyGiven: [], requested: ['detour', 'sit', 'time', 'access', 'x'] })).toBe('none-selected')
    expect(awardBlock({ ...base, alreadyGiven: [], requested: ['nope'] })).toBe('none-selected')
    expect(awardBlock({ ...base, alreadyGiven: [], requested: ['sit', 'sit'] })).toBe('none-selected')
  })
  it('blocks a badge already given, and a second session in the month', () => {
    expect(awardBlock({ ...base, alreadyGiven: ['detour'] })).toBe('all-given')
    expect(awardBlock({ ...base, alreadyGiven: [], sessionThisMonth: true })).toBe('month')
  })
  it('exempt skips person limits only', () => {
    expect(awardBlock({ ...base, alreadyGiven: ['detour'], sessionThisMonth: true, exempt: true })).toBeNull()
    expect(awardBlock({ ...base, alreadyGiven: [], exempt: true, lapsed: true })).toBe('lapsed')
  })
})

describe('canStartAward / monthOf', () => {
  it('blocks when all four given', () => expect(canStartAward({ lapsed: false, exempt: false, alreadyGiven: ['detour', 'sit', 'time', 'access'], sessionThisMonth: false })).toBe('all-given'))
  it('uses Taipei time for the month', () => expect(monthOf(new Date('2026-10-31T17:00:00Z'))).toBe('2026-11'))
})
