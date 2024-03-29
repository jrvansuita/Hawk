
$(document).ready(() => {
  rangeDatePicker = new RangeDatePicker()
  rangeDatePicker.holder('.date-filter-holder')
    .setTitles('Data de Início', 'Data de Fim')
    .setPos()
    .load()
    .then(() => {
      if (!queryId) {
        onSearchData()
      }
    })
})

function onSearchData (id) {
  loadingPattern(true)

  if (id) {
    _post('/performance/sales-dashboard-data', { id: id }, onHandleResult)
  } else {
    _post('/performance/sales-dashboard-data', {
      begin: $('#date-begin').data('begin'),
      end: $('#date-end').data('end'),
      value: $('#search-input').val().trim(),
      attrs: tagsHandler.get()
    }, onHandleResult)
  }
}

function onHandleResult (result) {
  loadingPattern(false)
  setAttrsAndValue(result.query.value, result.query.attrs)
  rangeDatePicker.setDates(result.query.begin, result.query.end)
  setUrlId(result.id)
  if (result.data.count) {
    buildBoxes(result)
  } else {
    $('.no-data').show()
  }
}

function buildBoxes (results) {
  var data = results.data
  console.log(results)

  new BoxBuilder()
    .group('Geral', data.count, 'min-col')
    .info('Valor Faturado', Num.money(data.total), 'high-val')
    .info('Desconto', Num.money(data.discount), 'high-val')
    .info('Ticket', Num.money(data.tkm))
    .info('Custo Produtos', Num.money(data.cost))
    .info('Frete', Num.money(data.freight))
    .info('Recompra', Num.percent((data.repurchaseCount * 100) / data.count))
    .info('Peso', Floa.weight(data.weight) + 'Kg')
    .info('R$/Kg', Num.money(data.total / data.weight))
    .info('Margem Bruta', Num.percent((data.profit * 100) / data.total), data.profit ? 'green-val' : 'red-val')
    .info('Lucro Bruto', Num.money(data.profit), data.profit ? 'green-val' : 'red-val')

    .group('Produtos', Num.points(data.items), 'gray')
    .info('Med. Custo', Num.money(data.avgCost))
    .info('Markup', Floa.abs(data.markup, 3))
    .info('Med. Venda', Num.money(data.avgSell))
    .info('Med. Pedido', Floa.abs(data.avgItems, 3))
    .build()

  var box = new BoxBuilder()
    .group('Estados', data.uf.length)
  data.uf.forEach((each) => {
    box.square(each.name, each.count, Num.percent(each.count * 100 / data.count, true), Num.format(each.total), 'uf', each.name, data.uf[0].count)
  })
  box.build()

  var box = new BoxBuilder()
    .group('Cidades', data.city.length)
  data.city.forEach((each) => {
    box.square(each.name, each.count, Num.format(each.total), null, 'city', each.name, data.city[0].count)
  })
  box.build()

  var box = new BoxBuilder()
    .group('Pagamentos', data.paymentType.length)
  data.paymentType.forEach((each) => {
    box.square(window.paymentTypes?.[each.name]?.name, each.count, Num.percent(each.count * 100 / data.count, true), Num.format(each.total), 'paymentType', each.name, data.paymentType[0].count)
  })

  box.group('Cupons', data.coupom.length, 'gray coupom-box').hidableItems(16)
  data.coupom.forEach((each) => {
    box.toast(each.name, each.count, 'coupom', 'coupom')
  })
  box.build()

  var table = new BoxBuilder().table()
    .row('header')
    .col('')
    .col('Pedidos', 'high-val')
    .col('Total')
    .col('Ticket')
    .col('%', 'middle')
    .col('Prazo Min.')
    .col('Prazo Máx.')
    .col('Prazo Méd.', 'high-val')
    .col('Valor Min.')
    .col('Valor Máx.')
    .col('Valor Méd.', 'high-val')
    .col('% Ped.')
    .col('Total ' + data.transport.length)

  data.transport.forEach((each) => {
    table.row()
      .col(each.name, 'super high-val', 'transport', each.name)
      .col(each.count, 'super high-val')
      .col(Num.format(each.total))
      .col(Num.parse(each.total / each.count, true))
      .col(Num.percent((each.count * 100) / data.count))
      .col(each.minDT, 'middle')
      .col(each.maxDT, 'middle')
      .col(Num.int(each.countDT / each.count) + ' dias', 'high-val')
      .col(Num.parse(each.minValue))
      .col(Num.parse(each.maxValue))
      .col(Num.parse(each.totalValue / each.count), 'high-val')
      .col(Num.percent((each.totalValue * 100) / each.total))
      .col(Num.parse(each.totalValue), 'min-val')
  })

  table.row('footer')
    .col()
    .col(data.count, 'high-val')
    .col(Num.format(data.total))
    .col()
    .col()
    .col()
    .col()
    .col(Num.int(data.transportSummary.countDT / data.count) + ' dias', 'high-val')
    .col()
    .col()
    .col(Num.format(data.transportSummary.totalValue / data.count), 'high-val')
    .col(Num.percent((data.freight * 100) / data.total))
    .col(Num.format(data.transportSummary.totalValue), 'min-val')

  table.build().then(() => {
    tagsHandler.bind()
  })

  if (loggedUser.full) {
    buildCostsBox(results)
  }
}

function buildCostsBox (results) {
  new CostsBoxBuilder(results.data.costs, results.data.total)
    .inputGroup('Custos', Dat.monthDif(parseInt(results.query.begin), Dat.lastDayOfLastMonth()) == 0)
    .field('Marketing', 'marketing')
    .field('Imposto', 'tax')
    .field('Frete', 'freight')
    .field('Custo Produtos', 'productCost')
    .field('Tecnologia', 'tech')
    .field('Funcionários', 'employees')
    .field('Operacional', 'operation')
    .field('Empréstimos', 'lend')
    .field('Juros/Taxas', 'interest')
    .field('Estornos/Chargeback', 'chargeback')
    .field('Tx. Cartão Crédito', 'creditcard')
    .field('Tx. Boletos', 'boletos')
    .showPerformance()
}
