const gTTS = require('gtts')
const pAll = require('p-all')
const _ = require('lodash')
const log4js = require('log4js')
const Q = require('q')
const fs = require('fs')

const countries = require('./countries')

const logger = log4js.getLogger()
logger.level = log4js.levels.DEBUG

class Main {
  async process() {
    logger.info('start generate mp3 ... ... ', countries.length)
    await pAll(_.map(countries, item => {
      return async () => {
        try {
          const code = _.toLower(item.alpha2)
          const filename = `./public/assets/mp3/${code}.mp3`
          if (fs.existsSync(filename)) {
            return
          }
          const gtts = new gTTS(item.speakText || item.country, 'en')
          await Q.ninvoke(gtts, 'save', filename)
          console.log('File saved :', filename)
        } catch (error) {
          console.log('Error', error)
        }
      }
    }), {concurrency:1})
    logger.info('start generate mp3 ... ... done', countries.length)
  }
}

new Main().process()