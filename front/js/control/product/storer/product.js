const MEM_TAG = 'LOCKED-VALUE';
var lockedValues;
var refreshBroadcast;
var childsBuilder;
var sizesBox;

$(document).ready(() => {
  onCreate(); onRefresh();
});

//Call one time
function onCreate(){
  onBindViewsListeners();
  onBindComboBoxes();
  onCreateSizeGroupButtons();
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


  if (!product.id){
    $('.lockable').keypress(function(e) {
      if(e.which == 13) toggleLockIcon($(this));
    });

    $('.lockable').blur(function (){
      toogleComboBoxValue($(this));
    });

    $('.child-lockable').click(function() {
      handleChildLockClick($(this));
    });
  }

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
    sizesBox.clear();
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
    data.html.set(product.conteudo);
    window.editor = data;
  });
}

function onInitilizeScreenControls(){
  $('.delete').toggle(product.id != undefined);

  refreshBroadcast = new Broadcast('refresh-product').onReceive(onProductRefreshed).emit(product);

  sizesBox = new SizesBox($('.sizes-box')).startCache();
  childsBuilder = new ChildsBuilder($('.childs')).setDefaultOnChange().setMemoryData(product.id ? null : lockedValues?.screen);

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

function onBindComboBoxes(){
  $('.combobox').each((i, each) => {
    bindComboBox($(each), $(each).data('bind'));
  });

  new ComboBox($('input[data-bind="cf"]'))
  .setAutoShowOptions(true)
  .fromEnum('NCM')
  .load();
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
  onOtherBindingRules();

  setTimeout(() => {
    $('.material-input-holder>label').removeClass('no-transition');
  },100);
}

function onSizesRefreshed(){
  if (product._Skus){
    sizesBox.load(product.sizes);
    childsBuilder.load(product._Skus);
  }

  if (product.selectedSizeGroup){
    $('.size-group-button').removeClass('active');
    $('.size-group-button[data-arr*="'+product.selectedSizeGroup+'"]').addClass('active');
  }
}

function onOtherBindingRules(){
  $('.discount').text(Num.percent(product.discount, true));
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

    var found = product?._Skus?.find(function(i){
      return i.codigo == sku;
    });

    var item = {...found, codigo: getSku(size), active: true};

    if (!found){
      item.gtin = Util.barcode();
      product._Skus = [].concat(product._Skus, item).filter(Boolean);
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

  if (data.error){
    $('.loading-circle').attr('src', '/img/error.png');
  }else if (!data.isLoading){
    $('.loading-circle').attr('src', '/img/checked.png');
  }

  $('.loading-msg').text(data.msg || data.error || 'Processo Finalizado!');
}

function onStoreProduct(){
  if (checkBeforeStore()){
    new Broadcast('storing-product-'+product.codigo).onReceive(onStoringMessageUpdate);
    _post('/stock/storer-upsert', getData(), (data) => { onProductStored(data) });
  }
}

function checkBeforeStore(){
  var isOk = true;

  $('.bindable').each((i, input) => {
    if (!$(input).val()){
      isOk = false;
      onInputError($(input));
    }
  });

  if (childsBuilder.getSkus().length == 0){
    isOk = false;
    onDivError($('.childs').parent());
  }

  if (!editor.html.get()){
    isOk = false;
    onDivError($('.description-editor').parent());
  }

  return isOk;
}

function onProductStored(data){
  putSkuUrlParams();

  setTimeout(() => {
    $('.loading-holder').hide();
    window.location.reload();
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

function toogleComboBoxValue(el){
  var key = el.data('bind');
  var val = el.val();

  toggleLockedValue('data', key, val, el.hasClass('locked') && val);
}

function toggleLockedValue(path, key, val, toggle){
  lockedValues[path] = lockedValues[path] || {};

  if (toggle){
    lockedValues[path][key] = val;
  }else{
    delete lockedValues[path][key];
  }

  Local.put(MEM_TAG, lockedValues);
}

function toggleLockIcon(el){
  var lockIcon = el.siblings('label')
  el.toggleClass('locked' + (!lockIcon.length ? ' lock-icon' : ''));

  if (lockIcon.length){
    lockIcon.toggleClass('lock-icon');
  }
}

function onInitializeLockedValues(){
  if (!product.id){
    $('.material-input-holder>label').addClass('no-transition');

    lockedValues = Local.get(MEM_TAG);
    Util.forProperty(lockedValues.data, (val, key) => {
      product[key] = val;
      toggleLockIcon($('input[data-bind="' + key + '"]').val(val));
    });

    $('.child-lockable').each((i, each) => {
      if (lockedValues?.screen?.[$(each).data('bind')]){
        toggleLockIcon($(each));
      }
    });
  }
}

function handleChildLockClick(col){
  var key = col.data('bind');
  var has = !col.hasClass('locked');

  toggleLockedValue('screen', key, has, has);

  $('input[data-tag="'+key+'"]').each((i, each) => {
    toggleLockedValue('screen', key + '-' + $(each).data('size'), $(each).val(), has);
  });

  toggleLockIcon(col);
}


function onCreateSizeGroupButtons(){
  if (!product.id){
    _get('/enum',{tag:'PROD-FA-SIZES'}, (data) => {
      var buttons = data.items.reduce((o, each) => {
        key=Str.keep(each.name);
        o[key] = [].concat(o[key], each.name).filter(Boolean);
        return o;
      }, {});

      Object.keys(buttons).forEach((key) => {
        var l = $('<label>').addClass('size-group-button').attr('data-arr', buttons[key].reverse())
        .attr('tabindex', '0')
        .append(key)
        .click(function () {
          if (product.codigo) onSizeGrupoButtonClick(this);
        }).keypress(function(e) {
          if(e.which == 13) $(this).click()
        });

        $('.size-group-buttons-holder').prepend(l);
      });
    })
  }
}


function onSizeGrupoButtonClick(button){
  var arr = $(button).data('arr').split(',');
  current = $(button).data('curr') || 0;

  if (arr[current] != product.selectedSizeGroup){
    sizesBox.clear();

    product.selectedSizeGroup = arr[current];
    $(button).text(arr[current]);
    $(button).data('curr', arr.length-1 == current ? 0 : ++current);
    refreshBroadcast.emit(getData());
  }
}
