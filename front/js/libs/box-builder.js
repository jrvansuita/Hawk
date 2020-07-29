$(document).ready(() => {
  new FileLoader().css('box-builder').load()
})

class BoxBuilder {
  constructor(gridSpan) {
    this.box = $('<div>').addClass('grid-item shadow')

    this.dependencies = new FileLoader().css('box-builder')

    if (gridSpan) {
      this.box.css('grid-column', gridSpan)
    }
  }

  get() {
    return this.lastItem || this.currentGroup
  }

  group(title, num, clazz = '') {
    var group = $('<div>').addClass('row ' + clazz)
    this.box.append(group)
    if (title) {
      group.append($('<span>').addClass('title').append(title, $('<span>').addClass('right').append(num)))
    }
    this.currentGroup = group
    this.lastItem = null

    return this
  }

  hidableItems(items) {
    this.currentGroup.attr('data-show', items)
    return this
  }

  checkHidableItems() {
    if (this.currentGroup) {
      if (this.currentGroup.find('.col').length > this.currentGroup.data('show')) {
        this.currentGroup.find('.col').last().addClass('hide-item')
        this._spawSeeMore()
      }
    }
  }

  info(label, value, clazz = '', id = '', icon) {
    var col = $('<div>').addClass('col')
    var colContent = $('<div>').addClass('col-content')
    this.currentGroup.append(col)
    var val = $('<span>')
      .addClass('value ' + clazz)
      .append(value)

    if (id) {
      val.attr('id', id)
    }
    if (icon) {
      colContent.append(
        $('<div>').append(
          $('<img>')
            .addClass('icon-col')
            .attr('src', '/img/' + icon + '.png')
        )
      )
    }
    colContent.append($('<div>').append($('<span>').addClass('super').append(label), val))
    col.append(colContent)

    this.lastItem = col

    return this
  }

  toast(label, value, clazz = '', attr, attrVal) {
    var col = $('<div>')
      .addClass('col taggable ' + clazz)
      .data('attr', attr)
      .data('value', attrVal || label)
    this.currentGroup.append(col)
    col.append($('<span>').addClass('super').append(label, $('<span>').addClass('right high-val').append(value)))

    this.checkHidableItems()

    this.lastItem = col

    return this
  }

  square(label, right, sub, value = '', attr, attrVal, max, subHigh, subValLevel, topCircleVal) {
    var col = $('<div>').addClass('col coloring-data').data('max', max).data('cur', right)

    if (attr) {
      col
        .addClass('taggable')
        .data('attr', attr)
        .data('value', attrVal !== 'Indefinido' ? attrVal : '')
    }

    this.currentGroup.append(col)

    col.append(
      $('<span>')
        .addClass('super')
        .append(label, $('<span>').addClass('right').append(Num.format(right)))
    )

    var subLeft = $('<label>')
      .addClass(subHigh ? 'sub-high' : '')
      .append(sub)

    var subVal = $('<span>').addClass('right min-val').append(value)
    col.append($('<span>').addClass('value min-val').append(subLeft, subVal))

    if (subValLevel !== undefined) {
      subVal.toggleClass(subValLevel > 0 ? 'green-val' : subValLevel < 0 ? 'red-val' : '')
    }

    if (topCircleVal) {
      var topDiv = $('<div>')
        .addClass('top-circle-value')
        .addClass(topCircleVal < 0 ? 'red-back' : 'green-back')
      var topValue = $('<span>').append(Num.format(Math.abs(topCircleVal)))
      col.css({ paddingRight: '10px', marginRight: '10px' }).append(topDiv.append(topValue))
    }

    this.checkHidableItems()

    this.lastItem = col

    this._coloringData()
    return this
  }

  img(path, label, barLabel, right, rightClass, score, click, subClick, subDoubleClick, scoreStyling) {
    var col = $('<div>').addClass('col box-img-col')

    this.currentGroup.append(col)

    var img = $('<img>').attr('src', path).attr('onerror', "this.src='/img/product-placeholder.png'").addClass('box-img')
    col.append(img)

    if (barLabel) {
      label += '<span class="bar-label">/' + barLabel + '</span>'
    }

    var $sub = $('<div>')
      .addClass('box-img-sub')
      .append(
        $('<span>')
          .addClass('super')
          .append(
            label,
            $('<span>')
              .addClass('right ' + rightClass)
              .html(right)
          )
      )
      .click(subClick)
      .dblclick(subDoubleClick)

    if (score) {
      var $score = $('<span>').addClass('box-img-score').append(score)
      col.append($score)
      if (scoreStyling) {
        scoreStyling($score)
      }
    }

    col.append($sub)
    col.click(click)

    this.lastItem = col

    return this
  }

  table() {
    var table = $('<table>').addClass('list')
    this.box.append(table)
    this.currentTable = table
    this.box.css('grid-column', '1 / 3')

    return this
  }

  row(clazz = '') {
    var row = $('<tr>').addClass(clazz)
    this.currentTable.append(row)
    this.currentRow = row

    return this
  }

  col(val, clazz = '', attr, attrVal) {
    var row = $('<td>').append(
      $('<span>')
        .addClass('value ' + clazz)
        .append(val)
    )

    if (attr) {
      row.addClass('taggable').data('attr', attr).data('value', attrVal)
    }

    this.currentRow.append(row)
    return this
  }

  _spawSeeMore() {
    if (!this.currentGroup.find('.see-more').length) {
      var hide = $('<span>').addClass('see-more').text('Ver Mais')
      hide.click(() => {
        var toggle = hide.parent().find('.hide-item').first().is(':visible')
        hide.text(toggle ? 'Ver Mais' : 'Ver Menos')

        if (toggle) {
          hide.parent().find('.hide-item').hide()
        } else {
          hide.parent().find('.hide-item').fadeIn().css('display', 'inline-block')
        }
      })

      this.currentGroup.append(hide)
    }
  }

  _coloringData() {
    if (this.lastItem.hasClass('coloring-data')) {
      var perc = this.lastItem.data('cur') / this.lastItem.data('max')
      perc = perc < 0.1 ? 0.1 : perc
      this.lastItem.css('background-color', 'rgba(211, 211, 211, x)'.replace('x', perc))
    }
  }

  specialClass(clazz) {
    this.box.addClass(clazz)
    return this
  }

  async build() {
    await this.dependencies.load()
    $('.content-grid').append(this.box)
  }
}
