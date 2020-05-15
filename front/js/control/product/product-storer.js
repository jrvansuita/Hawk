var productResult = {};
var refreshBroadcast;

$(document).ready(() => {

  refreshBroadcast = new Broadcast('post-refresh-storing-product').onReceive(onProductRefreshed);

  //testedata();

  $('.save').click(() => {
    _post('/stock/storer-insert', getData(), (data) => {
      console.log(data);
    })
  });

  $('.delete').click(() => {
    _post('/stock/storer-delete', getData(), (data) => {
      console.log(data);
    })
  });

  $("input[type='text']").on("click", function () {
    $(this).select();
  });

  bindComboBox($('#brand'), 'marca');
  bindComboBox($('#manufacturer'), 'manufacturer');
  bindComboBox($('#category'), 'departamento');
  bindComboBox($('#gender'), 'genero');
  bindComboBox($('#season'), 'season');
  bindComboBox($('#year'), 'colecao');
  bindComboBox($('#color'), 'color');
  bindComboBox($('#material'), 'material');
  bindComboBox($('#occasion'), 'ocasiao');


  $('.money').change(function () {
    $(this).val(Num.money(Num.moneyVal($(this).val())));
  });

  $('.call-refresh').change(function () {
    refreshBroadcast.emit(getData());
  });

  $('.sizes-box').click(() => {
    addNewSizeInput();
  });

  loadAndKeepCachedAllSizes();
  sizesGroupButtonBindClick();
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


function testedata(){
  $('#sku').val('JRTESTE');
  $('#name').val('PRODUTO TESTE JR');
  $('#ncm').val('6104.22.00');

  $('#category').val('Conjunto');
  $('#material').val('Moletom');
  $('#color').val('Azul');

  $('#markup').val('2,3');
  $('#cost').val(Num.money('10'));
}


function getData(){

  productResult.sku = $('#sku').val();
  productResult.name = $('#name').val();
  productResult.ncm = $('#ncm').val();
  productResult.cost = Num.moneyVal($('#cost').val() || 0);
  productResult.markup = Floa.floa($('#markup').val() || 2);
  productResult.category = $('#category').val();
  productResult.material = $('#material').val();
  productResult.color = $('#color').val();

  productResult.gender = $('#gender').val();
  productResult.season = $('#season').val();
  productResult.year = $('#year').val();
  productResult.occasion = $('#occasion').val();
  productResult.ncm = $('#ncm').val();
  productResult.brand = $('#brand').val();
  productResult.manufacturer = $('#manufacturer').val();

  productResult.sizes = $('.add-size-input').map((i,each)=>{
    return $(each).text();
  }).toArray();

  return productResult;
}


function onProductRefreshed(data){
  console.log(data);
  onIdentificationRefreshed(data);
  onPriceRefreshed(data);
  onAttributesRefreshed(data);
  onSizesRefreshed(data);
}

function onIdentificationRefreshed(data){
  $('#name').val(data.nome);
  $('#sku').val(data.codigo);
}

function onAttributesRefreshed(data){
  $('#year').val(data.year);
}

function onPriceRefreshed(data){
  $('#price').val(Num.money(data.preco));
  $('#from-price').val(Num.money(data.precoDe));
  $('#markup').val(data.markup);
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

function sizesGroupButtonBindClick(){
  $('.size-group-button').click(function () {
    if (!productResult.ageRange) productResult.ageRange = [];
    productResult.ageRange.push($(this).data('val'));

    refreshBroadcast.emit(getData());
  }).keypress(function(e) {
    if(e.which == 13) $(this).click()
  })
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
    if(e.which == 13) {e.preventDefault(); onSizesBoxClick();}
  }).focusout(() => {
    if (!$input.text()) $input.remove()
  });

  if (size) { $input.text(size) } else{ $input.focus() }

  loadAndKeepCachedAllSizes((sizes) => {
    bindComboBox($input, sizes, 5);
  });
}
