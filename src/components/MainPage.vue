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
      <div class="give-up" @click="onClickGiveUp" v-if="!isGiveUp">
        Give up
      </div>
      <div class="try-again" @click="onClickTryAgain" v-else>
        Try again
      </div>
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

    <!-- missing countries canvas-->
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

    <!-- footer -->
    <div class="input-box">
      <input ref="input" v-model="inputCountry"  @keyup.enter="onEnter" :disabled="isGiveUp"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import originalCountries from '../countries'

export default {
  data() {
    const mapWidth = 2520
    const mapHeight = 1260
    const countries = _.sortBy(originalCountries, item => _.toLower(item.country))
    return {
      audioMap: {},
      countries,
      mapWidth,
      mapHeight,
      isReady: false,
      inputCountry: '',
      correctList: [],
      // lastCountry: _.find(countries, {alpha2: 'VC'})
      lastCountry: null,
      isGiveUp: false,
      missingCountries: countries
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
      const code = _.toLower(item.alpha2)
      item.audio = `./assets/waves/${code}.mp3`
      item.image = `./assets/flags/svg/${code}.svg`
    })
    this.isReady = true
    setTimeout(() => {
      this.$refs.input.focus()
      this.setMapCenter({x: this.mapWidth/2, y: this.mapHeight/3}, false)
    })
  },
  methods : {
    playAudio(path) {
      let audio = this.audioMap[path]
      if (!audio) {
        this.audioMap[path] = audio = new Audio(path)
      } else {
        audio.pause()
        audio.currentTime = 0
      }
      audio.play()
    },
    onEnter() {
      const find = _.find(this.countries, item => _.toLower(item.country) === _.toLower(this.inputCountry))
      if (find ) {
        if (!_.includes(this.correctList, find)) {
          find.active = true
          this.correctList.push(find)
        }
        this.lastCountry = find
        this.playAudio(find.audio)
        this.setMapCenter(find)
      } else {
        this.playAudio('./assets/waves/error.mp3')
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
        this.playAudio(item.audio)
      }
    },
    onClickGiveUp() {
      if (confirm('Are you sure you want to give up?')) {
        this.isGiveUp = true
        this.inputCountry = ''
        this.missingCountries = _.difference(this.countries, this.correctList)
      }
    },
    onClickTryAgain() {
      this.resetGame()
    },
    resetGame() {
      this.countries = _.map(this.countries, item => _.omit(item, 'active'))
      this.correctList = []
      this.lastCountry = ''
      this.isGiveUp = false
    }
  }
}
</script>

<style lang="scss">
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
  .header-box {
    pointer-events: none;
    position: fixed;
    left: 0px;
    top: 0px;
    font-size: 40px;
    width: 100%;
    z-index: 100;
    .progress {
      width: 170px;
      text-align: right;
      color: black;
      padding: 20px;
      background: rgba(255,255,255,0.8);
    }
    .last-country {
      position: absolute;
      background: rgba(255,255,255,0.8);
      padding: 20px;
      left: 50%;
      top: 0px;
      text-align: center;
      color: black;
      font-size: 20px;
      width: 400px;
      margin-left: -200px;

      img {
        width: 100px;
      }
    }
    .give-up, .try-again {
      pointer-events: all;
      position: absolute;
      background: rgba(255,255,255,0.8);
      padding: 20px;
      right: 0px;
      top: 0px;
      cursor: pointer;
      &:hover {
        background: rgba(0,0,0,0.8);
        color: white;
      }
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
