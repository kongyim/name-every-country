<template>
  <div class="main-page flag-page" v-if="isReady">
    <h1 class="sr-only">{{selectedGame.label}}</h1>
    <header class="header-box">
      <div class="progress" role="status" aria-label="Correct answers">{{correctList.length}} / {{countries.length}}</div>
      <div class="header-actions">
        <button type="button" class="give-up" data-analytics-event="give_up_click" @click="onClickGiveUp" v-if="!isGiveUp && !isWin">Give up</button>
        <button type="button" class="try-again" data-analytics-event="try_again_click" @click="onClickTryAgain" v-else>Try again</button>
        <button type="button" class="back-button" data-analytics-event="back_click" @click="onClickBack">Back</button>
      </div>
    </header>

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
        <img :src="item.image" :alt="item.correct || isGiveUp || showCountryName ? item.name + ' flag' : 'Flag to identify'" loading="lazy" />
        <p v-if="showCountryName">{{get(item, 'name')}}</p>
        <p v-if="item.correct || isGiveUp" :class="{miss: isGiveUp && !item.correct}">{{get(item, field)}}</p>
        <form v-else class="flag-answer" @submit.prevent="onKey(item, idx)" @click.stop>
          <input v-model="item.answer" :ref="`input-${idx}`" :aria-label="showCountryName ? 'Answer for ' + item.name : 'Country name for flag ' + (idx + 1)" autocomplete="off" autocorrect="off" autocapitalize="none" :spellcheck="false" enterkeyhint="next" />
          <button type="submit">Check</button>
        </form>
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
      this.$nextTick(() => {
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
        this.$set(item, 'correct', false)
        this.$set(item, 'answer', '')
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

<style scoped>
.flag-page { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.countries { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; max-width: 1440px; margin: auto; padding: 12px max(12px, env(safe-area-inset-right)) 12px max(12px, env(safe-area-inset-left)); }
.country { min-width: 0; padding: 12px; text-align: center; background: white; border: 1px solid #dbe4ec; border-radius: 10px; scroll-margin-top: 90px; }
.country img { width: 100%; height: 80px; object-fit: contain; }
.country p { margin: 8px 0 0; line-height: 1.4; overflow-wrap: anywhere; }
.country .miss { color: #b91c1c; }
.country.correct { cursor: pointer; background: #f0fdf4; }
.flag-answer { display: grid; gap: 6px; margin-top: 10px; }
.flag-answer input { min-width: 0; width: 100%; padding: 10px 6px; text-align: center; border: 1px solid #94a3b8; border-radius: 6px; scroll-margin-top: 90px; scroll-margin-bottom: 16px; }
.flag-answer button { border: 0; border-radius: 6px; padding: 8px; background: #18364d; color: white; }
@media (min-width: 1000px) { .countries { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); } }
</style>
