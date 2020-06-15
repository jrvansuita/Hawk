const imgur = require('imgur')

module.exports = class ImageSaver {
  connect () {
    imgur.setCredentials(Params.imgurEmail(), Params.imgurPass(), Params.imgurId())
    return this
  }

  setOnError (onError) {
    this.onError = onError
    return this
  }

  setOnSuccess (onSuccess) {
    this.onSuccess = onSuccess
    return this
  }

  setBase64Image (base64Image) {
    this.base64Image = base64Image
    return this
  }

  process () {
    if (this.base64Image) {
      return imgur.uploadBase64(this.base64Image)
    }

    return false
  }

  upload () {
    var promisse = this.connect().process()

    if (promisse) {
      promisse
        .then((result) => {
          if (result.success && this.onSuccess) {
            this.onSuccess(result.data)
          }
        })
        .catch(this.onError)
    }
  }
}
