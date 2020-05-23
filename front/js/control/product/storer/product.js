var refreshBroadcast;
var childsBuilder;
var sizesBox;

$(document).ready(() => {
  //product = Util.keepPrimitiveAttrs(product);
  onBindViewValues();

  refreshBroadcast = new Broadcast('post-refresh-storing-product').onReceive(onProductRefreshed).emit(product);
  sizesBox = new SizesBox($('.sizes-box')).startCache();

  onBindComboBoxes();
  onBindSizeBoxListeners();
  onBindViewsListeners();
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
  if (product.conteudo){
    if (window.editor) window.editor.html.set(product.conteudo);
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
  product.conteudo = editor.html.get();

  return product;
}

function onProductRefreshed(data){
  console.log(data);
  product = data;
  onBindViewValues();
  onSizesRefreshed(data);
}

function onSizesRefreshed(data){
  sizesBox.refresh(data.sizes);

  if (data.faixa_de_idade){
    $('.size-group-button').removeClass('active');
    $('.size-group-button[data-val="'+data.faixa_de_idade+'"]').addClass('active');
  }
}

function requestProductChilds(){
  if (product._Skus){
    var skus = product._Skus.map((e) => {
      return e.codigo;
    });

    _get('/product-skus', {skus:skus}, (childs)=>{
      childsBuilder = ChildsBuilder.bind($('.childs'), childs);
    });
  }
}

function onBindSizeBoxListeners(){
  var getSku = (size) => {
    return product.codigo + '-' + size;
  }

  sizesBox.setOnSizeCreated((size) => {
    var sku = getSku(size);

    var found = product._Skus.find(function(i){
      return i.codigo == sku;
    });

    var item = {...found, codigo: getSku(size), active: true};

    childsBuilder.addChild(item);
    if (!found){
      product._Skus.push(item);
    }
  });

  sizesBox.setOnSizeDeleted((size) => {
    var sku = getSku(size);

    childsBuilder.removeChild(sku);

    var item = product._Skus.find(function(i){
      return i.codigo == sku;
    });

    item.active = false;
  });
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
