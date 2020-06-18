const fs = require('fs')
const path = require('path')

module.exports = class {
  constructor (folder) {
    this.setFolder(folder)
  }

  folderBack () {
    if (this.folder) { this.folder = path.join(this.folder, '..') }
    return this
  }

  getFolderFilesPaths (extension = '*') {
    return fs.readdirSync(this.folder).filter(elm => elm.match(new RegExp(`.*.(${extension})`, 'ig')))
  }

  getFolderFiles (extension, onEachFile) {
    return this.getFolderFilesPaths(extension).map(fileName => {
      var instance = new (require(this.folder + '/' + fileName))()
      if (onEachFile) onEachFile(fileName, instance)
      return instance
    })
  }

  setName (name) {
    this.name = name
    return this
  }

  setFolder (folder) {
    // Root Folder
    this.folder = require('path').resolve('./')

    if (folder.startsWith('src')) {
      this.folder = this.folder + '/' + folder
    } else {
      this.folder = folder
    }

    return this
  }

  getFolder () {
    return this.folder
  }

  fromCanvas (canvas) {
    this.canvas = canvas
    return this
  }

  getFullPath () {
    return this.folder + '/' + this.name
  }

  save (callback) {
    fs.mkdir(this.folder, { recursive: true }, (_err) => {
      var out = fs.createWriteStream(this.getFullPath())
      var stream = this.canvas.pngStream()

      stream.on('data', function (chunk) {
        out.write(chunk)
      })

      stream.on('end', () => callback(out))
    })
  }
}
