import type { BadgeCounts, FeedItem, VenueDetail } from './types'

/**
 * Vendor readiness content. Wording follows the 114 coaching and assessment form
 * (Data/004-assessment-form-114.pdf): 10 inspection items and 6 guidance items.
 * Nothing here is assessed online; the app only helps a vendor get ready.
 */

export type ReadinessGroup = 'inspection' | 'guidance'

export interface ReadinessItem {
  key: string
  group: ReadinessGroup
  /** Form item number inside its group (檢查項目 1-10, 輔導項目 1-6) */
  no: number
  /** Short title, 14 Chinese characters or fewer */
  title: string
  hint: string
}

export const READINESS_ITEMS: ReadinessItem[] = [
  { key: 'i01-clothes', group: 'inspection', no: 1, title: '穿戴整潔工作衣帽和口罩', hint: '工作衣帽(鞋)乾淨整潔,並戴口罩。' },
  { key: 'i02-hands', group: 'inspection', no: 2, title: '保持手部清潔', hint: '不留指甲、不戴飾物,工作中不吸菸、不嚼檳榔。' },
  { key: 'i03-gloves', group: 'inspection', no: 3, title: '戴手套或洗淨消毒雙手', hint: '調理即食食品前要做到;販售時盡量用夾子或其他器具取用。' },
  { key: 'i04-clean', group: 'inspection', no: 4, title: '攤位和台面乾淨整潔', hint: '內外四周整潔,營業台面乾淨,不飼養牲畜。' },
  { key: 'i05-separate', group: 'inspection', no: 5, title: '生熟食用具分開', hint: '砧板、刀具、容器分開;抹布常洗,無髒污異味並消毒。' },
  { key: 'i06-water', group: 'inspection', no: 6, title: '備足流動自來水', hint: '沒有水管可備至少 2 個水桶;洗食材和洗食器分開用桶,髒了就換水。' },
  { key: 'i07-floor', group: 'inspection', no: 7, title: '食材和容器不放地上', hint: '原材料、半成品、成品和盛裝容器具,都不直接放在地面。' },
  { key: 'i08-cold', group: 'inspection', no: 8, title: '冷藏冷凍有保冷措施', hint: '備有冷藏(凍)櫃或箱,例如用冰磚、冰塊保冷。' },
  { key: 'i09-covered', group: 'inspection', no: 9, title: '菜餚加蓋、垃圾妥善處理', hint: '依溫度分類貯存,有防塵防蟲設施(如防塵蓋、櫃);垃圾桶和廚餘妥善處理。' },
  { key: 'i10-platforms', group: 'inspection', no: 10, title: '完成兩個登錄平台', hint: '食品業者登錄平台和臺北市食材登錄平台都要完成。下一步有教學。' },
  { key: 'g01-meat', group: 'guidance', no: 1, title: '確認有無使用豬牛肉', hint: '先確認現場有沒有使用豬肉或牛肉的可食部位原料。' },
  { key: 'g02-origin', group: 'guidance', no: 2, title: '豬牛肉標示原產地', hint: '有使用豬肉或牛肉才需要標示原產地(國);沒用到請直接勾選。' },
  { key: 'g03-source', group: 'guidance', no: 3, title: '備好食材來源文件', hint: '準備好食材來源文件,輔導人員會請你拿出來檢視。' },
  { key: 'g04-shoes', group: 'guidance', no: 4, title: '穿包頭鞋', hint: '攤上工作人員穿著包頭鞋。' },
  { key: 'g05-health', group: 'guidance', no: 5, title: '有從業人員體檢報告', hint: '攤上人員備有食品從業人員體檢報告。' },
  { key: 'g06-pest', group: 'guidance', no: 6, title: '環境用藥有明顯標記', hint: '環境用藥有明顯標記和存放區域,避免誤用。' },
]

export const READINESS_KEYS = READINESS_ITEMS.map(i => i.key)
export const READINESS_TOTAL = READINESS_ITEMS.length
export const READINESS_GROUPS: { key: ReadinessGroup, title: string, blurb: string }[] = [
  { key: 'inspection', title: '10 項現場檢查', blurb: '輔導人員到攤位會逐項看。' },
  { key: 'guidance', title: '6 項輔導提醒', blurb: '輔導人員會提醒和協助,一起準備好。' },
]

export interface RegistrationStep {
  key: string
  platform: 'food' | 'ingredient'
  no: number
  title: string
  hint: string
  /** Real government site to open for this step */
  href?: string
  linkLabel?: string
}

export const REGISTRATION_PLATFORMS: { key: 'food' | 'ingredient', title: string, blurb: string }[] = [
  { key: 'food', title: '食品業者登錄', blurb: '全國食品業者都要在食藥署的平台登錄。登錄完成會拿到登錄字號。' },
  { key: 'ingredient', title: '臺北市食材登錄', blurb: '把攤位用的食材來源登錄到臺北市的平台。' },
]

/** Only links we have checked are listed. The ingredient platform is reached from the Health Department site. */
export const REGISTRATION_STEPS: RegistrationStep[] = [
  { key: 'food-1-open', platform: 'food', no: 1, title: '打開食品業者登錄平台', hint: '用手機或電腦打開下面的官方網站。', href: 'https://fadenbook.fda.gov.tw/', linkLabel: '前往食品業者登錄平台' },
  { key: 'food-2-fill', platform: 'food', no: 2, title: '填寫攤位和負責人資料', hint: '照平台的步驟填寫,資料只填在官方平台,不用填在這裡。' },
  { key: 'food-3-number', platform: 'food', no: 3, title: '完成登錄並記下登錄字號', hint: '登錄字號是輔導時會問到的資料,記在自己的手機裡。' },
  { key: 'ing-1-open', platform: 'ingredient', no: 1, title: '到衛生局網站找食材登錄平台', hint: '臺北市政府衛生局網站有「食材登錄平台」的入口。', href: 'https://health.gov.taipei/', linkLabel: '前往臺北市政府衛生局' },
  { key: 'ing-2-fill', platform: 'ingredient', no: 2, title: '登錄攤位使用的食材與來源', hint: '和「備好食材來源文件」那一項互相對照,資料才一致。' },
  { key: 'ing-3-done', platform: 'ingredient', no: 3, title: '確認登錄完成', hint: '平台顯示完成後,回到這裡勾選。' },
]

export const REGISTRATION_KEYS = REGISTRATION_STEPS.map(s => s.key)
export const REGISTRATION_TOTAL = REGISTRATION_STEPS.length

/** The four steps shown in the step bar. */
export const VENDOR_STEPS = [
  { no: 1, title: '檢查', path: '/vendor/check', icon: 'i-lucide-list-checks' },
  { no: 2, title: '登記', path: '/vendor/register', icon: 'i-lucide-file-pen-line' },
  { no: 3, title: '預約訪視', path: '/vendor/visit', icon: 'i-lucide-calendar-check' },
  { no: 4, title: '預覽', path: '/vendor/preview', icon: 'i-lucide-eye' },
] as const

export const VENUE_NAME_MAX = 20
/** Made-up practice venues per sign-in. */
export const MAX_VENUES_PER_ACCOUNT = 5
/** Markets a made-up venue can say it is in (a pick list, never free text). */
export const VENUE_MARKETS = ['士林', '景美', '饒河街', '延三', '雙城', '大龍', '艋舺', '臨江街', '公館', '梧州街', '廣州街', '西昌街'] as const

// --- API shapes (shared by server/api/vendor and the vendor pages) ---

export interface VendorVenue {
  id: string
  name: string
  market: string
  /** Always true: vendor venues are made up */
  simulated: true
  readinessDone: number
  registrationDone: number
  latestVisitRef?: string
}

export interface ProgressResponse {
  venue: Pick<VendorVenue, 'id' | 'name' | 'market'>
  done: string[]
  total: number
  /** All items done */
  complete: boolean
}

export interface VisitRequestStatus {
  ref: string
  venue: Pick<VendorVenue, 'id' | 'name' | 'market'>
  createdAt: number
  status: 'received' | 'scheduled' | 'assessed'
  simulated: true
}

/** Read-only vendor view of a real (or demo) stall: GET /api/vendor/stalls/:id */
export interface VendorStallView {
  venue: VenueDetail
  /** Badges newly given this month (people per badge, only badges above zero) */
  monthCounts: BadgeCounts
  monthTotal: number
  sharePath: string
  feed: FeedItem[]
}
