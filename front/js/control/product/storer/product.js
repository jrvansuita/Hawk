const MEM_TAG = 'LOCKED-VALUE';
var lockedValues;
var refreshBroadcast;
var storingBroadcast;
var childsBuilder;
var sizesBox;

$(document).ready(() => {
  onCreate(); onRefresh();
});

//Call one time
function onCreate(){
  onBindViewsListeners();
  onBindComboBoxes();
}

//Call every new product
function onRefresh(){
  onInitializeLockedValues();
  onInitilizeScreenControls();
  requestProductChilds();
}

function bindComboBox(el, data, limit){
  var url = typeof data == 'string' ? '/stock/storer-attr?attr='+ data : data;

  new ComboBox(el, url)
  .setAutoShowOptions(true)
  .setLimit(limit)
  .setOnItemBuild((item, index)=>{
    return {text : item.description.trim(), value: item.value};
  }).load();
}

function onBindViewsListeners(){
  $('.save').click(onStoreProduct);
  $('.delete').click(onProductDeleted);
  $('.new').click(onNewProduct);

  $("input[type='text']").on("click", function () {
    $(this).select();
  });

  $('.lockable').keypress(function(e) {
    if(e.which == 13) toggleLockIcon($(this));
  });

  $('.lockable').blur(function (){
    toogleProductValue($(this));
  });

  $('.size-group-button').click(function () {
    product.postFaixaIdade = $(this).data('val');
    refreshBroadcast.emit(getData());
  }).keypress(function(e) {
    if(e.which == 13) $(this).click()
  });

  $('.bindable').blur(function () {
    var key = $(this).data('post') || $(this).data('bind');
    product[key] = $(this).val();
  });

  $('.call-refresh').blur(function () {
    if ($(this).val() != $(this).data('last')){
      $(this).data('last', $(this).val());
      refreshBroadcast.emit(getData());
    }
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
  .addMiscCustomButton('insertFile', 'def-template', 'Inserir Descricao Padrão', (editor) => {
    _get('/templates-viewer?id=89017302', {}, (r) => {
      editor.html.set(r);
    });
  })
  .load('.description-editor').then((data) => {
    window.editor = data;
    onBindDetailsDescriptions();
  });
}

function onInitilizeScreenControls(){
  $('.delete').toggle(product.id != undefined);

  refreshBroadcast = new Broadcast('refresh-product').onReceive(onProductRefreshed).emit(product);
  storingBroadcast = new Broadcast('storing-product').onReceive(onStoringMessageUpdate);

  sizesBox = new SizesBox($('.sizes-box')).startCache();
  childsBuilder = new ChildsBuilder($('.childs')).setDefaultOnChange();

  onBindSizeBoxListeners();
}

function onBindViewValues(){
  if (Object.keys(product).length > 0){
    $('.bindable').each((i, each) => {
      var val = product[$(each).data('bind')];
      if(val){
        if($(each).hasClass('money')){
          $(each).val(Num.money(Floa.floa(val)));
        }else if($(each).hasClass('float')){
          $(each).val(Floa.abs(Floa.def(val, 0),2));
        }else{
          $(each).val(val);
        }
      }
    });
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
  product.precoCusto = Num.moneyVal($('#cost').val());
  product.conteudo = editor.html.get();
  product.user = loggedUser;

  return product;
}

function onProductRefreshed(data){
  product = data;
  onBindViewValues();
  onSizesRefreshed();

  setTimeout(() => {
    $('.material-input-holder>label').removeClass('no-transition');
  },100);
}

function onSizesRefreshed(){
  if (product._Skus){
    sizesBox.load(product.sizes);
    childsBuilder.load(product._Skus);
  }

  if (product.faixa_de_idade){
    $('.size-group-button').removeClass('active');
    $('.size-group-button[data-val="'+product.faixa_de_idade+'"]').addClass('active');
  }
}

function requestProductChilds(){
  if (product._Skus){
    var skus = product._Skus.map((e) => {
      return e.codigo;
    });

    _get('/product-skus', {skus:skus, order: true}, (childs)=>{
      childsBuilder.load(childs, true);
    });
  }
}

function onBindSizeBoxListeners(){
  var getSku = (size) => {
    return product.codigo + '-' + size;
  }

  sizesBox.setOnSizeCreated((size) => {
    console.log('Size Created: ' + size);
    var sku = getSku(size);

    var found = product._Skus.find(function(i){
      return i.codigo == sku;
    });

    var item = {...found, codigo: getSku(size), active: true};

    if (!found){
      item.gtin = Util.barcode();
      product._Skus.push(item);
    }

    childsBuilder.addChild(item);
  });

  sizesBox.setOnSizeDeleted((size) => {
    console.log('Size Deleted: ' + size);
    var sku = getSku(size);

    childsBuilder.removeChild(sku);

    product._Skus.forEach((item, index, arr)  => {
      if (item.codigo == sku){
        if (item.id){
          item.active = false;
        }else{
          arr.splice(index, 1);
        }
      }
    });
  });
}

function onStoringMessageUpdate(data){
  $('.loading-holder').show();

  console.log(data);
  if (data.error){
    $('.loading-circle').attr('src', '/img/error.png');
  }else if (!data.isLoading){
    $('.loading-circle').attr('src', '/img/checked.png');
  }

  $('.loading-msg').text(data.msg || data.error || 'Processo Finalizado!');
}

function onStoreProduct(){
  _post('/stock/storer-upsert', getData(), (data) => { onProductStored(data); });
}

function onProductStored(data){
  putSkuUrlParams();

  setTimeout(() => {
    $('.loading-holder').hide();
    if (!product.id){
      window.location.reload();
    }
  },1500);
}

function onProductDeleted(){
  _post('/stock/storer-delete', getData(), (data) => { console.log('Deletou');});
}


function onNewProduct(){
  window.location.href = location.origin + location.pathname;
}

function putSkuUrlParams(){
  if (window.history.replaceState) {
    window.history.replaceState("Data", null, location.pathname + '?sku=' + product.codigo);
  }
}

function toogleProductValue(el){
  var key = el.data('bind');
  var val = el.val();

  if (el.hasClass('locked') && val){
    lockedValues[key] = val;
  }else{
    delete lockedValues[key];
  }

  Local.put(MEM_TAG, lockedValues);
}

function toggleLockIcon(el){
  el.toggleClass('locked');
  var lockIcon = el.siblings('label');
  if (lockIcon){
    lockIcon.toggleClass('lock-icon');
  }
}

function onInitializeLockedValues(){
  if (!product.id){
    $('.material-input-holder>label').addClass('no-transition');

    lockedValues = Local.get(MEM_TAG);
    Util.forProperty(lockedValues, (val, key) => {
      product[key] = val;
      toggleLockIcon($('input[data-bind="' + key + '"]').val(val));
    });
  }
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
