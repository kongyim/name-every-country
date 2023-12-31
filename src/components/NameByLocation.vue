<template>
  <div class="main-page" v-if="isReady"  @click="onClickApplication">
    <!-- header -->
    <div class="header-box" :key="`correct-${correctList.length}`">
      <div class="progress">
        {{correctList.length}} / {{countries.length}}
      </div>
      <div class="last-country" v-if="lastCountry">
        <img :src="lastCountry.image" />
        <div>{{lastCountry.country}}</div>
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
    <div class="map" key="map" ref="map" @click="onClickMap">
      <div class="map-background"/>
      <div class="box"
        v-for="item in countries"
        :class="{active: item.active, last: item === lastCountry}"
        :key="`item-${item.alpha2}`"
        :style="item.style"
        @click="onClickCountryBox(item)"
        >
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
          :key="`missing-${item.alpha2}`"
          @click="onClickCountryBox(item)"
        >
          <img class="flag" :src="item.image" />
          <span class="label">{{item.country}}</span>
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
import AudioManager from '@/services/AudioManager'
import BasePage from './BasePage.vue'


export default {
  mixins: [BasePage],
  props: [
    'countries',
    'selectedGame'
  ],
  data() {
    const mapWidth = 2520
    const mapHeight = 1260
    return {
      mapWidth,
      mapHeight,
      inputCountry: '',
      // lastCountry: _.find(countries, {alpha2: 'VC'})
      missingCountries: this.countries
    }
  },
  mounted() {
    _.each(this.countries, item => {
      const x =  Math.floor((this.mapWidth/360.0) * (180 + item.longitude)) - 100
      const y =  Math.floor((this.mapHeight/180.0) * (90 - item.latitude)) - 0
      item.x = (x + this.mapWidth) % this.mapWidth
      item.y = y
      item.style = {
        left: `${item.x}px` ,
        top: `${item.y}px` ,
      }
    })
    this.$emit('update:countries', _.sortBy(this.countries, item => item.country))
    this.isReady = true
    setTimeout(() => {
      this.$refs.input.focus()
      this.setMapCenter({x: this.mapWidth/2, y: this.mapHeight/3}, false)

      // // for debug
      // this.correctList = _.filter(this.countries, item => item.country !== 'USA')
      // _.each(this.correctList, item => item.active = true)
      // this.correctList = _.clone(this.correctList)
    })
  },
  methods : {
    onEnter() {
      this.inputCountry = _.trim(this.inputCountry)
      if (_.isEmpty(this.inputCountry)) {
        return
      }
      const find = _.find(this.countries, item => _.toLower(item.country) === _.toLower(this.inputCountry))
      if (find ) {
        if (!_.includes(this.correctList, find)) {
          find.active = true
          this.correctList.push(find)
        }
        this.lastCountry = find
        AudioManager.play(find.audio)
        this.setMapCenter(find)
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
      this.$refs.map.scrollTo({
        left: item.x - this.$refs.map.clientWidth/2,
        top: item.y - this.$refs.map.clientHeight/2,
        behavior: isSmooth?'smooth':undefined,
      })

    },
    onClickApplication() {
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    onClickMap(event) {
      const x = event.clientX + this.$refs.map.scrollLeft
      const y = event.clientY + this.$refs.map.scrollTop
      this.setMapCenter({x,y})
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    onClickCountryBox(item) {
      console.log(item.country, item)
      this.setMapCenter(item)
      if (this.isGiveUp) {
        this.lastCountry = item
        AudioManager.play(item.audio)
      }
    },
    resetGame() {
      _.each(this.countries, item => _.set(item, 'active', false))
      this.correctList = []
      this.lastCountry = ''
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
    overflow: auto;
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
}

</style>
