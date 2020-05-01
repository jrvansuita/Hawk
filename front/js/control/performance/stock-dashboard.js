
$(document).ready(() => {
  $('#show-skus').on("keyup", function(e) {
    if (e.which == 13){
      $('#search-button').trigger('click');
    }
  });
})

function onSearchData(id){
  loadingPattern(true);

  if (id){
    _post('/stock-dashboard-data', {id: id}, onHandleResult);
  }else{

    _post('/stock-dashboard-data',{
      begin: getDateVal('date-begin', dateBeginPicker),
      end: getDateVal('date-end', dateEndPicker),
      value: $('#search-input').val().trim(),
      attrs: tagsHandler.get(),
      showSkus : parseInt($('#show-skus').val())
    }, onHandleResult);
  }
}


function onHandleResult(result){
  loadingPattern(false);
  setAttrsAndValue(result.query.value, result.query.attrs)
  setDates(result.query.begin, result.query.end)
  setUrlId(result.id);

  $('#show-skus').val(result.query.showSkus || 25);

  if (result.data.count){
    console.log(result);
    buildBoxes(result);
  }else{
    $('.no-data').show();
  }
}


function buildBoxes(results){
  var data = results.data;

  var box = new BuildBox()
  .group('Venda', Num.points(data.items), 'min-col')
  .info('Valor', Num.money(data.total), 'high-val')
  .info('Ticket', Num.money(data.tkm))
  .info('Markup', Num.money(data.markup))
  .group(null, null, 'min-col gray')
  .info('Custo', Num.money(data.cost))
  .info('Ticket', Num.money(data.tkmCost))
  .info('Margem Bruta', Num.percent((data.profit*100)/data.total), data.profit ? 'green-val': 'red-val')
  .info('Lucro Bruto', Num.money(data.profit), data.profit ? 'green-val': 'red-val');



  if ((data.chart).length > 1){
    var row = box.group(null, null, 'gray').get();
    new StockDashChart(row, data.chart).load();
  }



  var box = new BuildBox()
  .group('Estações', data.season.length);
  data.season.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), Num.format(each.total), 'season', each.name, data.season[0].items);
  });

  box.group('Gêneros', data.gender.length, 'gray');
  data.gender.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), Num.format(each.total), 'gender', each.name, data.gender[0].items);
  });




  var box = new BuildBox('3/5')
  .group('Categorias', data.category.length).hidableItems(15);
  data.category.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), Num.format(each.total), 'category', each.name, data.category[0].items);
  });

  box.group('Tamanhos', data.size.length, 'gray').hidableItems(10);
  data.size.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), null, null, null, data.size[0].items);
  });



  var box = new BuildBox('1/3')
  .group('Fabricantes', data.manufacturer.length).hidableItems(20);
  data.manufacturer.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), Num.format(each.total), 'manufacturer', each.name, data.manufacturer[0].items);
  });



  var box = new BuildBox('3/5')
  .group('Marcas', data.brand.length).hidableItems(15);
  data.brand.forEach((each) => {
    box.square(each.name, each.items, Num.percent(each.items*100/data.items, true), Num.format(each.total), 'brand', each.name, data.brand[0].items);
  });


  if (data.sku){
    var box = new BuildBox('1/5')
    .group('Produtos', data.sku.length);
    data.sku.forEach((each) => {
     var click = () => {
       window.open('/product-url-redirect?sku=' + each.name, '_blank');
     }

     var subclick = (e) => {
       e.stopPropagation();
       window.open('/product?sku=' + each.name, '_blank');
     }

      box.img('/product-image-redirect?sku=' + each.name, each.items, each.name, Math.trunc(each.score), click, subclick ).get();
    });
  }


  coloringData();
  tagsHandler.bind();
}
