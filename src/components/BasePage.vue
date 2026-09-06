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
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: max(8px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) 8px max(12px, env(safe-area-inset-left));
  background: #eeeeee;
  border-bottom: 1px solid #dbe4ec;
  .progress { font-size: clamp(18px, 3vw, 28px); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .header-actions { display: flex; gap: 8px; }
  button { padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; color: #18364d; }
  button:hover { background: #e6f0f5; }
  .last-country { display: flex; align-items: center; justify-content: center; gap: 12px; flex: 1 0 100%; min-width: 0; text-align: center; overflow-wrap: anywhere; font-size: 18px; }
  .last-country img { width: 48px; height: 32px; object-fit: contain; }
}
.congratulations {
  position: fixed;
  z-index: 12;
  left: 16px;
  right: 16px;
  top: 40%;
  padding: 24px 12px;
  border-radius: 12px;
  font-size: clamp(24px, 6vw, 64px);
  text-align: center;
  background: #18364de8;
  color: white;
  overflow-wrap: anywhere;
  pointer-events: none;
}
@media (max-width: 360px) {
  .header-box { gap: 6px; padding-left: 8px; padding-right: 8px; }
  .header-box button { padding: 10px; }
}
</style>
