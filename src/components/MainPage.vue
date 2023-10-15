<template>
  <div class="main-page" v-if="isReady" :style="style" :key="`correct-${correctList.length}`" @click="onClickMap()">
    <div class="header-box">
      <div class="progress">
        {{correctList.length}} / {{countries.length}}
      </div>

      <div class="last-country" v-if="lastCountry">
        <img :src="lastCountry.image" />
        <div>{{lastCountry.country}}</div>
      </div>
    </div>
    <div class="box"
      v-for="item in countries"
      :class="{active: item.active}"
      :key="`item-${item.alpha2}`"
      :style="item.style"
      @click="onClickCountryBox(item)"
      >
    </div>
    <div class="input-box">
      <input ref="input" v-model="inputCountry"  @keyup.enter="onEnter" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import countries from '../countries'

export default {
  data() {
    const backgroundWidth = 2520
    const backgroundHeight = 1260

    const mapWidth = 2520
    const mapHeight = 1258
    return {
      countries,
      mapWidth,
      mapHeight,
      backgroundWidth,
      backgroundHeight,
      style: {
        width: `${backgroundWidth}px`,
        height: `${backgroundHeight}px`
      },
      isReady: false,
      inputCountry: '',
      correctList: [],
      lastCountry: _.first(countries)
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
    onClickMap() {
      setTimeout(() => {
        this.$refs.input.focus()
      })
    },
    onClickCountryBox(item) {
      console.log(item.country, item)
    }
  }
}
</script>

<style lang="scss">
.main-page {
  background-image: url('../assets/map.svg');
  .box {
    width: 9px;
    height: 9px;
    margin-left: -4px;
    margin-top: -4px;
    background: grey;
    position: absolute;
    border: 1px black solid;
    border-radius: 5px;
    opacity: 0.8;
    &.active {
      background: #00FF00;
      opacity: 1.0;
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
    }
  }
  .header-box {
    position: fixed;
    left: 0px;
    top: 0px;
    font-size: 40px;
    width: 100%;
    .progress {
      width: 170px;
      text-align: right;
      color: grey;
    }
    .last-country {
      position: absolute;
      background: rgba(255,255,255,0.5);
      padding: 20px;
      right: 0px;
      top: 0px;
      text-align: center;
      color: grey;

      img {
        width: 100px;
      }
    }
  }
}

</style>
