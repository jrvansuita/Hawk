
var Local = {

  set (tag, val) {
    localStorage.setItem(tag, val)
  },

  get (tag, def) {
    return JSON.parse(localStorage.getItem(tag)) || def || {}
  },

  getStr (tag) {
    return localStorage.getItem(tag)
  },

  del (tag) {
    return localStorage.removeItem(tag)
  },

  put (tag, val) {
    this.set(tag, JSON.stringify(val))
  }
}
