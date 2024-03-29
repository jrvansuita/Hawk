var costRangeFilter = null;
var priceRangeFilter = null;
$(document).ready(() => {
  if (!queryId) onSearchData();

  $('.tag-box-holder').hide();

  $('.icon-open').click(function () {
    if ($(this).hasClass('is-open')) {
      $(this).removeClass('is-open').addClass('is-closed');
      $('.tag-box-holder').hide();

      costRangeFilter = null;
      priceRangeFilter = null;
      tagsHandler.clear();
    } else {
      $(this).addClass('is-open').removeClass('is-closed');
      $('.tag-box-holder').show();
    }
  });
});

function openBarWhenPricesFiltersAreOn(areOn) {
  if (areOn && !$('.icon-open').hasClass('is-open')) {
    $(this).addClass('is-open').removeClass('is-closed');
    $('.tag-box-holder').show();
  }
}

function buildRangeSlider({ data, query }) {
  if (query?.filters?.cost) {
    openBarWhenPricesFiltersAreOn(true);
    costRangeFilter = query.filters.cost;
  }

  new RangeSlider($('.cost-range-filter'))
    .setTitle('Preço de custo')
    .setPrefix('R$')
    .setRange(data.smallestCost, data.greaterCost)
    .setOnSlideStop((range) => {
      costRangeFilter = range;
    })
    .build();

  if (query?.filters?.price) {
    openBarWhenPricesFiltersAreOn(true);
    priceRangeFilter = query.filters.price;
  }

  new RangeSlider($('.price-range-filter'))
    .setTitle('Preço de Venda')
    .setPrefix('R$')
    .setRange(data.smallestPrice, data.greaterPrice)
    .setOnSlideStop((range) => {
      priceRangeFilter = range;
    })
    .build();
}

function onSearchData(id) {
  loadingPattern(true);
  if (id) {
    _post('/stock/board-data', { id: id }, handleResult);
  } else {
    _post('/stock/board-data', getQueryData(), handleResult);
  }
}

function getQueryData() {
  var result = {
    value: $('#search-input').val().trim(),
    attrs: tagsHandler.get(),
    showSkus: parseInt($('#show-skus').val()),
  };

  if (priceRangeFilter != null) {
    result.filters = { price: priceRangeFilter, ...result.filters };
  }

  if (costRangeFilter != null) {
    result.filters = { cost: costRangeFilter, ...result.filters };
  }

  return result;
}

function handleResult(data) {
  loadingPattern(false);
  setAttrsAndValue(data.query.value, data.query.attrs);
  setUrlId(data.id);

  // buildRangeSlider(data);
  buildBoxes(data.data);
}

function buildBoxes(data) {
  if (data.total > 0) {
    buildTotalBox(data);

    buildSeasonBox(data);
    buildCategoryBox(data);

    buildYearsBox(data);
    buildGenderBox(data);
    buildColorsBox(data);

    buildManufacturerBox(data);
    buildBrandBox(data);

    buildProductsBox(data);
  }

  setTimeout(() => {
    tagsHandler.bind();
  }, 400);
}

function buildTotalBox(data) {
  var box = new BoxBuilder();
  box
    .group('Estoque Total', null, 'min-col')
    .info('Itens', Num.points(data.total), 'high-val', null, 'chart')
    .info('Skus', Num.points(data.skusCount), null, null, 'box')
    .info('Categorias', data.category.length, null, null, 'category')
    .info('Marcas', data.brand.length, null, null, 'tags')
    .info('Cores', data.color.length, null, null, 'color')
    .group('Custo de Estoque', null, 'gray')
    .info('Custo Total', Num.format(data.cost))
    .info('Un. Custo', Num.money(data.tkmCost));

  if (window.loggedUser?.type === 0) {
    box
      .info('Markup', Floa.abs(data.markup, 2))
      .info('Un. Venda', Num.money(data.value / data.total))
      .info('Total Venda', Num.format(data.value));
  }

  box.build();
}

function buildYearsBox(data) {
  var box = new BoxBuilder();
  box.group('Coleções', data.year.length, '');
  data.year.forEach((each) => {
    box.square(each.name, each.total, Num.percent((each.total * 100) / data.total, true), Num.format(each.count), 'year', each.name, data.year[0].total, null, null, each.balance);
  });
  box.build();
}

function buildGenderBox(data) {
  var box = new BoxBuilder();

  box.group('Gêneros', data.gender.length, '');
  data.gender.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent((each.total * 100) / data.total, true), Num.format(each.count), 'gender', each.name, data.gender[0].total, null, null, each.balance);
  });
  box.build();
}

function buildSeasonBox(data) {
  var box = new BoxBuilder();

  box.group('Estações', data.season.length);
  data.season.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent((each.total * 100) / data.total, true), Num.format(each.count), 'season', each.name, data.season[0].total, null, null, each.balance);
  });

  box.build();
}

function buildCategoryBox(data) {
  var box = new BoxBuilder('3/5').group('Categorias', data.category.length).hidableItems(15);

  data.category.forEach((each) => {
    box.square(
      Str.capitalize(each.name),
      each.total,
      Num.percent((each.total * 100) / data.total, true),
      Num.format(each.count),
      'category',
      each.name,
      data.category[0].total,
      null,
      null,
      each.balance
    );
  });

  box.build();
}

function buildColorsBox(data) {
  var box = new BoxBuilder('3/5');

  box.group('Cores', data.color.length).hidableItems(15);
  data.color.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent((each.total * 100) / data.total, true), Num.format(each.count), 'color', each.name, data.color[0].total, null, null, each.balance);
  });

  box.build();
}

function buildManufacturerBox(data) {
  var box = new BoxBuilder('1/3').group('Fabricante', data.manufacturer.length).hidableItems(15);

  data.manufacturer.forEach((each) => {
    box.square(
      Str.capitalize(each.name),
      each.total,
      Num.percent((each.total * 100) / data.total, true),
      Num.format(each.count),
      'manufacturer',
      each.name,
      data.manufacturer[0].total,
      null,
      null,
      each.balance
    );
  });
  box.build();
}

function buildBrandBox(data) {
  var box = new BoxBuilder('3/5').group('Marcas', data.brand.length).hidableItems(15);

  data.brand.forEach((each) => {
    box.square(Str.capitalize(each.name), each.total, Num.percent((each.total * 100) / data.total, true), Num.format(each.count), 'brand', each.name, data.brand[0].total, null, null, each.balance);
  });
  box.build();
}

function buildProductsBox(data) {
  var box = new BoxBuilder('1/5').group('Produtos', data.sku.length);

  data.sku.forEach((each) => {
    var click = () => {
      window.open('/product/url-redirect?sku=' + each.name, '_blank');
    };

    var subDblClick = (e) => {
      e.stopPropagation();
      window.open('/product/page?sku=' + each.name, '_blank');
    };

    box
      .img('/product/image-redirect?sku=' + each.name, Num.format(each.total), null, each.name, 'copiable', null, click, null, subDblClick)
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
