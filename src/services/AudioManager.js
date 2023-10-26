import _ from 'lodash'

class AudioManager {
  constructor() {
    this.audioMap = {}
  }

  play (path) {
    let audio = this.audioMap[path]
    if (!audio) {
      this.audioMap[path] = audio = new Audio(path)
    } else {
      audio.pause()
      audio.currentTime = 0
    }
    audio.play()
  }

  playError() {
    this.play('./assets/mp3/error.mp3')
  }

  playApplause() {
    this.play('./assets/mp3/applause.mp3')
  }

  stopAll() {
    _.each(this.audioMap, audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }
}

export default new AudioManager()