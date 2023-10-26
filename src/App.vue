<template>
  <div id="app">
    <MainMenu
      :countries.sync="countries"
      :games="games"
      :selectedGame.sync="selectedGame"
      v-if="!selectedGame"
    />
    <NameByLocation
      :countries="countries"
      :selectedGame.sync="selectedGame"
      v-else-if="selectedGame.id === 'location'"
    />
    <NameByFlag
      :countries="countries"
      :selectedGame.sync="selectedGame"
      v-else-if="selectedGame.id === 'flag'"
    />
  </div>
</template>

<script>
// import _ from 'lodash'

import NameByLocation from './components/NameByLocation.vue'
import NameByFlag from './components/NameByFlag.vue'
import MainMenu from './components/MainMenu.vue'

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
      selectedGame: null,
      // selectedGame: _.last(games),
      games,
      countries: []
    }
  },
  mounted() {
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
