var page = 0
var loading = false
var productsListCount = 0
var selectedSkus = {}
var showAll = false

function loadFromMemory () {
  window.memoryQuery.filters = window.memoryQuery.filters || {}
  if (window.memoryQuery.value) {
    $('#search-input').val(window.memoryQuery.value)
  }

  if (window.memoryQuery.attrs) {
    Object.keys(window.memoryQuery.attrs).forEach((key) => {
      var value = window.memoryQuery.attrs[key]
      var attr = key

      value.split('|').forEach((each) => {
        selectAndPlaceTag(Str.capitalize(each), attr)
      })
    })
  }
}

$(document).ready(() => {
  loadFromMemory()
  loadList()
  bindScrollLoad()
  toggleTagBox()

  $('#search-input').on('keyup', function (e) {
    if (e.which === 13) {
      $('#search-button').trigger('click')
    }
  })

  $('#show-no-quantity').click(() => {
    $('#search-button').focus()
  })

  $('#search-button').click(() => {
    emptyList()
    loadList()
  })

  $('.button').on('keyup', function (e) {
    if (e.which === 13) {
      $(this).click()
    }
  })

  $('.icon-open').click(() => {
    toggleTagBox()
  })

  Dropdown.on($('.menu-dots'))
    .item('/img/copy.png', 'Copiar Skus', (helper) => {
      var val = ''
      if (Object.keys(selectedSkus).length > 0) {
        Object.keys(selectedSkus).forEach((item) => { val += '\n' + item })
      } else {
        $('.sku.copiable').each(function () {
          val += '\n' + $(this).text()
        })
      }

      Util.copySeleted(val)
    })
    .item('/img/mockup.png', 'Gerar Mockups', (helper) => {
      new MockupSelector().onSelect((id) => {
        window.open('/build-multiple-mockups?skus=' + Object.keys(selectedSkus) + '&mockId=' + id, '_blank')
      }).show()
    })
    .item('/img/photo.png', 'Baixar Imagens', (helper) => {
      if (Object.keys(selectedSkus).length > 0) {
        window.open('/stock/multiple-imgs?skus=' + Object.keys(selectedSkus), '_blank')
      }
    })
    .item('/img/print.png', 'Imprimir Relatório', (helper) => {
      if (Object.keys(selectedSkus).length > 0) {
        window.open('/stock/list-export?skus=' + Object.keys(selectedSkus))
      } else {
        window.open('/stock/list-export')
      }
    })
})

function bindScrollLoad () {
  var $pane = $('.content-scroll')
  var $list = $('.content')

  $pane.unbind('scroll').bind('scroll', function () {
    if ((($pane.scrollTop() + $pane.height()) + 1000 >= $list.height()) && !loading) {
      loadList()
    }
  })
}

function emptyList () {
  page = 0
  showAll = false
  productsListCount = 0
  $('.content').empty()
}

function loadList () {
  if (!showAll) {
    page++
    loading = true

    _get('/stock/list-page', {
      page: page,
      query: {
        value: $('#search-input').val(),
        attrs: getAttrsTags(),
        noQuantity: $('#show-no-quantity').is(':checked'),
        filters: !$('.icon-open').hasClass('is-closed') ? getFilters() : {}
      }
    }, (result) => {
      showAll = result.data.length === 0
      loading = false
      result.data.forEach((each, index) => {
        addProductLayout(each, productsListCount)
        productsListCount++
      })

      window.data = result
      bindRangeSlider(result.info)
      showMessageTotals(result.info)
      bindCopiable()
    })
  }
}

function showMessageTotals (info) {
  if (info && window.loggedUser.full) {
    $('.totalization .stock > .value').text(window.Num.points(info.sum_quantity) + ' items')
    $('.totalization .skus > .value').text(window.Num.points(info.count))
    $('.totalization .sell > .value').text(window.Num.money(info.sum_sell / info.sum_quantity))
    $('.totalization .cost > .value').text(window.Num.money(info.sum_cost / info.sum_quantity))

    $('.totalization .mark > .value').text(window.Floa.abs(info.sum_sell / info.sum_cost, 2))
    $('.totalization .marg > .value').text(window.Num.percent(100 - ((info.sum_cost / info.sum_sell) * 100), 2))

    $('.totalization .tsell > .value').text(window.Num.money(info.sum_sell))
    $('.totalization .tcost > .value').text(window.Num.money(info.sum_cost))

    $('.totalization').toggle(window.loggedUser.full)
  }

  $('#totals').text(info ? window.Num.points(info.sum_quantity) + ' items e ' + window.Num.points(info.count) + ' skus' : 'Nenhum produto encontrado.')
}

function addProductLayout (product, index) {
  var img = createImgProduct(product, index)
  var main = createMainProduct(product)

  var $holder = $('<div>').addClass('item-holder').append(img, main)

  $('.content').append($holder)
}

function createImgProduct (product, index) {
  var checkBoxId = 'check-' + index

  var checked = $('<input>', {
    type: 'checkbox'
  }).attr('id', checkBoxId).css('display', 'none')

  var img = $('<img>')
    .attr('src', product.image)
    .addClass('thumb')
    .attr('onerror', "this.src='/img/product-placeholder.png'")

  var counter = $('<label>').addClass('counter-circle').append((productsListCount + 1))

  new ImagePreview(img).hover((self) => {
    _get('/product/image', { sku: product.sku }, (product) => {
      self.show(product.image)
    })
  })

  var imgHolder = $('<div>').addClass('item-img-holder')
  imgHolder.append(counter, img)

  var label = $('<label>')
    .addClass('check-label')
    .attr('for', checkBoxId)
    .append(imgHolder)

  return $('<div>').append(checked, label)
    .click({
      index: index,
      sku: product.sku
    }, function (event) {
      toggleChecked(event.data.index, event.data.sku)
      return false
    })
}

function toggleChecked (index, sku, check) {
  var checkBox = $('#check-' + index)
  checkBox.prop('checked', check === undefined ? !checkBox.is(':checked') : check)

  if (selectedSkus[sku]) {
    delete selectedSkus[sku]
  } else {
    selectedSkus[sku] = true
  }
}

function createMainProduct (product) {
  var title = createTitle(product)
  var tags = createTags(product)

  return $('<div>').addClass('item-content-holder').append(title, tags)
}

function createTitle (product) {
  var name = $('<span>').addClass('name').append(product.name).click(() => {
    if (product.url) {
      window.open(product.url, '_blank')
    }
  })

  var sku = $('<span>').text(product.sku).addClass('sku copiable').dblclick(function () {
    window.open(
      '/product/page?sku=' + $(this).text(),
      '_blank' // <- This is what makes it open in a new window.
    )
  })

  var diagIcon = $('<img>').addClass('diag-alert').attr('src', '/img/alert.png')

  _get('/diagnostics/fixes', { sku: product.sku, groupped: true }, (all) => {
    if (all.length > 0) {
      diagIcon.fadeIn()
      diagIcon.click(() => {
        window.open('/diagnostics?sku=' + product.sku, '_blank')
      })
      new Tooltip(diagIcon[0], all[0].fixes[0].name).load()
    }
  })
  var div = $('<div>').addClass('title-holder').append(sku, name, diagIcon)

  return div
}

function createTags (product) {
  var $brand = createClickableTag(product.brand, 'brand')

  var $cat = []
  if (product.category) {
    product.category.split(',').forEach((each) => {
      $cat.push(createClickableTag(each.trim(), 'category'))
    })
  }

  var $gender = createClickableTag(product.gender, 'gender')
  var $color = createClickableTag(product.color, 'color')
  var $season = createClickableTag(product.season, 'season')
  var $manufacturer = createClickableTag(product.manufacturer, 'manufacturer')

  var $age = []
  if (product.age) {
    product.age.split(',').forEach((each) => {
      $age.push(createClickableTag(each.trim(), 'age'))
    })
  }

  var $year = createClickableTag(product.year, 'year')

  var $price = createSingleTag(Num.money(product.price))
  var $quantity = createSingleTag(Num.points(product.quantity)).addClass('quantity-label')

  var rightCols = []

  if (loggedUser.full) {
    $totalCost = createSingleTag(Num.format(product.quantity * product.cost))
    $totalSell = createSingleTag(Num.format(product.quantity * product.price))
    $cost = createSingleTag(Num.money(product.cost))

    rightCols.push($('<div>').addClass('item-right-holder').append($totalSell, $totalCost))
    rightCols.push($('<div>').addClass('item-right-holder').append($price, $cost))
  }

  rightCols.push($('<div>').addClass('item-right-holder').append($quantity))

  var $tagsHolder = $('<div>').addClass('tags-holder')
  $tagsHolder.append($brand, $manufacturer, $cat, $gender, $color, $season, $age, $year, ...rightCols)

  return $tagsHolder
}

function createClickableTag (value, attr) {
  if (value) {
    var tag = createSingleTag(value, attr)
    applyTagColor(tag)
    tag.click(function () {
      var value = $(this).data('value')

      if ($(this).hasClass('selected-tag')) {
        $(this).remove()
      } else {
        selectAndPlaceTag(value, attr)
      }

      $('#search-button').focus()
    })

    return tag
  }
}

function selectAndPlaceTag (value, attr) {
  var find = $('.tag-box').find("[data-attr='" + attr + "'][data-value='" + value + "']")

  if (find.length == 0) {
    var tag = createClickableTag(value, attr)
    tag.addClass('selected-tag')

    applyTagColor(tag)

    $('.tag-box').append(tag)

    if (!$('.tag-box-holder').is(':visible')) {
      toggleTagBox(true)
    }
  }
}

function createSingleTag (value, attr) {
  return $('<span>').addClass('tag').append(value)
    .attr('data-value', value.toString().toLowerCase())
    .attr('data-attr', attr ? attr.toLowerCase() : '')
}

function applyTagColor (tag) {
  var attr = tag.data('attr')
  var value = tag.data('value')

  if (attr) {
    var color

    Colors.items.forEach((each) => {
      if (attr == 'color' && each.name == value) {
        color = each.value
        if (!color || Util.colorBrightness(color) > 230) {
          return tag
        }
      }
    })

    if (color) {
      weakColor = color + '07'
    } else {
      color = Util.strToColor(value)
      weakColor = Util.strToColor(value, '0.07')
    }

    if (tag.hasClass('selected-tag')) {
      tag.css('color', 'white')
      weakColor = color
    }

    tag
      .css('border', '1.4px solid ' + color)
      .css('background', weakColor)
      .css('border-bottom-width', '3px')
  }
}

function getAttrsTags () {
  var attrs = {}

  $('.tag-box').children('.tag').each(function () {
    var attr = $(this).data('attr')
    var value = $(this).data('value')

    attrs[attr] = attrs[attr] ? attrs[attr] + '|' + value : value
  })

  return attrs
}

function getFilters () {
  var filters = {}

  $('.range-slider-holder').each(function () {
    var attr = $(this).data('attr')
    var min = $(this).attr('data-min')
    var max = $(this).attr('data-max')

    filters[attr] = [min, max]
  })
  if (Object.keys(filters).length) return filters

  return undefined
}

function toggleTagBox (forceOpen) {
  if ($('.icon-open').hasClass('is-closed') || forceOpen) {
    $('.icon-open').addClass('is-open').removeClass('is-closed')
    $('.tag-box-holder').show()
  } else {
    $('.icon-open').removeClass('is-open').addClass('is-closed')
    $('.tag-box-holder').hide()
  }
}

function bindRangeSlider (data) {
  new RangeSlider($('.cost-filter'))
    .setRange(data.smaller_cost, data.gretter_cost)
    .setTitle('Filtrar por Custo')
    .setPrefix('R$')
    .setOnSlideStop((val) => {
      window.memoryQuery.filters.cost = val
    })
    .build()

  new RangeSlider($('.price-filter'))
    .setRange(data.smaller_sell, data.gretter_sell)
    .setTitle('Filtrar por Preço')
    .setPrefix('R$')
    .setOnSlideStop((val) => {
      window.memoryQuery.filters.price = val
    })
    .build()
}
