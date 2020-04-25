
function onSearchData(id){
  loadingPattern(true);

  if (id){
    _get('/stock-dashboard-data', {id: id}, onHandleResult);
  }else{

    _get('/stock-dashboard-data',{
      begin: getDateVal('date-begin', dateBeginPicker),
      end: getDateVal('date-end', dateEndPicker),
      value: $('#search-input').val(),
      attrs: tagsHandler.get()
    }, onHandleResult);
  }
}


function onHandleResult(result){
  loadingPattern(false);
  setAttrsAndValue(result.query.value, result.query.attrs)
  setDates(result.query.begin, result.query.end)
  setUrlId(result.id);

  if (result.data.count){
    console.log(result);
    buildBoxes(result);
  }else{
    $('.no-data').show();
  }
}


function buildBoxes(results){
  var data = results.data;

  new BuildBox()
  .group('Geral', Num.points(data.items), 'min-col')
  .info('Valor', Num.money(data.total), 'high-val')
  .info('Ticket', Num.money(data.tkm))
  .info('Markup', Num.money(data.markup))
  .info('Custo Produtos', Num.money(data.cost))
  .info('Margem Bruta', Num.percent((data.profit*100)/data.total), data.profit ? 'green-val': 'red-val')
  .info('Lucro Bruto', Num.money(data.profit), data.profit ? 'green-val': 'red-val')




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


  coloringData();
  tagsHandler.bind();
}
