class TagsHandler {
  bind () {
    var self = this
    $('.taggable').click(function () {
      self.place($(this).data('value'), $(this).data('attr'))
    })
  }

  placeAll (attr) {
    $('.tag-box').find('.tag').remove()
    if (attr) {
      Object.keys(attr).forEach((key) => {
        var values = attr[key].toString().split('|')
        values.forEach((eachValue) => {
          this.place(eachValue, key)
        })
      })
    }
  }

  place (value, attr) {
    var find = $('.tag-box').find("[data-attr='" + attr + "'][data-value='" + value + "']")

    if (find.length === 0) {
      var tag = this.create(value, attr)
      $('.tag-box').append(tag)

      $('#search-button').focus()

      if (!$('.tag-box').is(':visible')) {
        this.toggleTagBox(true)
      }
    }
  }

  create (value, attr) {
    var tag = $('<label>').addClass('tag').append(value || 'Indefinido')
      .attr('data-value', value.toString())
      .attr('data-attr', attr || '')

    this.coloring(tag)
    tag.click(function () {
      $(this).remove()
      $('#search-button').focus()
    })

    return tag
  }

  coloring (tag) {
    var attr = tag.data('attr')
    var value = tag.data('value')

    if (attr) {
      var color = Util.strToColor(value)
      var weakColor = Util.strToColor(value, '0.07')

      tag
        .css('color', 'white')
        .css('border', '1.4px solid ' + color)
        .css('background', color)
        .css('border-bottom-width', '3px')
    }
  }

  toggleTagBox (forceOpen) {
    if($('.tag-box-holder').length) $('.tag-box-holder').show()
    
    if ($('.icon-open').hasClass('is-closed') || forceOpen) {
      $('.icon-open').addClass('is-open').removeClass('is-closed')
      $('.tag-box').show()
    } else {
      $('.icon-open').removeClass('is-open').addClass('is-closed')
      $('.tag-box').hide()
    }
  }

  get () {
    var attrs = {}

    $('.tag-box').children('.tag').each(function () {
      var attr = $(this).data('attr')
      var value = $(this).data('value')
      var key = attr

      attrs[key] = attrs[key] ? attrs[key] + '|' + value : value
    })

    return attrs
  }
}
