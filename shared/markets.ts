/** Market-level and district-level map positions. Approximate; there is no per-stall geocoding. */
export const MARKET_POS: Record<string, { lat: number, lng: number }> = {
  士林: { lat: 25.0879, lng: 121.5242 },
  景美: { lat: 24.9917, lng: 121.5409 },
  饒河街: { lat: 25.0509, lng: 121.5774 },
  延三: { lat: 25.0634, lng: 121.5124 },
  雙城: { lat: 25.0577, lng: 121.5226 },
  大龍: { lat: 25.0735, lng: 121.5156 },
  艋舺: { lat: 25.0372, lng: 121.4998 },
  臨江街: { lat: 25.0306, lng: 121.5535 },
  公館: { lat: 25.0142, lng: 121.534 },
  梧州街: { lat: 25.0405, lng: 121.5045 },
  廣州街: { lat: 25.0345, lng: 121.4975 },
  西昌街: { lat: 25.0318, lng: 121.5012 },
  示範夜市: { lat: 25.0478, lng: 121.5319 },
}

export const DISTRICT_POS: Record<string, { lat: number, lng: number }> = {
  大安區: { lat: 25.0267, lng: 121.5436 },
  士林區: { lat: 25.0928, lng: 121.5254 },
  中山區: { lat: 25.064, lng: 121.533 },
  信義區: { lat: 25.033, lng: 121.57 },
  北投區: { lat: 25.137, lng: 121.5 },
  松山區: { lat: 25.055, lng: 121.563 },
  內湖區: { lat: 25.083, lng: 121.593 },
  大同區: { lat: 25.063, lng: 121.513 },
  中正區: { lat: 25.032, lng: 121.519 },
  萬華區: { lat: 25.034, lng: 121.5 },
  南港區: { lat: 25.042, lng: 121.607 },
  文山區: { lat: 24.989, lng: 121.57 },
}

/** Vendors have no exact address: send the map app a text search instead. */
export function googleMapsQueryUrl(name: string, group: string, kind: 'stall' | 'restaurant' = 'stall') {
  const q = kind === 'stall' ? `${name} ${group}夜市 台北` : `${name} ${group} 台北`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}
