class ImagePreview {
  constructor (element) {
    this.element = element
  }

  delay (num) {
    this.delay = num
    return this
  }

  hover (over, leave) {
    this.element.mouseenter(() => {
      this.cancel = false
      if (over) {
        over(this)
      }
    }).mouseleave(
      () => {
        this.cancel = true
        if (leave) {
          leave(this)
        } else {
          this.remove()
        }
      })

    return this
  }

  show (src) {
    if (src && this.element) {
      clearTimeout(this.timeoutId)
      this.timeoutId = setTimeout(() => {
        if (!this.cancel) {
          runnable(this.element, src)
        }
      }, this.delay || 500)
    }
  }

  remove () {
    clearTimeout(this.timeoutId)

    if ($(this).is(':visible')) {
      $('.image-preview').fadeOut(200, function () {
        $(this).remove()
      })
    } else {
      $('.image-preview').remove()
    }
  }
}

function runnable (element, src) {
  var offset = $(element).offset()

  offset.left += 150
  var minTop = 60
  var maxTop = 340
  offset.top = (offset.top - minTop) < minTop ? minTop : offset.top - minTop
  offset.top = offset.top > maxTop ? maxTop : offset.top

  var $img = $('<img>')
    .addClass('image-preview')
    .offset(offset)
    .hide()
    .attr('src', src)
    .fadeIn()

  $('.image-preview').remove()
  $('body').append($img)
}
