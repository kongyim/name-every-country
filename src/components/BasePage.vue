<script>
import _ from 'lodash'
import AudioManager from '@/services/AudioManager'

export default {
  data() {
    return {
      correctList: [],
      lastCountry: null,
      isReady: false,
      isGiveUp: false,
      isWin: false,
    }
  },
  methods: {
    trimName(value) {
      const newValue = _.trim(_.toLower(value)).replace(/[-', ]/g, '')
      return newValue
    },
    checkWin() {
      if (_.isEmpty(_.difference(this.countries, this.correctList))) {
        this.isWin = true
        setTimeout(() => {
          AudioManager.playApplause()
        }, 1000)
      }
    },
    onClickGiveUp() {
      if (confirm('Are you sure you want to give up?')) {
        this.isGiveUp = true
        this.inputCountry = ''
        this.missingCountries = _.difference(this.countries, this.correctList)
      }
    },
    onClickTryAgain() {
      this.resetGame()
    },
    onClickBack() {
      this.$emit('update:selectedGame', null)
    },
  }
}
</script>

<style lang="scss">
.header-box {
    pointer-events: none;
    position: fixed;
    left: 0px;
    top: 0px;
    font-size: 40px;
    width: 100%;
    z-index: 100;
    .progress {
      width: 170px;
      text-align: right;
      color: black;
      padding: 20px;
      background: rgba(255,255,255,0.8);
    }
    .last-country {
      position: absolute;
      background: rgba(255,255,255,0.8);
      padding: 20px;
      left: 50%;
      top: 0px;
      text-align: center;
      color: black;
      font-size: 20px;
      width: 400px;
      margin-left: -200px;

      img {
        width: 100px;
      }
    }
    .give-up, .try-again, .back-button {
      pointer-events: all;
      position: absolute;
      background: rgba(255,255,255,0.8);
      padding: 20px;
      right: 0px;
      top: 0px;
      cursor: pointer;
      &:hover {
        background: rgba(0,0,0,0.8);
        color: white;
      }

      &.back-button {
        top: 100px;
      }
    }

  }
  .missing-countries-canvas {
    background: rgba(255,255,255,0.8);
    position: fixed;
    left: 0px;
    top: 100px;
    height: calc(100vh - 240px);
    overflow: scroll;
    width: 400px;
    padding: 20px;

    .country-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      cursor: pointer;

      &:hover {
        background-color: yellow;
      }

      .flag {
        width: 60px;
        object-fit: contain;
        margin-right: 20px;
      }
    }
  }
  .congratulations {
    position: fixed;
    left: 0%;
    top: 40%;
    width: 100%;
    height: 200px;
    line-height: 200px;
    font-size: 80px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.4);

    color: white;
    text-shadow :0 0 32px yellow;
  }

</style>