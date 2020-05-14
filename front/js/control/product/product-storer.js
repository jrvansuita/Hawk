var refreshBroadcast;

$(document).ready(() => {

  refreshBroadcast = new Broadcast('post-refresh-storing-product').onReceive(onProductRefreshed);

  testedata();

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

  $('.sizes-box').click(onSizesBoxClick);
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
  var result = {};
  result.sku = $('#sku').val();
  result.name = $('#name').val();
  result.ncm = $('#ncm').val();
  result.cost = Num.moneyVal($('#cost').val() || 0);
  result.markup = Floa.floa($('#markup').val() || 2);
  result.category = $('#category').val();
  result.material = $('#material').val();
  result.color = $('#color').val();

  result.gender = $('#gender').val();
  result.season = $('#season').val();
  result.year = $('#year').val();
  result.occasion = $('#occasion').val();
  result.ncm = $('#ncm').val();
  result.brand = $('#brand').val();
  result.manufacturer = $('#manufacturer').val();


  return result;
}


function onProductRefreshed(data){
  console.log(data);
  onIdentificationRefreshed(data);
  onPriceRefreshed(data);
  onAttributesRefreshed(data);
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

function onSizesBoxClick(){
  var $input = $('<span>').addClass('add-size-input').attr('contenteditable', true);
  $('.sizes-box').append($input);
  $input.focus();
  $input.click((e) => {
    e.preventDefault();
    $input.remove();
  });

  $input.keypress(function(e){
    if(e.which == 13 || e.which == 9){
      e.preventDefault();
      onSizesBoxClick();
    }
  });


  loadAndKeepCachedAllSizes((sizes) => {
    bindComboBox($input, sizes, 5);
  });
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
