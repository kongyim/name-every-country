<template>
  <div class="main-page location-page" v-if="isReady">
    <h1 class="sr-only">{{selectedGame.label}}</h1>
    <header class="header-box">
      <div class="progress" role="status" aria-label="Correct answers">{{correctList.length}} / {{countries.length}}</div>
      <div class="header-actions">
        <button type="button" class="give-up" data-analytics-event="give_up_click" @click="onClickGiveUp" v-if="!isGiveUp && !isWin">Give up</button>
        <button type="button" class="try-again" data-analytics-event="try_again_click" @click="onClickTryAgain" v-else>Try again</button>
        <button type="button" class="back-button" data-analytics-event="back_click" @click="onClickBack">Back</button>
      </div>
      <div class="last-country" v-if="!isEmpty(lastCountries)">
        <div class="images-container">
          <img :key="`image-${idx}`" v-for="(lastCountry, idx) in lastCountries" :src="lastCountry.image" :alt="lastCountry.name + ' flag'" />
        </div>
        <span>{{get(first(lastCountries), field)}}</span>
      </div>
    </header>
    <div class="map-stage">
    <!-- map canvas -->
    <WorldMap v-if="useWorldMap" ref="worldMap" :countries="countries" :last-country="first(lastCountries)" @select="onClickCountryBox" @unavailable="onWorldMapUnavailable" />
    <div v-if="!useWorldMap" class="map-notice" role="status">Globe view is unavailable in this browser. You can still use the flat map.</div>
    <div v-show="!useWorldMap" class="map" key="map" ref="map" @click.capture="onMapClick" @pointerdown.capture="onMapPointerDown" @pointermove.capture="onMapPointerMove">
      <div class="map-content" ref="mapContent">
      <div class="map-background"/>
      <div class="box"
        v-for="item in countries"
        :class="{active: item.active, last: item === first(lastCountries)}"
        :key="`item-${item.iso2}`"
        :style="item.style"
        @click.stop="onClickCountryBox(item)"
        >
      </div>
      </div>
    </div>

    <!-- congratulations -->
    <template v-if="isWin">
      <div class="congratulations">
        Congratulations
      </div>
    </template>
    <template v-if="isGiveUp">
      <button type="button" class="missing-toggle" :aria-expanded="showMissingCountries" aria-controls="missing-countries" :data-analytics-event="showMissingCountries ? 'hide_missing_countries' : 'show_missing_countries'" @click="showMissingCountries = !showMissingCountries">
        {{showMissingCountries ? 'Hide' : 'Show'}} missing countries ({{missingCountries.length}})
      </button>
      <div id="missing-countries" class="missing-countries-canvas" v-show="showMissingCountries" aria-label="Missing countries">
        <button type="button" class="country-item" v-for="item in missingCountries" :key="`missing-${item.iso2}`" @click="onClickCountryBox(item)">
          <img class="flag" :src="item.image" alt="" loading="lazy" />
          <span class="label">{{get(item, field)}}</span>
        </button>
      </div>
    </template>
    </div>

    <!-- footer -->
    <form class="input-box" @submit.prevent="onEnter" v-if="!isGiveUp && !isWin">
      <label class="sr-only" for="location-answer">{{field === 'name' ? 'Country name' : 'Capital city name'}}</label>
      <input id="location-answer" ref="input" v-model="inputCountry" :placeholder="field === 'name' ? 'Enter a country…' : 'Enter a capital city…'" autocomplete="off" autocorrect="off" autocapitalize="none" :spellcheck="false" enterkeyhint="go" />
      <button type="submit">Check</button>
    </form>
  </div>
</template>

<script>
import _ from 'lodash'
import Panzoom from '@panzoom/panzoom'
import AudioManager from '@/services/AudioManager'
import BasePage from './BasePage.vue'


export default {
  mixins: [BasePage],
  components: { WorldMap: () => import('./WorldMap.vue') },
  props: [
    'countries',
    'selectedGame',
    'audioField',
    'field',
    'latitudeField',
    'longitudeField'
  ],
  data() {
    const mapWidth = 2520
    const mapHeight = 1260
    return {
      isEmpty: _.isEmpty,
      first: _.first,
      get: _.get,
      mapWidth,
      mapHeight,
      inputCountry: '',
      useWorldMap: true,
      showMissingCountries: true,
      // lastCountries: _.find(countries, {iso2: 'VC'})
      lastCountries: null,
      missingCountries: this.countries
    }
  },
  mounted() {
    _.each(this.countries, item => {
      item.active = false
      const longitude = _.get(item, this.longitudeField) ?? item.longitude
      const latitude = _.get(item, this.latitudeField) ?? item.latitude
      const x =  Math.floor((this.mapWidth/360.0) * (180 + longitude)) - 100
      const y =  Math.floor((this.mapHeight/180.0) * (90 - latitude)) - 0
      item.x = (x + this.mapWidth) % this.mapWidth
      item.y = y
      item.style = {
        left: `${item.x}px` ,
        top: `${item.y}px` ,
      }
    })
    this.$emit('update:countries', _.sortBy(this.countries, item => item.name))
    this.isReady = true
    this.$nextTick(() => {
      if (!navigator.maxTouchPoints && window.matchMedia('(hover: hover) and (pointer: fine)').matches) this.focusAnswer()
    })
  },
  beforeDestroy() {
    if (this.mapResizeObserver) this.mapResizeObserver.disconnect()
    if (this.panzoom) {
      this.$refs.map.removeEventListener('wheel', this.panzoom.zoomWithWheel)
      this.panzoom.destroy()
    }
  },
  methods : {
    onWorldMapUnavailable() {
      this.useWorldMap = false
      this.$nextTick(() => this.initializeFlatMap())
    },
    initializeFlatMap() {
      if (this.panzoom || !this.$refs.map) return
      this.panzoom = Panzoom(this.$refs.mapContent, {
        canvas: true,
        contain: 'outside',
        cursor: 'grab',
        minScale: 0.15,
        maxScale: 4,
        step: 0.15,
        startX: this.$refs.map.clientWidth / 2 - this.mapWidth / 2,
        startY: this.$refs.map.clientHeight / 2 - this.mapHeight / 3,
      })
      this.$refs.map.addEventListener('wheel', this.panzoom.zoomWithWheel, { passive: false })
      this.mapResizeObserver = new ResizeObserver(() => {
        // Reapply containment when the viewport changes size.
        this.panzoom.zoom(this.panzoom.getScale(), { animate: false })
      })
      this.mapResizeObserver.observe(this.$refs.map)
    },
    onEnter() {
      this.inputCountry = _.trim(this.inputCountry)
      if (_.isEmpty(this.inputCountry)) {
        return
      }
      const finds = _.filter(this.countries, item => this.trimName(_.get(item, this.field)) === this.trimName(this.inputCountry))
      if (!_.isEmpty(finds)) {
        _.each(finds, find => {
          if (!_.includes(this.correctList, find)) {
            find.active = true
            this.correctList.push(find)
          }
        })
        this.lastCountries = finds
        AudioManager.play(_.first(finds)[this.audioField])
        this.setMapCenter(_.first(finds))
        this.checkWin()
      } else {
        AudioManager.playError()
      }
      this.inputCountry = ''
      this.$nextTick(() => this.focusAnswer())
    },
    setMapCenter(item, isSmooth=true) {
      if (this.useWorldMap && this.$refs.worldMap) {
        this.$refs.worldMap.focus(item)
        return
      }
      if (!this.panzoom) return
      const scale = this.panzoom.getScale()
      // Panzoom scales HTML elements around their center; pan uses map coordinates.
      this.panzoom.pan(
        (this.$refs.map.clientWidth / 2 - this.mapWidth / 2) / scale + this.mapWidth / 2 - item.x,
        (this.$refs.map.clientHeight / 2 - this.mapHeight / 2) / scale + this.mapHeight / 2 - item.y,
        { animate: isSmooth }
      )
    },
    focusAnswer() {
      if (this.$refs.input) this.$refs.input.focus({ preventScroll: true })
    },
    onMapPointerDown(event) {
      this.mapPointerStart = { x: event.clientX, y: event.clientY }
      this.mapDragged = false
    },
    onMapPointerMove(event) {
      if (event.buttons && this.mapPointerStart && Math.hypot(
        event.clientX - this.mapPointerStart.x,
        event.clientY - this.mapPointerStart.y
      ) > 5) {
        this.mapDragged = true
      }
    },
    onMapClick(event) {
      if (this.mapDragged) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
    onClickCountryBox(item) {
      this.setMapCenter(item)
      if (this.isGiveUp) {
        this.lastCountries = [item]
        AudioManager.play(item[this.audioField])
      }
    },
    resetGame() {
      _.each(this.countries, item => _.set(item, 'active', false))
      this.correctList = []
      this.lastCountries = null
      this.isGiveUp = false
      this.isWin = false
      this.showMissingCountries = true
      AudioManager.stopAll()
    }
  }
}
</script>

<style lang="scss" scoped>
.location-page {
  position: fixed;
  top: var(--app-top, 0px);
  left: 0;
  width: 100%;
  height: var(--app-height, 100dvh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #e6f0f5;
  .header-box { flex: 0 0 auto; position: relative; }
}
.map-stage { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.map-notice { position: absolute; bottom: 16px; left: 12px; right: 12px; z-index: 1; width: fit-content; max-width: calc(100% - 24px); margin: auto; padding: 8px 16px; border-radius: 12px; background: #ffffffeb; font-size: 13px; text-align: center; }
.map {
  width: 100%; height: 100%; overflow: hidden; position: relative;
  .map-background { width: 2520px; height: 1260px; background-image: url('@/assets/map.svg'); background-position-x: -100px; }
  .map-content { position: relative; width: 2520px; height: 1260px; }
  &:active { cursor: grabbing !important; }
  .box { width: 11px; height: 11px; margin-left: -4px; margin-top: -4px; background: grey; position: absolute; border: 1px solid black; border-radius: 5px; opacity: .8; }
  .box.active { background: #00ff00; opacity: 1; }
  .box.last { background: yellow; }
}
.input-box { flex: 0 0 auto; display: flex; gap: 8px; padding: 8px max(12px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left)); background: white; border-top: 1px solid #dbe4ec; }
.input-box input { flex: 1; min-width: 0; width: 100%; font-size: 18px; padding: 10px 12px; border: 1px solid #94a3b8; border-radius: 8px; }
.input-box button { padding: 10px 16px; border: 0; border-radius: 8px; background: #18364d; color: white; }
.missing-toggle { position: absolute; z-index: 3; top: 12px; left: max(12px, env(safe-area-inset-left)); max-width: calc(100% - 24px); padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #18364d; }
.missing-countries-canvas { position: absolute; z-index: 2; top: 64px; left: max(12px, env(safe-area-inset-left)); width: min(360px, calc(100% - 24px)); max-height: calc(100% - 168px); overflow-y: auto; overscroll-behavior: contain; border-radius: 10px; padding: 8px; background: #fffffff2; box-shadow: 0 2px 12px #18364d26; }
.country-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px; margin-bottom: 4px; border: 0; border-radius: 6px; background: transparent; text-align: left; overflow-wrap: anywhere; }
.country-item:hover { background: #e6f0f5; }
.country-item .flag { width: 44px; height: 30px; object-fit: contain; flex-shrink: 0; }
.images-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
@media (max-width: 600px) { .missing-countries-canvas { max-height: min(40%, calc(100% - 160px)); } }
@media (max-height: 500px) { .header-box .last-country { flex-basis: auto; max-width: 35%; order: -1; font-size: 14px; } .header-box .last-country img { width: 32px; height: 24px; } }
</style>
