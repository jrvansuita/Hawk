var rangeDatePicker = null;

$(document).ready(() => {
  rangeDatePicker = new RangeDatePicker();
  rangeDatePicker
    .holder('.date-filter-holder')
    .setTitles('Data de Início', 'Data de Fim')
    .setPos()
    .setToday()
    .load()
    .then(() => {
      if (!queryId) {
        onSearchData();
      }
    });

  $('#show-skus').on('keyup', function (e) {
    if (e.which == 13) {
      $('#search-button').trigger('click');
    }
  });
  $('.arrow-order').click(function () {
    $(this).toggleClass('arrow-asc');
    $(this).data('order', $(this).data('order') === 'asc' ? 'desc' : 'asc');
  });

  Dropdown.on('.detailed-menu')
    .item('/img/paper.png', 'Visão Detalhada', detailedView)
});

function detailedView() {
  _post('/performance/stock-dashboard-detailed', getQueryData(), (data) => {
    window.detailed = data.data
    window.open('/performance/stock/detailed-view')
  })
}

function onSearchData(id) {
  loadingPattern(true);

  if (id) {
    _post('/performance/stock-dashboard-data', { id: id }, onHandleResult);
  } else {
    _post('/performance/stock-dashboard-data', getQueryData(), onHandleResult);
  }
}

function getQueryData() {
  return {
    begin: $('#date-begin').data('begin'),
    end: $('#date-end').data('end'),
    value: $('#search-input').val().trim(),
    attrs: tagsHandler.get(),
    showSkus: parseInt($('#show-skus').val()),
    order: $('.arrow-order').data('order'),
  };
}

function onHandleResult(result) {
  console.log(result.data)
  loadingPattern(false);
  setAttrsAndValue(result.query.value, result.query.attrs);
  toggleOrderInfo(result.query.order);
  rangeDatePicker.setDates(result.query.begin, result.query.end);
  setUrlId(result.id);

  $('#show-skus').val(result.query.showSkus || 25);

  if (result.data.count) {
    buildBoxes(result);
  } else {
    $('.no-data').show();
  }
}

function buildBoxes(results) {
  var data = results.data;

  loadMainBoard(results.data);

  var box = new BoxBuilder().group('Estações', data.season.length);
  data.season.forEach((each) => {
    box.square(each.name, each.items, Num.percent((each.items * 100) / data.items, true), Num.format(each.total), 'season', each.name, data.season[0].items);
  });

  box.group('Gêneros', data.gender.length, 'gray');
  data.gender.forEach((each) => {
    box.square(each.name, each.items, Num.percent((each.items * 100) / data.items, true), Num.format(each.total), 'gender', each.name, data.gender[0].items);
  });
  box.build();

  var box = new BoxBuilder('3/5').group('Categorias', data.category.length).hidableItems(15);
  data.category.forEach((each) => {
    box.square(each.name, each.items, Num.percent((each.items * 100) / data.items, true), Num.format(each.total), 'category', each.name, data.category[0].items);
  });
  box.build();

  if (data.size && data.size.length) {
    box.group('Tamanhos', data.size.length, 'gray').hidableItems(10);
    data.size.forEach((each) => {
      box.square(each.name, each.items, Num.percent((each.items * 100) / data.items, true), null, null, null, data.size[0].items);
    });
  }

  if (data.chart && data.chart.length > 1) {
    loadCharts(data);
  }

  var box = new BoxBuilder('1/3').group('Fabricantes', data.manufacturer.length).hidableItems(20);
  data.manufacturer.forEach((each) => {
    var markup = each.total / each.cost;
    var subLevel = markup > 2.19 ? 1 : markup < 1.8 ? -1 : 0;
    box.square(each.name, each.items, Floa.abs(each.sumScore / each.count, 2), Floa.abs(markup, 2), 'manufacturer', each.name, data.manufacturer[0].items, true, subLevel);
  });
  box.build();

  var box = new BoxBuilder('3/5').group('Marcas', data.brand.length).hidableItems(15);
  data.brand.forEach((each) => {
    box.square(each.name, each.items, Num.percent((each.items * 100) / data.items, true), Num.format(each.total), 'brand', each.name, data.brand[0].items);
  });
  box.build();

  buildSkusBox(data);

  setTimeout(() => {
    tagsHandler.bind();
  }, 400);
}

function bindImagePreview() {
  $('.box-img').each(function (e) {
    new ImagePreview($(this)).delay(700).hover((self) => {
      _get('/product/image', { sku: $(this).parent().data('sku') }, (product) => {
        self.show(product.image);
      });
    });
  });
}

function bindTooltipManufacturer() {
  new Tooltip('.box-img-col')
    .propsOnShow((el) => ({ content: $(el).data('manufacturer') }))
    .autoHide(10000)
    .load();
}

function buildSkusBox(data) {
  if (data.sku) {
    var scoreStyling = (each) => {
      return ($score) => {
        var color = each.score > 10 ? '#09c164' : each.score >= 6 ? '#0eb7a6' : false;
        if (color) return $score.css('background', color).css('transform', 'scale(1)');
        if (each.score <= 4) {
          $score.hide();
        }
      };
    };

    var box = new BoxBuilder('1/5').specialClass('skus-grid').group('Produtos', data.sku.length);
    data.sku.forEach((each) => {
      var click = () => {
        window.open('/product/url-redirect?sku=' + each.name, '_blank');
      };

      var subDblClick = (e) => {
        e.stopPropagation();
        window.open('/product/page?sku=' + each.name, '_blank');
      };

      box
        .img('/product/image-redirect?sku=' + each.name, each.items, each.stock, each.name, 'copiable', Math.trunc(each.score), click, null, subDblClick, scoreStyling(each))
        .get()
        .data('sku', each.name)
        .data('manufacturer', each.manufacturer);
    });

    var more = data.skusCount - data.sku.length;

    if (more) {
      box
        .moreImg(data.skusCount - data.sku.length, 'Ver Mais', () => {
          $('#show-skus').val(data.skusCount);
          $('#search-button').trigger('click');
        })
        .get()
        .data('manufacturer', 'Ver Mais');
    }

    box.build().then(() => {
      bindImagePreview();
      bindCopyable();
      bindTooltipManufacturer();
    });
  }
}

function toggleOrderInfo(order) {
  $('.arrow-order').data('order', order);

  if (order === 'asc') $('.arrow-order').addClass('arrow-asc');

  var msg = order === 'asc' ? 'Crescente' : 'Decrescente';

  new Tooltip('.arrow-order', msg).autoHide(10000).load();
}

function loadMainBoard(data) {
  if (window.loggedUser?.type === 0) {
    new BoxBuilder()
      .group('Faturamento', Num.points(data.items) + (data.daysCount > 1 ? ' em ' + data.daysCount + ' dias' : ''), 'min-col')
      .info('Valor', Num.money(data.total), 'high-val')
      .info('Ticket', Num.money(data.tkm))
      .info('Markup', Floa.abs(data.markup, 2))
      .info('Skus', Num.points(data.skusCount || 0))
      .info('Disponível', Num.points(data.sumStock) + ' itens')
      .info('Faturado', Num.percent(data.percSold))
      .info('Abrangência', Math.max(1, Num.int(data.stockCoverage)) + ' Dia(s)')
      .info('Score Geral', Floa.abs(data.score, 2))
      .group(null, null, 'gray min-col')
      .info('Custo', Num.money(data.cost))
      .info('Ticket', Num.money(data.tkmCost))
      .info('Margem Bruta', Num.percent((data.profit * 100) / data.total), data.profit ? 'green-val' : 'red-val')
      .info('Lucro Bruto', Num.money(data.profit), data.profit ? 'green-val' : 'red-val')
      .build();
  } else {
    new BoxBuilder()
      .group('Estoque', Num.points(data.items) + (data.daysCount > 1 ? ' em ' + data.daysCount + ' dias' : ''), 'min-col')
      .info('Disponível', Num.points(data.sumStock) + ' itens')
      .info('Skus', Num.points(data.skusCount || 0))
      .info('Faturado', Num.percent(data.percSold))
      .info('Abrangência', Math.max(1, Num.int(data.stockCoverage)) + ' Dia(s)')
      .info('Score Geral', Floa.abs(data.score, 2))
      .group(null, null, 'gray min-col')
      .info('Receita Total', Num.money(data.cost))
      .info('Média Un.', Num.money(data.tkmCost))
      .build();
  }
}

function loadCharts(data) {
  if (window.loggedUser?.type === 0) {
    var box = new BoxBuilder().group('Receita do Período', Num.money(data.total)).group(null, null, 'gray');

    var row = box.get();

    new StockDashChart(row, data.chart)
      .field({ label: 'Receita', tag: 'sum_total', color: '#3e55ff' })
      .field({ label: 'Lucro', tag: 'sum_profit', color: '#03c184' })
      .field({ label: 'Custo', tag: 'sum_cost', color: '#f98929' })
      .load();

    box.build();

    var box = new BoxBuilder().group('Estoque do Período', Num.points(data.sumStock)).group(null, null, 'gray');
    var row = box.get();
    new StockDashChart(row, data.chart)
      .field({ label: 'Disponibilidade', tag: 'sum_stock', color: '#03c184' })
      .field({ label: 'Estoque Faturado', tag: 'sum_quantity', color: '#996ef4' })
      .field({ label: 'Faturado (%)', tag: 'perc_sold', color: '#25d4f3' })
      .load();

    box.build();
  } else {
    var box = new BoxBuilder().group('Receita do Período', Num.money(data.cost)).group(null, null, 'gray');

    var row = box.get();

    new StockDashChart(row, data.chart).field({ label: 'Custo', tag: 'sum_cost', color: '#f98929' }).load();

    box.build();

    var box = new BoxBuilder().group('Estoque do Período', Num.points(data.sumStock)).group(null, null, 'gray');
    var row = box.get();
    new StockDashChart(row, data.chart).field({ label: 'Estoque Faturado', tag: 'sum_quantity', color: '#996ef4' }).field({ label: 'Faturado (%)', tag: 'perc_sold', color: '#25d4f3' }).load();

    box.build();
  }
}
