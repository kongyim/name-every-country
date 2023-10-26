<template>
  <div class="main-page" v-if="isReady">
    test
  </div>
</template>

<script>
import _ from 'lodash'
// import AudioManager from '@/services/AudioManager'

export default {
  props: [
    'countries',
    'selectedGame'
  ],
  data() {
    return {
      isReady: false,
      correctList: [],
      missingCountries: this.countries
    }
  },
  mounted() {
    _.each(this.countries, item => {
      const code = _.toLower(item.alpha2)
      item.audio = `./assets/mp3/${code}.mp3`
      item.image = `./assets/flags/svg/${code}.svg`
    })
    this.isReady = true
  },
  methods : {
  }
}
</script>

<style lang="scss">
.main-page {

}

</style>
