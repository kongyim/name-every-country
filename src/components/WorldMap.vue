<template>
  <div class="world-map">
    <div ref="surface" class="surface" aria-label="Interactive world map" @map-error="onUnavailable" />
    <div class="view-controls" @click.stop>
      <div class="view-toggle" role="group" aria-label="Map view">
        <button type="button" :aria-pressed="mode === 'globe'" :disabled="transitioning" @click="setMode('globe')">Globe</button>
        <button type="button" :aria-pressed="mode === 'map'" :disabled="transitioning" @click="setMode('map')">Flat map</button>
      </div>
      <span class="hint" aria-live="polite">{{ transitioning ? (mode === 'map' ? 'Unfolding the globe…' : 'Wrapping the globe…') : (mode === 'globe' ? 'North stays up · Drag to rotate · Scroll to zoom' : 'Drag to explore · Wraps left and right · Scroll to zoom') }}</span>
    </div>
  </div>
</template>

<script>
import WorldSurface from '@/map/WorldSurface'

export default {
  props: ['countries', 'lastCountry'],
  data: () => ({ mode: 'map', transitioning: false }),
  mounted() {
    try {
      this.world = new WorldSurface(this.$refs.surface, country => this.$emit('select', country))
      this.updateCountries()
    } catch (error) {
      this.onUnavailable()
    }
  },
  beforeDestroy() {
    if (this.world) this.world.dispose()
  },
  watch: {
    countries: { deep: true, handler: 'updateCountries' },
    lastCountry: 'updateCountries'
  },
  methods: {
    onUnavailable() { this.$emit('unavailable') },
    updateCountries() {
      if (this.world) this.world.setCountries(this.countries, this.lastCountry)
    },
    setMode(mode) {
      if (this.transitioning || mode === this.mode) return
      this.mode = mode
      this.transitioning = true
      this.world.setMode(mode, () => { this.transitioning = false })
    },
    focus(country) { if (this.world) this.world.focus(country) }
  }
}
</script>

<style scoped>
.world-map { position: relative; width: 100%; height: 100%; }
.surface { width: 100%; height: 100%; cursor: grab; }
.surface:active { cursor: grabbing; }
.view-controls { position: absolute; bottom: max(12px, env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); text-align: center; width: max-content; max-width: calc(100% - 24px); }
.view-toggle { display: inline-flex; padding: 4px; gap: 4px; border-radius: 28px; background: #fff; box-shadow: 0 2px 16px #18364d26; }
button { border: 0; border-radius: 24px; padding: 10px 20px; background: transparent; color: #334155; font: inherit; cursor: pointer; white-space: nowrap; }
button[aria-pressed="true"] { background: #18364d; color: white; }
button:focus-visible { outline: 3px solid #38a3e2; outline-offset: 2px; }
button:disabled { cursor: wait; }
.hint { display: block; margin-top: 8px; font-size: 12px; color: #334155; background: #ffffffd9; border-radius: 12px; padding: 4px 10px; line-height: 1.4; }
@media (pointer: coarse) { .hint { display: none; } }
@media (max-height: 500px) { .hint { display: none; } .view-controls { bottom: 8px; } }
</style>
