<template>
  <div>
    <div class="buttons">
      <div
        :key="`button-${game.id}`"
        v-for="game in games"
        class="button"
        @click="onClickGame(game)
      ">
         {{game.label}}
      </div>
    </div>

    <div class="regions">
      <!-- {{selectedRegions}} -->
      <p class="title">
        Total number of countries selected: {{this.countries.length}} / {{originalCountries.length}}
      </p>
      <div
        :key="`region-${region.label}`"
        v-for="region in regions" class="region"
        @change="onChangeRegion(region)
      ">
        <input type="checkbox" size="60" v-model="selectedRegions" :value="region" />
        <span>{{region.label}} ({{region.countries.length}})</span>
      </div>
      <div class="region clear-all" @click="onClickClearAll">
        Clear All
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import originalCountries from '../countries.json'

export default {
  props: [
    'games',
    'selectedGame',
    'countries'
  ],
  data() {
    return {
      originalCountries,
      regions: [],
      selectedRegions: []
    }
  },
  mounted() {
    // console.log(111, this.games)
    const countries = _.sortBy(originalCountries, item => _.toLower(item.country))

    const regions = _.flatten(_.map(countries, 'regions'))
    this.regions = _.map(_.uniq(_.sortBy(regions)), label => {
      return {
        label,
        countries: _.filter(originalCountries, country => _.includes(country.regions, label))
      }
    })
    this.selectedRegions = _.clone(this.regions)
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
      this.updateCountriesBySelectedRegons()
    },
    updateCountriesBySelectedRegons() {
      let countries = _.uniq(_.flatten(_.map(this.selectedRegions, 'countries')))
      this.$emit('update:countries', countries)
    },
    onClickClearAll() {
      this.selectedRegions = []
      this.updateCountriesBySelectedRegons()
    }
  }

}
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  .button {
    width: 260px;
    text-align: center;
    background-color: grey;
    color: white;
    padding: 20px;
    margin-top: 40px;
    &:hover {
      background-color: black;
      cursor: pointer;
    }
  }
}

.regions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;

  .region {
    width: 250px;
    text-align: left;
    display: flex;
    align-items: center;

    input {
      width: 20px;
      height: 20px;
    }

    span {
      display: block;
      margin-top: 3px;
      margin-left: 10px;
    }
  }

  .clear-all {
    margin-top: 10px;
    cursor: pointer;
    color: hwb(216 7% 29%)
  }
}
</style>