const GetGoogleFonts = require('get-google-fonts')
const fs = require('fs')

module.exports = class {
  constructor (fontName) {
    if (fontName) {
      this.setFonts([fontName])
    }

    this.fontPath = './front/fonts'
    this.googleUrl = 'https://fonts.googleapis.com/css?'
    this.googleFonts = new GetGoogleFonts()
    this.weights = ['400', '700', '900']
  }

  setFonts (fontsArr) {
    this.fontsArr = fontsArr
    return this
  }

  getUrl () {
    return this.googleUrl + 'family=' + this.fontsArr.map((each) => {
      return each.replace(' ', '+') + ':' + this.weights.join(',')
    }).join('|')
  }

  getFontFiles () {
    var files = fs.readdirSync(this.fontPath)

    var filtered = files.filter((each) => {
      return this.fontsArr.some((fontName) => {
        return each.includes(fontName.replace(' ', '_'))
      })
    })

    filtered = filtered.map((each) => {
      return this.fontPath + '/' + each
    })

    return filtered
  }

  load (callback) {
    var url = this.getUrl(this.fontsArr)

    this.googleFonts.download(url, {
      userAgent: 'Wget/1.18',
      outputDir: this.fontPath,
      template: '{_family}-{weight}.{ext}',
      overwriting: false
    }).then(() => {
      setTimeout(() => {
        if (callback) {
          callback(this.getFontFiles())
        }
      }, 300)
    }).catch((e) => {
      console.log(e)
    })
  }
}
