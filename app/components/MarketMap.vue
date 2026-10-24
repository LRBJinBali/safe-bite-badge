<script setup lang="ts">
import type { Map as MapboxMap, Marker } from 'mapbox-gl'
import type { GroupInfo } from '~~/shared/types'
import 'mapbox-gl/dist/mapbox-gl.css'

/**
 * Leaf pins for night markets or districts. Mapbox when a token is set,
 * otherwise a CSS fallback that projects the same lat/lng into a box
 * (so the demo never shows a blank map).
 */
const props = defineProps<{ groups: GroupInfo[], selected?: string }>()
const emit = defineEmits<{ select: [key: string] }>()

const config = useRuntimeConfig().public
const token = config.mapboxToken
const el = ref<HTMLElement>()
const failed = ref(false)
const useFallback = computed(() => !token || failed.value)
const isDev = import.meta.dev

let map: MapboxMap | undefined
let mapbox: typeof import('mapbox-gl').default | undefined
let markers: { key: string, marker: Marker, el: HTMLElement }[] = []
let styleReady = false

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** Re-colour the Mapbox style from the --sb-map-* tokens. Every call is guarded: unknown layers are skipped. */
function applyTheme(m: MapboxMap) {
  const land = cssVar('--sb-map-land')
  const water = cssVar('--sb-map-water')
  const park = cssVar('--sb-map-park')
  const road = cssVar('--sb-map-road')
  const label = cssVar('--sb-map-label')
  const layers = m.getStyle()?.layers ?? []
  const paint = (id: string, prop: 'background-color' | 'fill-color' | 'line-color' | 'text-color' | 'text-halo-color', value: string) => {
    if (!value)
      return
    try {
      m.setPaintProperty(id, prop, value)
    }
    catch { /* layer has no such property */ }
  }
  for (const l of layers) {
    const id = l.id
    try {
      if (l.type === 'background') {
        paint(id, 'background-color', land)
      }
      else if (l.type === 'fill') {
        if (/water/.test(id))
          paint(id, 'fill-color', water)
        else if (/park|green|grass|wood|forest|scrub|national|pitch|golf|landcover/.test(id))
          paint(id, 'fill-color', park)
      }
      else if (l.type === 'line') {
        if (/water/.test(id))
          paint(id, 'line-color', water)
        else if (/^(?:road|bridge|tunnel)/.test(id) && !/label|case|oneway|rail|path|pedestrian/.test(id))
          paint(id, 'line-color', road)
      }
      else if (l.type === 'symbol') {
        if (/poi|transit|airport|natural|ferry/.test(id)) {
          m.setLayoutProperty(id, 'visibility', 'none')
        }
        else if (/label/.test(id) && !/shield|number/.test(id)) {
          paint(id, 'text-color', label)
          paint(id, 'text-halo-color', land)
          m.setLayoutProperty(id, 'text-field', ['coalesce', ['get', 'name_zh-Hant'], ['get', 'name_zh'], ['get', 'name']])
        }
      }
    }
    catch { /* never crash the demo over a map layer */ }
  }
}

function pinEl(g: GroupInfo, active: boolean) {
  const b = document.createElement('button')
  b.type = 'button'
  b.className = 'sb-pin'
  b.dataset.active = String(active)
  b.setAttribute('aria-label', `${g.key},${g.count} 家`)
  b.innerHTML = '<span class="sb-pin-leaf"><span class="sb-pin-n"></span></span><span class="sb-pin-name"></span>'
  b.querySelector('.sb-pin-n')!.textContent = String(g.count)
  b.querySelector('.sb-pin-name')!.textContent = g.key
  b.addEventListener('click', (e) => {
    e.stopPropagation()
    emit('select', g.key)
  })
  return b
}

function drawMarkers(fit: boolean) {
  if (!map || !mapbox)
    return
  markers.forEach(m => m.marker.remove())
  markers = props.groups.map((g) => {
    const e = pinEl(g, g.key === props.selected)
    const marker = new mapbox!.Marker({ element: e, anchor: 'center' }).setLngLat([g.lng, g.lat]).addTo(map!)
    return { key: g.key, marker, el: e }
  })
  if (fit && props.groups.length) {
    const b = new mapbox.LngLatBounds()
    props.groups.forEach(g => b.extend([g.lng, g.lat]))
    map.fitBounds(b, { padding: { top: 50, bottom: 60, left: 50, right: 50 }, maxZoom: 13.5, duration: 0 })
  }
}

onMounted(async () => {
  if (!token || !el.value)
    return
  try {
    mapbox = (await import('mapbox-gl')).default
    mapbox.accessToken = token
    map = new mapbox.Map({
      container: el.value,
      style: config.mapboxStyle,
      center: [121.5254, 25.0478],
      zoom: 10.5,
      attributionControl: true,
      cooperativeGestures: true,
      locale: {
        'ScrollZoomBlocker.CtrlMessage': '按住 Ctrl 再滾動來縮放地圖',
        'ScrollZoomBlocker.CmdMessage': '按住 ⌘ 再滾動來縮放地圖',
        'TouchPanBlocker.Message': '用兩根手指移動地圖',
      },
    })
    map.addControl(new mapbox.NavigationControl({ showCompass: false }), 'top-right')
    map.on('style.load', () => {
      styleReady = true
      applyTheme(map!)
    })
    map.on('error', (e) => {
      // Bad token or unreachable style: fall back to the CSS map.
      if (!styleReady)
        failed.value = true
      if (import.meta.dev)
        console.warn('[MarketMap]', e.error?.message)
    })
    map.on('load', () => drawMarkers(true))
  }
  catch {
    failed.value = true
  }
})

onBeforeUnmount(() => {
  markers.forEach(m => m.marker.remove())
  map?.remove()
})

watch(() => props.groups, () => drawMarkers(true))
watch(() => props.selected, (sel) => {
  for (const m of markers) m.el.dataset.active = String(m.key === sel)
  const g = props.groups.find(x => x.key === sel)
  if (g && map)
    map.easeTo({ center: [g.lng, g.lat], duration: 500 })
})

// Fallback: project lat/lng into a unit box, then nudge overlapping pins apart (positions are approximate anyway).
const placed = computed(() => {
  const gs = props.groups
  if (!gs.length)
    return []
  const lats = gs.map(g => g.lat)
  const lngs = gs.map(g => g.lng)
  const minLat = Math.min(...lats)
  const minLng = Math.min(...lngs)
  const spanLat = Math.max(Math.max(...lats) - minLat, 0.04)
  const spanLng = Math.max(Math.max(...lngs) - minLng, 0.04)
  const pts = gs.map(g => ({
    ...g,
    x: ((g.lng - minLng) / spanLng) * 100,
    y: 100 - ((g.lat - minLat) / spanLat) * 100,
  }))
  // Separate in roughly-pixel space (a phone map is ~300 x 400 px) so leaves and names do not stack.
  const sx = 3
  const sy = 4
  const min = 80
  for (let n = 0; n < 120; n++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i]!
        const b = pts[j]!
        const dx = (b.x - a.x) * sx
        const dy = (b.y - a.y) * sy
        const d = Math.hypot(dx, dy) || 0.01
        if (d >= min)
          continue
        const push = (min - d) / 2
        const ux = dx === 0 && dy === 0 ? 1 : dx / d
        const uy = dx === 0 && dy === 0 ? 0 : dy / d
        a.x -= (ux * push) / sx
        a.y -= (uy * push) / sy
        b.x += (ux * push) / sx
        b.y += (uy * push) / sy
      }
    }
    for (const p of pts) {
      p.x = Math.min(100, Math.max(0, p.x))
      p.y = Math.min(100, Math.max(0, p.y))
    }
  }
  return pts
})
</script>

<template>
  <div class="space-y-2">
    <div class="sb-map relative h-[26rem] overflow-hidden rounded-[var(--sb-radius-card)] bg-[var(--sb-map-land)] sm:h-[30rem]">
      <div v-show="!useFallback" ref="el" class="absolute inset-0" />
      <div v-if="useFallback" class="absolute inset-0" role="group" aria-label="地圖">
        <svg class="absolute inset-0 size-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 215 C70 190 120 250 200 225 S330 170 400 190 L400 300 L0 300 Z" fill="var(--sb-map-water)" />
          <ellipse cx="85" cy="70" rx="75" ry="42" fill="var(--sb-map-park)" />
          <ellipse cx="330" cy="105" rx="58" ry="34" fill="var(--sb-map-park)" />
          <path d="M0 140 C90 120 180 160 260 130 S370 90 400 100" fill="none" stroke="var(--sb-map-road)" stroke-width="7" stroke-linecap="round" />
          <path d="M150 0 C170 80 140 160 175 300" fill="none" stroke="var(--sb-map-road)" stroke-width="6" stroke-linecap="round" />
          <path d="M280 0 C260 70 300 150 270 300" fill="none" stroke="var(--sb-map-road)" stroke-width="5" stroke-linecap="round" />
        </svg>
        <button
          v-for="g in placed"
          :key="g.key"
          type="button"
          class="sb-pin sb-pin-placed absolute -translate-x-1/2 -translate-y-1/2"
          :data-active="g.key === selected"
          :style="{ '--x': (g.x / 100).toFixed(4), '--y': (g.y / 100).toFixed(4), 'zIndex': g.key === selected ? 2 : 1 }"
          :aria-label="`${g.key},${g.count} 家`"
          @click="emit('select', g.key)"
        >
          <span class="sb-pin-leaf"><span class="sb-pin-n">{{ g.count }}</span></span>
          <span class="sb-pin-name">{{ g.key }}</span>
        </button>
      </div>
    </div>
    <p v-if="useFallback" class="text-base text-[var(--sb-ink-soft)]">
      葉子位置是示意,不是精確地圖。<span v-if="isDev && !token">地圖需要 Mapbox token</span>
    </p>
  </div>
</template>

<style>
.sb-pin {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.sb-pin-placed {
  left: calc(2rem + (100% - 4rem) * var(--x));
  top: calc(2rem + (100% - 6rem) * var(--y));
}

.sb-pin-leaf {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border: 2px solid #fff;
  border-radius: 50% 0 50% 0;
  background: var(--sb-map-pin);
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
  box-shadow: 0 3px 8px rgb(0 0 0 / 28%);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.sb-pin[data-active='true'] .sb-pin-leaf {
  background: var(--sb-map-pin-active);
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgb(255 255 255 / 85%), 0 4px 10px rgb(0 0 0 / 30%);
}

.sb-pin-name {
  position: absolute;
  top: calc(100% + 3px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--sb-ink);
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 4px #fff, 0 0 4px #fff;
  pointer-events: none;
}

.sb-pin[data-active='true'] .sb-pin-name {
  font-size: 1.05rem;
}

.sb-map .mapboxgl-ctrl-group button {
  width: 2.4rem;
  height: 2.4rem;
}
</style>
