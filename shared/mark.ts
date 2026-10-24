import type { VenueKind } from './types'

/** Official programme behind the "Officially certified" mark. Never shows the gold/silver or 優/良 level. */
export const markName = (kind: VenueKind) => kind === 'stall' ? '食安微笑標章' : '衛生管理分級標章'
