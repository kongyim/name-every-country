<template>
  <div class="main-page" v-if="isReady"  @click="onClickApplication">
    <!-- header -->
    <div class="header-box" :key="`correct-${correctList.length}`">
      <div class="progress">
        {{correctList.length}} / {{countries.length}}
      </div>
      <div class="last-country" v-if="!isEmpty(lastCountries)">
        <div class="images-container">
          <img :key="`image-${idx}`" v-for="(lastCountry, idx) in lastCountries" :src="lastCountry.image" />
        </div>
        <div>{{get(first(lastCountries), field)}}</div>
      </div>
      <div class="give-up" @click="onClickGiveUp" v-if="!isGiveUp && !isWin">
        Give up
      </div>
      <template v-else>
        <div class="try-again" @click="onClickTryAgain" >
          Try again
        </div>
        <div class="back-button" @click="onClickBack" >
          Back
        </div>
      </template>
    </div>
    <!-- map canvas -->
    <div class="map" key="map" ref="map" @click.capture="onMapClick" @pointerdown.capture="onMapPointerDown" @pointermove.capture="onMapPointerMove">
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
    <!-- missing countries canvas-->
    <template v-else>
      <div class="missing-countries-canvas" v-if="isGiveUp">
        <div
          class="country-item"
          v-for="item in missingCountries"
          :key="`missing-${item.iso2}`"
          @click="onClickCountryBox(item)"
        >
          <img class="flag" :src="item.image" />
          <span class="label">{{get(item, field)}}</span>
        </div>
      </div>
    </template>

    <!-- footer -->
    <div class="input-box">
      <input ref="input" v-model="inputCountry"  @keyup.enter="onEnter" :disabled="isGiveUp || isWin"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import Panzoom from '@panzoom/panzoom'
import AudioManager from '@/services/AudioManager'
import BasePage from './BasePage.vue'


export default {
  mixins: [BasePage],
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
      // lastCountries: _.find(countries, {iso2: 'VC'})
      lastCountries: null,
      missingCountries: this.countries
    }
  },
  mounted() {
    _.each(this.countries, item => {
      item.active = false
      const longitude = _.get(item, this.longitudeField) || item.longitude
      const latitude = _.get(item, this.latitudeField) || item.latitude
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
      this.$refs.input.focus()
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

      // // for debug
      // this.correctList = _.filter(this.countries, item => item.name !== 'USA')
      // _.each(this.correctList, item => item.active = true)
      // this.correctList = _.clone(this.correctList)
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
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    setMapCenter(item, isSmooth=true) {
      if (!this.panzoom) return
      const scale = this.panzoom.getScale()
      // Panzoom scales HTML elements around their center; pan uses map coordinates.
      this.panzoom.pan(
        (this.$refs.map.clientWidth / 2 - this.mapWidth / 2) / scale + this.mapWidth / 2 - item.x,
        (this.$refs.map.clientHeight / 2 - this.mapHeight / 2) / scale + this.mapHeight / 2 - item.y,
        { animate: isSmooth }
      )
    },
    onClickApplication() {
      setTimeout(() => {
        this.$refs.input.focus()
      })
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
      console.log(item.name, item)
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
      AudioManager.stopAll()
    }
  }
}
</script>

<style lang="scss" scoped>
.main-page {
  width: 100vw;
  height: 100vh;
  .map {
    width: 100vw;
    height: calc(100vh - 57px);
    .map-background {
      width: 2520px;
      height: 1260px;
      background-image: url('@/assets/map.svg');
      background-position-x: -100px;
    }
    .map-content {
      position: relative;
      width: 2520px;
      height: 1260px;
    }
    &:active {
      cursor: grabbing !important;
    }
    overflow: hidden;
    position: relative;
    .box {
      // display: none;
      width: 9px;
      height: 9px;
      margin-left: -4px;
      margin-top: -4px;
      background-color: grey;
      position: absolute;
      border: 1px black solid;
      border-radius: 5px;
      opacity: 0.8;
      &.active {
        background-color: #00FF00;
        opacity: 1.0;
      }
      &.last {
        background-color: yellow;
      }
    }
  }
  .input-box {
    position: fixed;
    left: 0px;
    bottom: 0px;
    width: 100%;
    input {
      font-size: 20px;
      width: calc(100% - 34px);
      padding: 15px;
      text-align: center;
    }
  }
  .missing-countries-canvas {
    background: rgba(255,255,255,0.8);
    position: fixed;
    left: 0px;
    top: 100px;
    height: calc(100vh - 240px);
    overflow: scroll;
    width: 400px;
    padding: 20px;

    .country-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      cursor: pointer;

      &:hover {
        background-color: yellow;
      }

      .flag {
        width: 60px;
        object-fit: contain;
        margin-right: 20px;
      }
    }
  }
  .images-container {
    display: flex;
    align-items: center;
    justify-content: center;

    >img {
      margin-left: 5px;

      &:first-child {
        margin-left: 0px;
      }
    }
  }
}

</style>
