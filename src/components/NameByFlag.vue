<template>
  <div class="main-page" v-if="isReady" :key="`key-${correctList.length}`">
    <div class="countries">
      <div
        :key="`country-${item.country}`"
        class="country"
        v-for="(item, idx) in countries"
      >
        <img :src="item.image" />
        <p v-if="item.correct">{{item.country}}</p>
        <input  v-else v-model="item.answer" @keyup.enter="onKey(item, idx)" :ref="`input-${idx}`"/>
      </div>
    </div>
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
    onKey(item, idx) {
      if (_.toLower(item.country) === _.toLower(item.answer)) {
        item.correct = true
        if (!_.includes(this.correctList, item)) {
          this.correctList.push(item)
        }
      }
      console.log(idx, _.first(this.$refs[`input-${idx}`]))
    }
  }
}
</script>

<style lang="scss">
.main-page {
  .countries {
    display: flex;
    flex-wrap: wrap;
    .country {
      padding: 10px;
      width: 150px;
      text-align: center;
      background-color: #eee;
      margin: 5px;
      img {
        width: 100px;
        height: 80px;
        object-fit: contain;
      }
      p {
        // display: none
        padding: 0px;
        margin: 0px;
      }
      input {
        padding: 5px;
        text-align: center;
        width: 120px;
      }
    }
  }
}

</style>
