<template>
  <div class="main-page" v-if="isReady" :key="`key-${correctList.length}`">
    <!-- header -->
    <div class="header-box" :key="`correct-${correctList.length}`">
      <div class="progress">
        {{correctList.length}} / {{countries.length}}
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

    <!-- congratulations -->
    <template v-if="isWin">
      <div class="congratulations">
        Congratulations
      </div>
    </template>

    <!-- flags -->
    <div class="countries">
      <div
        :key="`country-${item.name}`"
        class="country"
        :class="{correct: item.correct || isGiveUp}"
        v-for="(item, idx) in countries"
         @click="onClickCountry(item)"
      >
        <img :src="item.image" />
        <p v-if="showCountryName">{{get(item, 'name')}}</p>
        <p v-if="item.correct || isGiveUp" :class="{miss: isGiveUp && !item.correct}">{{get(item, field)}}</p>
        <input  v-else v-model="item.answer" @keyup.enter="onKey(item, idx)" :ref="`input-${idx}`"/>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import BasePage from './BasePage.vue'
import AudioManager from '@/services/AudioManager'

export default {
  mixins: [BasePage],
  props: [
    'showCountryName',
    'countries',
    'selectedGame',
    'field',
    'audioField'
  ],
  data() {
    return {
      get: _.get,
      isReady: false,
      correctList: [],
      missingCountries: this.countries
    }
  },
  mounted() {
    this.resetGame()
    this.isReady = true
  },
  methods : {
    onKey(item, idx) {
      if (this.trimName(_.get(item, this.field)) === this.trimName(_.toLower(item.answer))) {
        item.correct = true
        if (!_.includes(this.correctList, item)) {
          this.correctList.push(item)
        }
        AudioManager.play(item[this.audioField])
        this.focusNextInput(idx)
        this.checkWin()
      } else {
        AudioManager.playError()
      }
    },
    focusNextInput(originalIdx) {
      setTimeout(() => {
        let nextInput
        _.each(_.range(this.countries.length), idx => {
          if (nextInput) {
            return
          }
          const nextId = (originalIdx + idx + 1) % this.countries.length
          nextInput = _.first(this.$refs[`input-${nextId}`])
        })
        if(nextInput) {
          nextInput.focus()
          return
        }
      })
    },
    resetGame() {
      _.each(this.countries, item => {
        _.set(item, 'correct', false)
        _.set(item, 'answer', '')
      })
      this.$emit('update:countries', _.shuffle(this.countries))
      this.correctList = []
      this.isGiveUp = false
      this.isWin = false
      AudioManager.stopAll()
    },
    onClickCountry(item) {
      if (item.correct || this.isGiveUp) {
        AudioManager.play(item[this.audioField])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.main-page {
  .countries {
    margin-top: 80px;
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
        margin-top: 5px;

        &.miss {
          color: red
        }
      }
      input {
        padding: 5px;
        text-align: center;
        width: 120px;
      }
      &.correct {
        cursor: pointer;
      }
    }
  }
}

</style>
