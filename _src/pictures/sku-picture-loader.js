const InstaData = require('../insta/data.js')
const SkuPic = require('../bean/sku-pic.js')

module.exports = class SkuPictureLoader {
  constructor (sku) {
    this.sku = sku
  }

  fromInsta (postId) {
    this.instaPostId = postId
    return this
  }

  load () {
    return new Promise((resolve, reject) => {
      new InstaData().post(this.instaPostId).load().then((post) => {
        var row = SkuPic.insta(this.sku, post.url, post.img.src)

        SkuPic.create(row, (err, doc) => {
          if (err) {
            reject(err)
          } else {
            resolve(doc)
          }
        })
      })
    })
  }
}
