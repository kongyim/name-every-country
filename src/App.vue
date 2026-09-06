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
    this.updateViewport = () => {
      const viewport = window.visualViewport
      // Follow keyboard/browser-chrome resizing, but leave browser pinch zoom intact.
      if (viewport && viewport.scale !== 1) return
      document.documentElement.style.setProperty('--app-height', `${viewport ? viewport.height : window.innerHeight}px`)
      document.documentElement.style.setProperty('--app-top', `${viewport ? viewport.offsetTop : 0}px`)
    }
    this.updateViewport()
    window.addEventListener('resize', this.updateViewport)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.updateViewport)
      window.visualViewport.addEventListener('scroll', this.updateViewport)
    }
    _.each(this.originalCountries, item => {
      const code = _.toLower(item.iso2)
      item.audio = `./assets/mp3/${code}.mp3`
      item.capitalAudio = `./assets/mp3/${code}-capital.mp3`
      item.image = `./assets/flags/svg/${code}.svg`
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateViewport)
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.updateViewport)
      window.visualViewport.removeEventListener('scroll', this.updateViewport)
    }
  }
}
</script>

<style>
* { box-sizing: border-box; }
html { color: #18364d; background: #f4f7fa; }
body {
  padding: 0px;
  margin: 0px;
  font-family: arial;
}
button, input { font: inherit; font-size: 16px; }
button { min-height: 44px; cursor: pointer; touch-action: manipulation; }
input:not([type="checkbox"]) { min-height: 44px; }
button:focus-visible, input:focus-visible { outline: 3px solid #2684bd; outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
