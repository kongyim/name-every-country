<template>
  <div id="app">
    <MainMenu
      :countries.sync="countries"
      :games="games"
      :selectedGame.sync="selectedGame"
      v-if="!selectedGame"
      :originalCountries="originalCountries"
    />
    <NameByLocation
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      v-else-if="selectedGame.id === 'location'"
    />
    <NameByFlag
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      v-else-if="selectedGame.id === 'flag'"
    />
  </div>
</template>

<script>
import _ from 'lodash'

import NameByLocation from './components/NameByLocation.vue'
import NameByFlag from './components/NameByFlag.vue'
import MainMenu from './components/MainMenu.vue'
import originalCountries from './countries.json'

export default {
  name: 'App',
  components: {
    NameByLocation,
    NameByFlag,
    MainMenu
  },
  data() {
    const games = [
      {
        id: 'location',
        label: 'Name Every Country By Location'
      },
      {
        id: 'flag',
        label: 'Name Every Country By Flag'
      }
    ]

    return {
      originalCountries,
      selectedGame: null,
      // selectedGame: _.last(games),
      games,
      countries: originalCountries
    }
  },
  mounted() {
    _.each(this.originalCountries, item => {
      const code = _.toLower(item.alpha2)
      item.audio = `./assets/mp3/${code}.mp3`
      item.image = `./assets/flags/svg/${code}.svg`
    })
  }
}
</script>

<style>
body {
  padding: 0px;
  margin: 0px;
  font-family: arial;
}
</style>
