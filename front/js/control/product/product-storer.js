var refreshBroadcast;

$(document).ready(() => {
  //testingData();
  onBindViewValues();

  //product = Util.keepPrimitiveAttrs(product);

  refreshBroadcast = new Broadcast('post-refresh-storing-product').onReceive(onProductRefreshed);

  onBindComboBoxes();
  onBindViewsListeners();
  loadAndKeepCachedAllSizes();

  requestProductChilds();
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
  $('.save').click(() => { _post('/stock/storer-upsert', getData(), (data) => { console.log(data); }); });
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


  $('#sku').keypress(function(e) {
    if(e.which == 13) window.location.href = window.location.origin + window.location.pathname + '?sku=' + $(this).val();
  });

  Dropdown.on($('.sizes-dots'))
  .item('/img/delete.png', 'Remover Todos', function(){
    $('.sizes-box').empty();
  });

  new TemplateEditor()
  .useUnicodeEmoticons(true)
  .showRichButtons(false)
  .load('.description-editor').then((_editor) => {
    window.editor = _editor;
    onBindDetailsDescriptions();
  });
}

function onBindViewValues(){
  if (Object.keys(product).length > 0){
    $('.bindable').each((i, each) => {
      var val = product[$(each).data('bind')];
      if(val){
        if($(each).hasClass('money')){
          $(each).val(Num.money(Floa.floa(val)));
        }else{
          $(each).val(val);
        }
      }
    });

    //Exceptions Handling
    if (product.precoCusto){
      $('#markup').val(Floa.abs(Floa.floa(product.preco)/Floa.floa(product.precoCusto),2));
    }

    onBindDetailsDescriptions();
  }
}

function onBindDetailsDescriptions(){
  if (product._FichaTecnica && (product._FichaTecnica.length == 1) && window.editor){
    window.editor.html.set(product._FichaTecnica[0].descricaoDetalhada);
  }
}

function onBindComboBoxes(){
  $('.combobox').each((i, each) => {
    bindComboBox($(each), $(each).data('bind'));
  });
}

function getData(){
  product.markup = $('#markup').val();
  product.precoCusto = Num.moneyVal($('#cost').val());
  product.sizes = $('.size-input').map((i,each)=>{ return $(each).text(); }).toArray();
  product._FichaTecnica[0].descricaoDetalhada =  editor.html.get();

  return product;
}

function onProductRefreshed(data){
  console.log(data);
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
    _get('/stock/storer-attr?attr=Tamanho',{}, (data) => {
      cachedSizes = data;
      if (callback){
        callback(data);
      }
    });
  }
}


function addNewSizeInput(size, callRe){
  var $input = $('<span>').addClass('size-input').attr('contenteditable', true);
  $('.sizes-box').append($input);

  $input.click((e) => {
    $input.remove();
    e.stopPropagation();
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



function requestProductChilds(){
  if (product._Skus){
    var skus = product._Skus.map((e) => {
      return e.codigo;
    });

    _get('/product-skus', {skus:skus}, (childs)=>{
      $('.childs').not('.header').empty();
      childs.forEach((e) => {
        buildChildSku(e);
      })
    });
  }
}


function buildChildSku(item){
  newChildLine()
  .col(item.codigo)
  .input('Ean', item.gtin)
  .input('Peso', null)
  .input('Largura', null)
  .input('Altura', null)
  .input('Comprimento', null)
}

function newChildLine(){
  var line = $('<tr>');
  $('.childs').append(line);
  return {
    col: function (label) {
      line.append($('<td>').append($('<span>').addClass('static-label').append(label)));
      return this;
    },

    input: function (label, value) {
      line.append(buildChildInput(label, value));
      return this;
    }
  }
}

function buildChildInput(label, value){
  var $input = $('<input>').attr('value', value)
  .addClass('editable-input')
  .attr('placeholder', label)
  .data('value', value);

  return $('<td>').append($input);
}
