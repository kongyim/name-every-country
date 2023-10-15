<template>
  <div class="main-page" v-if="isReady" @click="onClickMap()">
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
    <div class="map" key="map" ref="map">
      <img src="@/assets/map.svg" class="map-background" />
      <div class="box"
        v-for="item in countries"
        :class="{active: item.active, last: item === lastCountry}"
        :key="`item-${item.alpha2}`"
        :style="item.style"
        @click="onClickCountryBox(item)"
        >
      </div>
    </div>

    <!-- footer -->
    <div class="input-box">
      <input ref="input" v-model="inputCountry"  @keyup.enter="onEnter" :disable="isGiveUp"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import countries from '../countries'

export default {
  data() {
    const mapWidth = 2520
    const mapHeight = 1258
    return {
      countries,
      mapWidth,
      mapHeight,
      isReady: false,
      inputCountry: '',
      correctList: [],
      // lastCountry: _.find(countries, {alpha2: 'VC'})
      lastCountry: null,
      isGiveUp: false
    }
  },
  mounted() {
    _.each(this.countries, item => {
      const x =  Math.floor((this.mapWidth/360.0) * (180 + item.longitude)) - 0
      const y =  Math.floor((this.mapHeight/180.0) * (90 - item.latitude)) - 0
      item.x = x
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
    })
  },
  methods : {
    onEnter() {
      console.log(this.inputCountry)
      const find = _.find(this.countries, item => _.toLower(item.country) === _.toLower(this.inputCountry))
      if (find ) {
        if (!_.includes(this.correctList, find)) {
          find.active = true
          this.correctList.push(find)
        }
        this.lastCountry = find
        const audio = new Audio(find.audio)
        this.setMapCenter(find)
        audio.play()
      } else {
        const audio = new Audio('./assets/waves/error.mp3')
        audio.play()
      }
      this.inputCountry = ''
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    setMapCenter(item) {
      this.$refs.map.scrollTo({
        left: item.x - this.$refs.map.clientWidth/2,
        top: item.y - this.$refs.map.clientHeight/2,
        behavior: 'smooth',
      })

    },
    onClickMap() {
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    onClickCountryBox(item) {
      console.log(item.country, item)
      this.setMapCenter(item)
      if (this.isGiveUp) {
        this.lastCountry = item
      }
    },
    onClickGiveUp() {
      if (confirm('Are you sure you want to give up?')) {
        this.isGiveUp = true
        this.inputCountry = ''
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
    // .map-background {
    //   background-image: url('../assets/map.svg');
    // }
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
}

</style>
