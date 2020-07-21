
$(document).ready(() => {
  $('#show-skus').on('keyup', function (e) {
    if (e.which == 13) {
      $('#search-button').trigger('click')
    }
  })
  $('.arrow-order').click(function () {
    $(this).toggleClass('arrow-asc')
    $(this).data('order', $(this).data('order') === 'asc' ? 'desc' : 'asc')
  })

  /* MaterialDropdown.fromClick($('.menu-dots')).addItem('/img/delete.png', 'Excluir', function(e){
    _post('/stock-dashboard-delete', getQueryData(), (data) => {
      console.log(data);
    });
  }); */
})

function onSearchData (id) {
  loadingPattern(true)

  if (id) {
    _post('/stock-dashboard-data', { id: id }, onHandleResult)
  } else {
    _post('/stock-dashboard-data', getQueryData(), onHandleResult)
  }
}

function getQueryData () {
  return {
    begin: $('#date-begin').data('begin'),
    end: $('#date-end').data('end'),
    value: $('#search-input').val().trim(),
    attrs: tagsHandler.get(),
    showSkus: parseInt($('#show-skus').val()),
    order: $('.arrow-order').data('order')
  }
}

function onHandleResult (result) {
  loadingPattern(false)
  setAttrsAndValue(result.query.value, result.query.attrs)
  toggleOrderInfo(result.query.order)
  rangeDatePicker.setDates(result.query.begin, result.query.end)
  setUrlId(result.id)

  $('#show-skus').val(result.query.showSkus || 25)

  if (result.data.count) {
    buildBoxes(result)
  } else {
    $('.no-data').show()
  }
}

function buildBoxes (results) {
  var data = results.data
  window.data = results.data
  console.log(data)

  var box = new BuildBox()
    .group('Faturamento', Num.points(data.items) + (data.daysCount > 1 ? ' em ' + data.daysCount + ' dias' : ''))
    .info('Valor', Num.money(data.total), 'high-val')
    .info('Ticket', Num.money(data.tkm))
    .info('Markup', Floa.abs(data.markup, 2))
    .info('Skus', Num.points(data.skusCount || 0))
    .info('Disponível', Num.points(data.sumStock) + ' itens')
    .info('Faturado', Num.percent(data.percSold))
    .info('Abrangência', Math.max(1, Num.int(data.stockCoverage)) + ' Dia(s)')
    .info('Score', Floa.abs(data.score, 2))
    .group(null, null, 'gray')
    .info('Custo', Num.money(data.cost))
    .info('Ticket', Num.money(data.tkmCost))
    .info('Margem Bruta', Num.percent((data.profit * 100) / data.total), data.profit ? 'green-val' : 'red-val')
    .info('Lucro Bruto', Num.money(data.profit), data.profit ? 'green-val' : 'red-val')

  if (data.chart && (data.chart.length > 1)) {
    var row = box.group(null, null, 'gray').get()
    new StockDashChart(row, data.chart)
      .field({ label: 'Receita', tag: 'sum_total', color: '#3e55ff' })
      .field({ label: 'Lucro', tag: 'sum_profit', color: '#03c184' })
      .field({ label: 'Custo', tag: 'sum_cost', color: '#f98929' })
      .load()
  }

  var box = new BuildBox()
    .group('Estações', data.season.length)
  data.season.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items * 100 / data.items, true), Num.format(each.total), 'season', each.name, data.season[0].items)
  })

  box.group('Gêneros', data.gender.length, 'gray')
  data.gender.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items * 100 / data.items, true), Num.format(each.total), 'gender', each.name, data.gender[0].items)
  })

  if (data.chart && (data.chart.length > 1)) {
    var row = box.group(null, null, 'gray').get()
    new StockDashChart(row, data.chart)
      .field({ label: 'Disponibilidade', tag: 'sum_stock', color: '#03c184' })
      .field({ label: 'Estoque Faturado', tag: 'sum_quantity', color: '#996ef4' })
      .field({ label: 'Faturado (%)', tag: 'perc_sold', color: '#25d4f3' })
      .load()
  }

  var box = new BuildBox('3/5')
    .group('Categorias', data.category.length).hidableItems(15)
  data.category.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items * 100 / data.items, true), Num.format(each.total), 'category', each.name, data.category[0].items)
  })

  if (data.size && data.size.length) {
    box.group('Tamanhos', data.size.length, 'gray').hidableItems(10)
    data.size.forEach((each) => {
      box.square(each.name, each.items, Num.percent(each.items * 100 / data.items, true), null, null, null, data.size[0].items)
    })
  }

  var box = new BuildBox('1/3')
    .group('Fabricantes', data.manufacturer.length).hidableItems(20)
  data.manufacturer.forEach((each) => {
    var markup = each.total / each.cost
    var subLevel = (markup > 2.19 ? 1 : (markup < 1.8 ? -1 : 0))
    box.square(each.name, each.items, Floa.abs(each.sumScore / each.count, 2), Floa.abs(markup, 2), 'manufacturer', each.name, data.manufacturer[0].items, true, subLevel)
  })

  var box = new BuildBox('3/5')
    .group('Marcas', data.brand.length).hidableItems(15)
  data.brand.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items * 100 / data.items, true), Num.format(each.total), 'brand', each.name, data.brand[0].items)
  })

  buildSkusBox(data)

  coloringData()
  tagsHandler.bind()
  bindImagePreview()
  bindTooltipManufacturer()
  bindCopiable()
}

function bindImagePreview () {
  $('.box-img').each(function (e) {
    new ImagePreview($(this)).delay(700).hover((self) => {
      _get('/product-image', { sku: $(this).parent().data('sku') }, (product) => {
        self.show(product.image)
      })
    })
  })
}

function bindTooltipManufacturer () {
  $('.box-img-col').each(function (e) {
    new Tooltip(this, $(this).data('manufacturer'))
      .autoHide(10000).load()
  })
}

function buildSkusBox (data) {
  if (data.sku) {
    var scoreStyling = (each) => {
      return ($score) => {
        var color = each.score > 10 ? '#09c164' : (each.score >= 6 ? '#0eb7a6' : false)
        if (color) return $score.css('background', color).css('transform', 'scale(1)')
        if (each.score <= 4) {
          $score.hide()
        }
      }
    }

    var box = new BuildBox('1/5')
      .specialClass('skus-grid')
      .group('Produtos', data.sku.length)
    data.sku.forEach((each) => {
      var click = () => {
        window.open('/product-url-redirect?sku=' + each.name, '_blank')
      }

      var subDblClick = (e) => {
        e.stopPropagation()
        window.open('/stock/product?sku=' + each.name, '_blank')
      }

      box.img('/product-image-redirect?sku=' + each.name, each.items, each.stock, each.name, 'copiable', Math.trunc(each.score), click, null, subDblClick, scoreStyling(each))
        .get()
        .data('sku', each.name)
        .data('manufacturer', each.manufacturer)
    })
  }
}

function toggleOrderInfo (order) {
  $('.arrow-order').data('order', order)

  if (order === 'asc') $('.arrow-order').addClass('arrow-asc')

  var msg = order === 'asc' ? 'Ascendente' : 'Descendente'

  new Tooltip('.arrow-order', msg).autoHide(10000).load()
}
