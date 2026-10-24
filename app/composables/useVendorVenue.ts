/** The active practice venue id, from ?venue=. The vendor-auth middleware makes sure it is there. */
export const useVendorVenueId = () => computed(() => String(useRoute().query.venue ?? ''))

/** Turns a failed vendor API call into a short zh-TW sentence. */
export function vendorError(e: unknown) {
  const err = e as { statusCode?: number, statusMessage?: string, data?: { statusMessage?: string } }
  const msg = err.data?.statusMessage ?? err.statusMessage ?? ''
  if (err.statusCode === 401)
    return '登入已過期,請重新登入'
  if (msg === 'venue-limit')
    return '最多只能建立 5 個練習攤位,請先用現有的'
  if (msg.includes('name has characters'))
    return '名稱只能用文字和數字,請不要放電話、信箱或地址'
  if (msg.includes('name must'))
    return '請輸入 1 到 20 個字的名稱'
  if (err.statusCode === 429)
    return '請稍等一下再試'
  return '這一步沒有成功,請再試一次'
}
