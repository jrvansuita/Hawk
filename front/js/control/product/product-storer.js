var refreshBroadcast;

$(document).ready(() => {
  //testingData();
  onBindViewValues();

  product = Util.keepPrimitiveAttrs(product);

  refreshBroadcast = new Broadcast('post-refresh-storing-product').onReceive(onProductRefreshed);

  bindComboBox($('#brand'), 'marca');
  bindComboBox($('#manufacturer'), 'manufacturer');
  bindComboBox($('#category'), 'departamento');
  bindComboBox($('#gender'), 'genero');
  bindComboBox($('#season'), 'season');
  bindComboBox($('#year'), 'colecao');
  bindComboBox($('#color'), 'color');
  bindComboBox($('#material'), 'material');
  bindComboBox($('#occasion'), 'ocasiao');


  onBindViewsListeners();
  loadAndKeepCachedAllSizes();
});

function bindComboBox(el, data, limit){
  new ComboBox(el, typeof data == 'string' ? '/stock/storer-attr?attr='+ data : data)
  .setAutoShowOptions(true)
  .callOnChangeEventBySelecting(true)
  .setLimit(limit)
  .setOnItemBuild((item, index)=>{
    return {text : item.description};
  }).load();
}


function testingData(){
  product.codigo = 'JRTESTE';
  product.nome = 'PRODUTO TESTE JR';
  product.cf = '6104.22.00';
  product.Departamento = 'Conjunto';
  product.Material = 'Moletom';
  product.Cor = 'Azul';
  product.markup = '2,3';
  product.precoCusto = '10';
}

function onBindViewsListeners(){
  $('.save').click(() => { _post('/stock/storer-insert', getData(), (data) => { console.log(data); }); });
  $('.delete').click(() => { _post('/stock/storer-delete', getData(), (data) => { console.log(data); }) });

  $("input[type='text']").on("click", function () {
    $(this).select();
  });

  $('.money').change(function () {
    $(this).val(Num.money(Num.moneyVal($(this).val())));
  });

  $('.sizes-box').click(() => {
    addNewSizeInput();
  });

  $('.bindable').change(function () {
    product[$(this).data('bind')] = $(this).val();
  });

  $('.size-group-button').click(function () {
    product.ageRange = [$(this).data('val')].concat(product.ageRange).filter(Boolean);
    refreshBroadcast.emit(getData());
  }).keypress(function(e) {
    if(e.which == 13) $(this).click()
  });

  $('.call-refresh').change(function () {
    refreshBroadcast.emit(getData());
  });
}

function onBindViewValues(){
  $('.bindable').each((i, each) => {
    if($(each).hasClass('money')){
      $(each).val(Num.money(Floa.floa(product[$(each).data('bind')])));
    }else{
      $(each).val(product[$(each).data('bind')]);
    }
  });

  //Exceptions Handling
  $('#markup').val(Floa.abs(Floa.floa(product.preco)/Floa.floa(product.precoCusto),2));
}


function getData(){
  product.markup = $('#markup').val();
  product.precoCusto = Num.moneyVal($('#cost').val());
  product.sizes = $('.add-size-input').map((i,each)=>{
    return $(each).text();
  }).toArray();

  return product;
}


function onProductRefreshed(data){
  product = data;
  onBindViewValues();
  onSizesRefreshed(data);
}

function onSizesRefreshed(data){
  if (data.sizes){
    $('.sizes-box').empty();
    data.sizes.forEach((size) => {
      addNewSizeInput(size);
    });
  }

  if (data.ageRange){
    $('.size-group-button').removeClass('active');
    data.ageRange.forEach((each) => {
      $('.size-group-button[data-val="'+each+'"]').addClass('active');
    });
  }
}


var cachedSizes;

function loadAndKeepCachedAllSizes(callback){
  if (cachedSizes){
    callback(cachedSizes);
  }else{
    _get('/stock/storer-attr?attr=tamanho',{}, (data) => {
      cachedSizes = data;
      if (callback){
        callback(data);
      }
    });
  }
}


function addNewSizeInput(size){
  var $input = $('<span>').addClass('add-size-input').attr('contenteditable', true);
  $('.sizes-box').append($input);

  $input.click((e) => {
    $input.remove();
    e.stopPropagation();
    e.preventDefault();
  }).keypress((e)=>{
    if(e.which == 13) {e.preventDefault(); addNewSizeInput();}
  }).focusout(() => {
    if (!$input.text()) $input.remove()
  });

  if (size) { $input.text(size) } else{ $input.focus() }

  loadAndKeepCachedAllSizes((sizes) => {
    bindComboBox($input, sizes, 5);
  });
}
