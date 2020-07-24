var costRangeFilter = null
var priceRangeFilter = null
$(document).ready(() => {
  if (!queryId) onSearchData()

  $('.tag-box-holder').hide()

  $('.icon-open').click(function () {
    if ($(this).hasClass('is-open')) {
      $(this).removeClass('is-open').addClass('is-closed')
      $('.tag-box-holder').hide()
    } else {
      $(this).addClass('is-open').removeClass('is-closed')
      $('.tag-box-holder').show()
    }
  })
})

function buildRangeSlider (data) {
  new RangeSlider($('.cost-range-filter'))
    .setTitle('Preço de custo')
    .setPrefix('R$')
    .setRange(data.smallestCost, data.gretterCost)
    .setOnSlideStop((range) => {
      costRangeFilter = range
    })
    .build()

  new RangeSlider($('.price-range-filter'))
    .setTitle('Preço de Venda')
    .setPrefix('R$')
    .setRange(data.smallestPrice, data.gretterPrice)
    .setOnSlideStop((range) => {
      priceRangeFilter = range
    })
    .build()
}

function onSearchData (id) {
  loadingPattern(true)
  if (id) {
    _post('/product-board-data', { id: id }, handleResult)
  } else {
    _post('/product-board-data', getQueryData(), handleResult)
  }
}

function getQueryData () {
  return {
    value: $('#search-input').val().trim(),
    attrs: tagsHandler.get(),
    showSkus: parseInt($('#show-skus').val()),
    filters: $('.icon-open').hasClass('is-open') ? getFilters() : {}
  }
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

function handleResult (data) {
  loadingPattern(false)
  console.log(data)
  setAttrsAndValue(data.query.value, data.query.attrs)
  setUrlId(data.id)
  data = data.data

  buildRangeSlider(data)
  buildBoxes(data)
}

function buildBoxes (data) {
  if (data.total > 0) {
    buildTotalBox(data)
    buildSeasonBox(data)
    buildCategoryBox(data)
    buildManufacturerBox(data)
    buildBrandBox(data)
    buildProductsBox(data)
  }

  setTimeout(() => {
    tagsHandler.bind()
  }, 400)
}

function buildTotalBox (data) {
  var box = new BoxBuilder()
  box.group('Total Geral')
    .info('Itens', Num.format(data.total), null, null, 'chart')
    .info('Skus', Num.format(data.skusCount), null, null, 'box')
    .info('Categorias', data.category.length, null, null, 'category')
    .info('Marcas', data.brand.length, null, null, 'tags')
    .info('Cores', data.color.length, null, null, 'color')

  box.group('Ano', data.year.length, 'gray')
  data.year.forEach((each) => {
    box.square(each.name, each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'year', each.name, data.year[0].total, null, null, each.balance)
  })
  box.build()
}

function buildSeasonBox (data) {
  var box = new BoxBuilder()

  box.group('Estações', data.season.length)
  data.season.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'season', each.name, data.season[0].total, null, null, each.balance)
  })

  box.group('Gêneros', data.gender.length, 'gray')
  data.gender.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'gender', each.name, data.gender[0].total, null, null, each.balance)
  })
  box.build()
}

function buildCategoryBox (data) {
  var box = new BoxBuilder('3/5').group('Categorias', data.category.length).hidableItems(15)

  data.category.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'category', each.name, data.category[0].total, null, null, each.balance)
  })
  box.group('Cores', data.color.length).hidableItems(15)
  data.color.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'color', each.name, data.color[0].total, null, null, each.balance)
  })

  box.build()
}

function buildManufacturerBox (data) {
  var box = new BoxBuilder('1/3').group('Fabricante', data.manufacturer.length).hidableItems(15)

  data.manufacturer.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'manufacturer', each.name, data.manufacturer[0].total, null, null, each.balance)
  })
  box.build()
}

function buildBrandBox (data) {
  var box = new BoxBuilder('3/5').group('Marcas', data.brand.length).hidableItems(15)

  data.brand.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent(each.total * 100 / data.total, true), Num.format(each.count), 'brand', each.name, data.brand[0].total, null, null, each.balance)
  })
  box.build()
}

function buildProductsBox (data) {
  var box = new BoxBuilder('1/5').group('Produtos', data.sku.length)

  data.sku.forEach((each) => {
    var click = () => {
      window.open('/stock/product?sku=' + each.name, '_blank')
    }
    box.img('/product-image-redirect?sku=' + each.name, Num.format(each.total), null, each.name, 'copiable', null, click).get().data('manufacturer', each.manufacturer)
  })
  box.build().then(() => {
    bindTooltipManufacturer()
  })
}

function bindTooltipManufacturer () {
  $('.box-img-col').each(function (e) {
    new Tooltip(this, $(this).data('manufacturer'))
      .autoHide(10000).load()
  })
}
