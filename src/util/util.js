var Util = {

  uid (length = 8) {
    return new Date().getTime().toString().slice(-length)
  },

  id () {
    return parseInt(this.uid())
  },

  barcode (suffix = '') {
    var code = '789' + this.uid(9 - suffix.toString().length) + suffix.toString()
    var verifyCode = (10 - (code.split('').reduce((s, e, i) => { return s + parseInt(e) * ((i % 2 == 0) ? 1 : 3) }, 0) % 10)) % 10
    return code + verifyCode.toString()
  },

  transportName: (name, def) => {
    return Util.twoNames(name, def || Const.no_transport)
  },

  getSubtitles: function (charts) {
    var arrItem

    charts.some((chart) => {
      var arr = chart.getItems().filter((item) => {
        return item.getBars().length > 0
      })

      if (arr.length > 0) {
        arrItem = arr[0]
        return true
      }

      return false
    })

    return arrItem ? arrItem.getBars() : []
  },

  clone (object) {
    return JSON.parse(JSON.stringify(object))
  },

  ternal (_content, addIndex, data) {
    var content = _content.trim().toLowerCase()
    if (_content) {
      for (var i = 0; i < data.length; i++) {
        if ((i % 2 == 0) || (addIndex == 0)) {
          var datas = [].concat(data[i])

          var includes = datas.some((s) => {
            return content.includes(s.toString().toLowerCase())
          })

          if (includes) {
            return data[i + addIndex]
          }
        }
      }
    }

    return undefined
  },

  ternalSame (_content, ...data) {
    return Util.ternal(_content, 0, data)
  },

  ternalNext (_content, ...data) {
    return Util.ternal(_content, 1, data)
  },

  isObject (a) {
    return (!!a) && (a.constructor === Object)
  },

  // remover os objects  objeto
  keepPrimitiveAttrs (object) {
    for (var f in object) {
      if (Util.isObject(object[f]) || Array.isArray(object[f])) {
        delete object[f]
      }
    }
    return object
  },

  // remover os elementos null do objeto
  removeNullElements (object) {
    for (var f in object) {
      if (object[f] == null) {
        delete object[f]
      }
    }
    return object
  },

  removeAttrs (object, keep) {
    return Object.keys(object).reduce((obj, key) => {
      if (keep.includes(key)) {
        obj[key] = object[key]
      }
      return obj
    }, {})
  },

  bindProductAttrs (data) {
    if (data) {
      var run = (product) => {
        product._Atributos.forEach((attr) => {
          product[attr.descricao] = attr.valor
        })
      }

      if (Array.isArray(data)) {
        data.forEach((each) => {
          run(each)
        })
      } else {
        run(data)
      }
    }
  },

  objectToArray (object) {
    var result = []
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key])
      }
    }

    return result
  },

  forProperty (object, callback) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key)
      }
    }
  },

  findByProperty (object, onCheck) {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (onCheck(object[key], key)) {
          return object[key]
        }
      }
    }
  },

  deepVal (deepPath, object) {
    return deepPath.split('.').reduce((p, c) => p && p[c] || null, object)
  },

  isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object
  },

  selectContent: function (element) {
    var range = document.createRange()
    range.selectNodeContents(element)
    var sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
  },

  copySeleted: function (text) {
    if (text) {
      const textarea = document.createElement('textarea')
      textarea.style.width = 0
      textarea.style.height = 0
      textarea.style.position = 'absolute'
      textarea.style.bottom = '-100%'
      textarea.style.left = '-100%'
      textarea.style.margin = 0
      document.body.appendChild(textarea)

      textarea.value = text
      textarea.select()
    }

    return document.execCommand('copy')
  },

  isTrueStr: function (val) {
    return val == true || val == 'true'
  },

  hashCode: function (str) {
    if (str) {
      str = str.toString().toLowerCase().trim()
    }

    var hash = 0
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return hash
  },

  strToColor: function (str, alpha) {
    var shortened = this.hashCode(str) % 160
    return 'hsl(' + shortened + ', 45%, 60%' + (alpha ? ', ' + alpha : '') + ')'
  },

  acronym: (text, len) => {
    var result = text.match(/[A-Z]/g).join('')

    return result.length == 1 ? text.replace(/[aeiou]/g, '').trim().substr(0, len || 3) : result
  },

  historyTagColor (tag) {
    if (tag == 'Falha') {
      return '#ec7565'
    } else {
      return this.strToColor(tag)
    }
  },

  ellipsis (str, max) {
    if (str.length > max + 3) {
      return str.substring(0, max) + '...'
    }

    return str
  },

  twoNames (name, def, pMax) {
    if (!name) {
      return def || ''
    }

    var max = pMax || 10

    var two = name.split(' ').slice(0, 2).join(' ').length <= max

    if (two) {
      name = name.split(' ').filter((e, i) => {
        return i <= 1
      }).join(' ')
    } else {
      name = name.split(' ')[0]
    }

    return name
  },

  formatCEP (cep) {
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2')
    return cep
  },

  orderDatesObject (object) {
    return Object
      .entries(object)
      .sort((a, b) => {
        return new Date(a[0]) - new Date(b[0])
      }).reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
  },

  getProductBrand (name, isChild) {
    var spl = name.split('-')
    var brand = spl[spl.length + (isChild ? -2 : -1)]

    return brand || ''
  },

  getProductName (name, isChild) {
    // var desc = name.split('-').slice(0, isChild ? -2 : -1).join('-').trim()
    var desc = name.split('-').shift().trim()

    return desc || ''
  },

  colorBrightness (color) {
    // Variables for red, green, blue values
    var r, g, b, hsp

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)

      r = color[1]
      g = color[2]
      b = color[3]
    } else {
      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +('0x' + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'))

      r = color >> 16
      g = color >> 8 & 255
      b = color & 255
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
      0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    )

    return hsp
  },

  circylarStringify (object) {
    var cache = []
    var str = JSON.stringify(object,
      // custom replacer fxn - gets around "TypeError: Converting circular structure to JSON"
      function (key, value) {
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            // Circular reference found, discard key
            return
          }
          // Store value in our collection
          cache.push(value)
        }
        return value
      }, 4)
    cache = null // enable garbage collection
    return str
  },

  printList (arr, allVal, allDef, showCount) {
    var result = allDef || allVal
    showCount = showCount || 1

    if (arr) {
      if (!arr.includes(allVal)) {
        if (typeof arr === 'string') {
          arr = arr.split(',')
        }

        var dif = arr.length - showCount

        result = arr.slice(0, showCount).join(', ') + (dif > 0 ? ' +' + dif : '')
      }
    }

    return result
  },

  getUrlParam: function (name) {
    name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)

    if (name) { return decodeURIComponent(name[1]) }
  },

  isTokenOk: (user) => {
    return user.token && (user.token.length > 100)
  }

}

if (typeof module !== 'undefined') { module.exports = Util }
