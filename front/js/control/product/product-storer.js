var refreshBroadcast;

$(document).ready(() => {
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
    return {text : item.description, value: item.value};
  }).load();
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
  }
}

function onBindDetailsDescriptions(){
  if (product._FichaTecnica){
    if (window.editor) window.editor.html.set(product._FichaTecnica[0].descricaoDetalhada);
  }else{
    product._FichaTecnica = [{}];
  }
}

function onBindComboBoxes(){
  $('.combobox').each((i, each) => {
    bindComboBox($(each), $(each).data('bind'));
  });


  bindComboBox($('input[data-bind="cf"]'),  getNcmOptions());
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
      console.log(childs);
      $('.childs').find("tr:gt(0)").empty();
      childs.forEach((e) => {
        buildChildSku(e);
      })
    });
  }
}


function buildChildSku(item){
  var onChange = function(){
    if (!product._Skus) product._Skus = [];

    product._Skus.forEach((each) => {
      if (each.codigo == item.codigo){
        each.changed = true;
        each[$(this).data('tag')] = $(this).val();
      }
    });
  }

  newChildLine(onChange)
  .col(item.codigo)
  .input('Ean', 'gtin', item.gtin, '0000000000000', null, 'int')
  .input('Peso', 'peso', Floa.def(item.peso) || Floa.def(item.pesoLiq), '0,000', 'short-input', 'float')
  .input('Largura', 'lagura', item.largura, '0,000', 'short-input', 'int')
  .input('Altura', 'altura', item.altura, '0,000', 'short-input', 'int')
  .input('Comprimento', 'comprimento', item.comprimento, '0,000', 'short-input', 'int')
}

function newChildLine(onChange){
  var line = $('<tr>');
  $('.childs').append(line);
  return {
    col: function (label) {
      line.append($('<td>').append($('<span>').addClass('static-label').append(label)));
      return this;
    },

    input: function (...params) {
      line.append($('<td>').append(buildChildInput(...params).change(onChange)));
      return this;
    }
  }
}

function buildChildInput(label, tag, value, placeholder, addClass, type, onChange){
  var $input = $('<input>').addClass(addClass)
  .addClass('editable-input')
  .data('tag', tag)
  .attr('placeholder', placeholder)
  .on("click", function () {
    $(this).select();
  });

  if (type == 'float'){
    $input.val(Floa.weight(value)).attr('onkeypress', "return Floa.isFloatKey(event);");
  }else if (type == 'int'){
    $input.val(Num.int(value)).attr('onkeypress',"return Num.isNumberKey(event);");
  }

  return $input;
}


function getNcmOptions(){
  var ncms = [];
  ncms.push({description: '6111.20.00 - Vestuário', value : '6111.20.00'});
  ncms.push({description: '6402.99.90 - Calçados', value : '6402.99.90'});
  ncms.push({description: '8715.00.00 - Carrinho de Bebê', value : '8715.00.00'});
  ncms.push({description: '3926.90.90 - Plásticos', value : '3926.90.90'});
  ncms.push({description: '6217.10.00 - Acessórios de Tecido', value : '6217.10.00'});
  ncms.push({description: '4202.22.20 - Bolsas e Mochilas', value : '4202.22.20'});
  return ncms;
}
