<template>
  <div class="main-page" v-if="isReady" :style="style">
    <div class="box" v-for="item in countries" :key="`item-${item.alpha2}`" :style="item.style"></div>
  </div>
</template>

<script>
import _ from 'lodash'
import countries from '../countries'

export default {
  data() {
    const backgroundWidth = 2520
    const backgroundHeight = 1260

    const mapWidth = 2523
    const mapHeight = 1265
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
      isReady: false
    }
  },
  mounted() {

    _.each(this.countries, item => {
      const x =  Math.floor((this.mapWidth/360.0) * (180 + item.longitude)) - 0
      const y =  Math.floor((this.mapHeight/180.0) * (90 - item.latitude)) - 0
      item.x = x
      item.y = y
      console.log(x,y)
      item.style = {
        left: `${item.x}px` ,
        top: `${item.y}px` ,
      }
      // console.log(111, x,y)
    })
    this.isReady = true
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
    background: red;
    position: absolute;
  }
}

</style>
