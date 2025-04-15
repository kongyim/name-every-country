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
      field="name"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="audio"
      v-else-if="selectedGame.id === 'location'"
    />
    <NameByFlag
      field="name"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="audio"
      v-else-if="selectedGame.id === 'flag'"
    />
    <NameByFlag
      field="iso2"
      :showCountryName="true"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="audio"
      v-else-if="selectedGame.id === 'iso2'"
    />
    <NameByFlag
      field="iso3"
      :showCountryName="true"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="audio"
      v-else-if="selectedGame.id === 'iso3'"
    />
    <NameByFlag
      field="capital.name"
      :showCountryName="true"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="capitalAudio"
      v-else-if="selectedGame.id === 'capital'"
    />
    <NameByLocation
      field="capital.name"
      :countries.sync="countries"
      :selectedGame.sync="selectedGame"
      audioField="capitalAudio"
      latitudeField="capital.latitude"
      longitudeField="capital.longitude"
      v-else-if="selectedGame.id === 'capitalLocation'"
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
      },
      {
        id: 'iso2',
        label: 'Name Every Country iso2 By Flag'
      },
      {
        id: 'iso3',
        label: 'Name Every Country iso3 By Flag'
      },
      {
        id: 'capital',
        label: 'Name Every Capital City By Flag'
      },
      {
        id: 'capitalLocation',
        label: 'Name Every Capital City By Location'
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
      const code = _.toLower(item.iso2)
      item.audio = `./assets/mp3/${code}.mp3`
      item.capitalAudio = `./assets/mp3/${code}-capital.mp3`
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
