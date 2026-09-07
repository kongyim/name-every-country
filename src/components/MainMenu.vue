<template>
  <main class="main-menu">
    <h1>Name every country</h1>
    <p class="intro">Choose a game, or pick the regions you want to practise below.</p>
    <div class="game-buttons">
      <button type="button" v-for="game in games" :key="game.id" class="game-button" :disabled="!countries.length" data-analytics-event="game_select" :data-game-id="game.id" @click="onClickGame(game)">
        {{game.label}}
      </button>
    </div>
    <section class="regions" aria-labelledby="regions-title">
      <h2 id="regions-title">Choose your regions</h2>
      <p class="selection-count" role="status">{{countries.length}} / {{originalCountries.length}} countries selected</p>
      <div class="selection-actions">
        <button type="button" data-analytics-event="regions_select_all" @click="onClickSelectAll">Select all</button>
        <button type="button" data-analytics-event="regions_clear_all" @click="onClickClearAll">Clear all</button>
      </div>
      <p v-if="!countries.length" class="empty-selection">Select at least one region to start a game.</p>
      <div class="region-grid">
        <label v-for="region in regions" :key="region.label" class="region">
          <input type="checkbox" v-model="selectedRegions" :value="region" @change="onChangeRegion" />
          <span>{{region.label}} ({{region.countries.length}})</span>
        </label>
      </div>
    </section>
  </main>
</template>

<script>
import _ from 'lodash'

export default {
  props: [
    'games',
    'selectedGame',
    'countries',
    'originalCountries'
  ],
  data() {
    return {
      regions: [],
      selectedRegions: []
    }
  },
  mounted() {
    // console.log(111, this.games)
    const countries = _.sortBy(this.originalCountries, item => _.toLower(item.name))
    const regions = _.flatten(_.map(countries, 'regions'))
    this.regions = _.map(_.uniq(_.sortBy(regions)), label => {
      return {
        label,
        countries: _.filter(this.originalCountries, country => _.includes(country.regions, label))
      }
    })
    const localStorageSelectedRegions = localStorage.getItem('slectedRegions')
    if (!_.isEmpty(localStorageSelectedRegions)) {
      try {
        const selectedRegionKeys = JSON.parse(localStorageSelectedRegions)
        this.selectedRegions = _.filter(this.regions, region => _.includes(selectedRegionKeys, region.label))
      } catch (error) {
        console.error(error)
      }

    } else {
      this.selectedRegions = _.clone(this.regions)
    }
    this.updateCountriesBySelectedRegons()
  },
  methods: {
    onClickGame(game) {
      if (_.isEmpty(this.countries)) {
        return
      }
      this.$emit('update:selectedGame', game)
    },
    onChangeRegion() {
      localStorage.setItem('slectedRegions', JSON.stringify(_.map(this.selectedRegions, 'label')))
      this.updateCountriesBySelectedRegons()
    },
    updateCountriesBySelectedRegons() {
      let countries = _.uniq(_.flatten(_.map(this.selectedRegions, 'countries')))
      this.$emit('update:countries', countries)
    },
    onClickClearAll() {
      this.selectedRegions = []
      this.updateCountriesBySelectedRegons()
      this.onChangeRegion()
    },
    onClickSelectAll() {
      this.selectedRegions = _.clone(this.regions)
      this.updateCountriesBySelectedRegons()
      this.onChangeRegion()
    }
  }

}
</script>

<style scoped>
.main-menu { max-width: 1040px; margin: auto; padding: max(24px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
h1 { font-size: clamp(26px, 5vw, 40px); margin: 0 0 10px; }
.intro { color: #475569; line-height: 1.5; margin: 0 0 24px; }
.game-buttons { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.game-button { min-height: 76px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 12px; background: #18364d; color: white; text-align: left; line-height: 1.4; }
.game-button:hover:not(:disabled) { background: #254f6b; }
.game-button:disabled { opacity: .5; cursor: not-allowed; }
.regions { margin-top: 32px; }
h2 { font-size: 22px; margin: 0 0 8px; }
.selection-count { color: #475569; margin: 0 0 12px; }
.selection-actions { display: flex; gap: 10px; margin-bottom: 12px; }
.selection-actions button { border: 1px solid #cbd5e1; border-radius: 8px; background: white; padding: 10px 16px; }
.region-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.region { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 10px; border-radius: 8px; background: white; border: 1px solid #e2e8f0; cursor: pointer; line-height: 1.4; }
.region input { width: 22px; height: 22px; margin: 0; flex: 0 0 22px; accent-color: #18364d; }
.empty-selection { color: #9a3412; }
@media (max-width: 600px) {
  .game-buttons { grid-template-columns: 1fr; gap: 8px; }
  .game-button { min-height: 56px; padding: 12px 16px; }
  .region-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 360px) { .region-grid { grid-template-columns: 1fr; } }
</style>
