$(document).ready(() => {
  new FileLoader().css('dropdown').load()
})

class Dropdown {
  static on (holder, ...params) {
    var drop = new Dropdown($(holder), ...params)
    $(holder).click((e) => {
      e.stopPropagation()
      drop.prepare(e)
      drop.show()
    })

    return drop
  }

  constructor (holder, createDots = true, notVisible = false) {
    this.holder = holder
    this.notVisible = notVisible
    if (createDots) {
      this.createMenuButton()
    }

    this.createMenuList()
    this.onBindMouseOver()
    this.hide()
  }

  createMenuButton () {
    var style = { width: '15px', marginRight: '-5px', marginLeft: '5px', height: '15px', padding: '3px', display: 'inline-flex' }

    this.defMenuIcon = '/img/dots.png'
    this.menuIcon = $('<img>').attr('src', this.defMenuIcon).addClass('md-dots-icon').css(style)
    $(this.holder).append(this.menuIcon)
  }

  createMenuList () {
    this.dropdown = $('<div>').addClass('md-dropdown')
    this.list = $('<ul>')
    this.dropdown.append(this.list)
    $(this.holder).append(this.dropdown)
    // still not visible on some windows
    if (this.notVisible == true) {
      this.dropdown.css('left', '-155px')
    }
  }

  onBindMouseOver () {
    this.dropdown.mouseleave(() => {
      if (this.onMouseLeave) this.onMouseLeave()
      this.hide()
    })
  }

  hasItems () {
    return this.list && (this.list.length > 0)
  }

  bindMousePos () {
    this.bindMousePosition = true
    return this
  }

  setMenuPos (addX, addY) {
    this.top = Num.def(this.top) + addY
    this.left = Num.def(this.left) + addX
    return this
  }

  setOnAnyOptionsClick (callback) {
    this.onAnyOptionClick = callback
    return this
  }

  setOnDynamicShow (callback) {
    this.onDynamicShow = callback
    return this
  }

  getHelper (event) {
    var helper = {
      event: event,
      holder: this.holder,
      parent: this.holder.parent(),
      menuList: this.list,
      dropDown: this.dropdown,
      data: this.holder.data(),
      setMenuIcon: (path, delay, greaterIcon) => {
        if (this.menuIcon) {
          this.menuIcon.attr('src', path).toggleClass('greater-icon', greaterIcon)
          if (delay) {
            this.holder.children().delay(delay).queue(() => {
              helper.loading(false)
            })
          }
        }
      },
      loading: (is = true) => {
        this.isLoading = is
        helper.setMenuIcon(is ? '/img/loader/circle.svg' : '/img/dots.png', 0, is)
      },

      finished: (success) => {
        if (success) { helper.success() } else { helper.error() }
      },

      success: () => {
        helper.setMenuIcon('/img/checked.png', 3000, true)
      },
      error: () => {
        helper.setMenuIcon('/img/error.png', 3000, true)
      }
    }

    return helper
  }

  item (icon, label, onClick, redirect, blank) {
    var $icon = icon ? $('<img>').attr('src', icon) : null
    var $li = $('<li>').append($('<a>').attr('href', redirect || '#').attr('target', blank ? '_blank' : '_self').append($icon, label))

    $li.click((e) => {
      if (onClick) {
        onClick(this.getHelper(e))
      }

      if (this.onAnyOptionClick) {
        this.onAnyOptionClick(e)
      }

      this.hide()
      e.stopPropagation()
    })

    this.list.append($li)

    return this
  }

  prepare (e) {
    if ((this.top + this.left) > 0) {
      this.dropdown.css('top', this.top).css('left', this.left)
    }

    if (this.bindMousePosition) {
      this.dropdown.css('top', e.pageY).css('left', e.pageX)
    }

    if (this.onDynamicShow) {
      var result = this.onDynamicShow()

      this.list.children().each((i, each) => {
        $(each).toggle(!(result[i] == false))
      })
    }
  }

  show (callback) {
    if (this.hasItems() && !this.isLoading) {
      $('.md-dropdown').hide()

      this.dropdown.show()

      if (callback) {
        this.callback(false)
      }
    } else {
      if (callback) {
        this.callback(false)
      }
    }
  }

  onMouseLeave (onMouseLeave) {
    this.onMouseLeave = onMouseLeave
  }

  hide () {
    if (this.dropdown) {
      this.dropdown.hide()
    }
  }
}
