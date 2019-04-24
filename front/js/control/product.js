$(document).ready(() => {

  $('#search').focusin(function(){
    $('#search').select();
  });

  $('#lock-icon').click(()=>{
    onLockClick();
  });

  $('#lock-user-id').on("keyup", function(e) {
    if (e.which == 13){
      loadUserLockAuth();
    }
  });

  requestProductChilds();
  prepareAutoComplete();

  $('#search').on("keyup", function(e) {
    if (e.which == 13){
      findCurrentProduct();
    }
  });
});

function findCurrentProduct(){
  var skuOrEan = $('#search').val();
  if (skuOrEan) {

    var url = window.location.origin + window.location.pathname;
    var query;

    if (Num.isEan(skuOrEan)){
      query = '?ean=' + skuOrEan;
    }else{
      query = '?sku=' + skuOrEan;
    }

    window.location.href =  url + query;
  }
}

var skusCount = 0;

function requestProductChilds(){

  if (product._Skus){
    if (product._Skus.length == 0){
      product._Skus = [{codigo:product.codigo}];
    }

    skusCount = product._Skus.length;
    product._Skus.forEach((sku)=>{
      _get('/product-child', {sku: sku.codigo}, (child)=>{
        if (!child.error){
          buildChildSku(product, child);
        }

        skusCount--;

        if (skusCount == 0){
          onFinishedLoading();

        }
      });
    });

  }

}

function onFinishedLoading(){
  sortProducts();
  addFooter();
  showOkStatus();
  checkPermissionUser();
}


function showOkStatus(){
  showStatus('/img/checked.png', 3000);
}

function showErrorStatus(){
  showStatus('/img/alert.png', 5000);
}

function showLoadingStatus(){
  showStatus('/img/loader/circle.svg', false);
}

function showStatus(path, delay){
  var $el = $('.status-icon');

  $el.clearQueue().hide().fadeIn().attr('src', path);

  if (delay > 0){
    $el.delay(delay).fadeOut();
  }else if (delay == undefined){
    $el.delay(3000).fadeOut();
  }
}


function buildChildSku(product, child){
  var estoque = child._Estoque;

  var cols = [];
  cols.push(buildSkuCol(child));
  cols.push(buildLocalCol(child));
  cols.push(buildStockCol(child));
  cols.push(buildTextCol(estoque.estoqueDisponivel).addClass('available-stock'));
  cols.push(buildTextCol(estoque.estoqueReal - estoque.estoqueDisponivel).addClass('reserved-stock'));

  var $options = buildImgCol('img/dots.png', 'Opções');

  cols.push($options);

  estoqueRealTotal+= estoque.estoqueReal;
  estoqueDisponivelTotal+= estoque.estoqueDisponivel;
  estoqueReservadoTotal+= estoque.estoqueReal - estoque.estoqueDisponivel;

  var $tr = $('<tr>').addClass('tr-child');
  cols.forEach((col)=>{
    $tr.append(col);
  });

  paintLineStock($tr, child);

  $('.label-val-title').hide();

  $tr.click(()=>{
    $('.selected').removeClass('selected');
    $tr.addClass('selected');
    onChildSelected(child);
  });



  var sel = product.selected.toLowerCase();

  if (sel == child.codigo.toLowerCase() || sel == child.gtin){
    $tr.addClass('selected');
    $tr.trigger('click');
  }


  $options.click(function(e){
    var drop = new MaterialDropdown($(this), e, -100);
    drop.addItem('/img/barcode.png', 'Imprimir Etiqueta', function(){

       window.open('/barcode?sku=' + child.codigo, '_blank');

      /*new InputDialog('Impressão de Etiqueta de Produto', 'Quantidade')
      .onPositiveButton('Imprimir', ()=>{

      })
      .onNegativeButton('Cancelar')
      .show();*/


    });
    drop.show();

  });

  $('#child-skus-holder').append($tr);
}


function buildLocalCol(product){
  var $valElement = buildInput(product.localizacao);

  bindEvents($valElement, true);

  $valElement.focusout(function(){
    if (currentUser){
      if ($(this).val() && $(this).val().trim() !== $(this).data('value').toString().trim()){

        showLoadingStatus();

        var requestBody = {
          sku:product.codigo,
          local: $(this).val(),
          user: currentUser
        };


        _post('/product-local', requestBody, (res)=>{
          handleInputUpdate($(this), res, $(this).val());
        });
      }
    }
  })
  //Ao abrir a tela os campos de edição são desabilitados
  .attr('disabled', true);

  return buildCol($valElement);
}

function buildStockCol(product){
  var $valElement = buildInput(product._Estoque.estoqueReal, true);

  bindEvents($valElement, true, true);

  $valElement.change(function(e, v){
    if (currentUser){
      if ($(this).val()){
        showLoadingStatus();
        var val = parseInt($(this).val());

        var requestBody = {
          sku:product.codigo,
          stock: val,
          user: currentUser
        };


        _post('/product-stock',requestBody , (res)=>{
          handleInputUpdate($(this), res, $(this).data('value') + val);

          var $disp = $(this).closest('tr').find('.available-stock .child-value');

          $disp.text(parseInt($disp.text()) + val);
        });
      }
    }
  })
  //Ao abrir a tela os campos de edição são desabilitados
  .attr('disabled', true);


  return buildCol($valElement);
}

function buildInput(val, isNum){
  var $valElement;
  $valElement = $('<input>').attr('value',val)
  .addClass('child-value editable-input')
  .attr('placeholder', val)
  .data('value', val);

  if (isNum){
    $valElement.attr('onkeypress',"return Num.isNumberKey(event);").attr('maxlenght','5');
  }

  return $valElement;
}

function buildTextCol(val){
  return buildCol($('<label>').addClass('child-value').text(val));
}

function buildImgCol(path, title, addClass){
  return buildCol($('<img>').addClass('icon').attr('src',path).attr('title',title)).css('text-align', 'center');
}


function buildCol($el){
  return $('<td>').addClass('td-child').append($el);
}

function buildSkuCol(product){
  var $sku = $('<label>').addClass('child-value child-sku copiable').text(product.codigo);
  var $ean = $('<label>').addClass('child-title child-ean copiable').text(product.gtin);

  var f = function(e){
    Util.selectContent(this);
    Util.copySeleted();
    e.stopPropagation();
  };

  $sku.click(f);
  $ean.click(f);

  return buildCol([$sku, $ean]);
}

var estoqueRealTotal = 0;
var estoqueDisponivelTotal = 0;
var estoqueReservadoTotal = 0;


function addFooter(){
  var $tr = $('<tr>').addClass('footer');

  $tr.append(buildCol(''));
  $tr.append(buildCol('Total'));
  $tr.append(buildCol(estoqueRealTotal));
  $tr.append(buildCol(estoqueDisponivelTotal));
  $tr.append(buildCol(estoqueReservadoTotal));
  $tr.append(buildCol(''));  // Options
  $('#child-skus-holder').append($tr);
}


var lastSelected;

function onChildSelected(child){
  if (lastSelected != child.codigo){
    $('.label-val-title').hide();

    loadObsHistory(child);
    loadStockHistory(child.codigo);
  }

  lastSelected = child.codigo;
}

function loadObsHistory(child){
  $('#local-history').find("tr:gt(0)").remove();
  $('#local-history').hide();

  child.obs.split('\n').forEach((line)=>{
    if (line.includes('|')){
      var lineData = line.split('|');

      var user = lineData[0];
      var platf = lineData[1];
      var data = lineData[2];
      var date = lineData[3];
      var type = lineData[4];

      var $tr = $('<tr>').append(buildTextCol(date),
      buildTextCol(user),
      buildImgCol(platf.includes('Mobile') ? 'img/smartphone.png':'img/pc.png', platf),
      buildTextCol(type ? type : 'Localização'),
      buildTextCol(data));


      $('#local-history tr:first').after($tr);
      //$('#local-history').append($tr);
    }
  });

  if ($('#local-history tr').length > 1){
    $('#local-history').hide().fadeIn();
  }
}

var stockRowsHistoryMemory = {};

function getStockRowsGrouped(childSku, callback){
  if (!stockRowsHistoryMemory[childSku]){
    _get('/product-stock-history', {sku:childSku},(rows)=>{
      stockRowsHistoryMemory[childSku] = groupStockRows(rows);
      callback(stockRowsHistoryMemory[childSku]);
    });
  }else{
    callback(stockRowsHistoryMemory[childSku]);
  }
}


function loadStockHistory(childSku){
  $('#stock-history').find("tr:gt(0)").remove();
  $('#stock-history').hide();

  getStockRowsGrouped(childSku ,(groupped)=>{
    loadLayoutHistory(groupped);

    if (loggedUser.full){
      new StockChart('stock-chart', stockRowsHistoryMemory).load();
      $('.chart-label').css('display','block').fadeIn();
    }


    $('#stock-history').hide().fadeIn();
    loadSumsStocks();
  });
}

function groupStockRows(rows){
  var groupArr={};

  rows.forEach((i)=>{
    var user = i.obs.split('-');
    var id = Dat.id(new Date(i.data)) + (i.es == 'S' ? i.es : '') + (user.length > 1 ? user[1] : '');

    if (groupArr[id]){
      groupArr[id].quantidade += parseInt(i.quantidade);
    }else{
      i.quantidade = parseInt(i.quantidade);
      groupArr[id] = i;
    }
  });

  return Object.values(groupArr);
}

function loadLayoutHistory(rows){
  rows.forEach((i)=>{
    var obs = '';
    var user = i.obs.split('-');
    user = user.length > 1 ? user[1] : '--';

    if (i.idOrigem != '' && i.es == 'S' && i.obs == ''){
      obs = 'Faturamento';
    }else if (i.obs == '' && i.quantidade > 0 && i.tipoEntrada == ''){
      obs = 'Estoque Inicial';
    }else if (i.obs.includes('Lanç') || i.obs.includes('manual')){
      obs = 'Lançamento';
    }else{
      obs = i.obs.split('-')[0];
    }

    var isMobile = i.obs.includes('Mobile');

    var $tr = $('<tr>').append(
      buildTextCol(Dat.format(new Date(i.data))),
      buildTextCol(user),
      buildImgCol(isMobile ? 'img/smartphone.png' : 'img/pc.png', isMobile ? 'Mobile' : 'Desktop'),
      buildTextCol(parseInt(i.quantidade)).addClass('stock-val'),
      buildTextCol(obs));

      if (parseInt(i.quantidade) > 0){
        $tr.addClass('positive-row');
      }else{
        $tr.addClass('negative-row');
      }

      $('#stock-history tr:first').after($tr);
    });
  }


  function loadSumsStocks(){
    var totals = ['.positive-row', '.negative-row'];

    totals.forEach((item)=>{
      var total = $('#stock-history ' + item + ' .stock-val .child-value').map(function() {
        return parseInt($(this).text());
      })
      .get().reduce(function(i, e) {
        return i + e;
      },0);

      $('.label-val-title' + (item == '.positive-row' ? '.green-wick' : '.red-wick')).text(Math.abs(total));
    });

    $('.label-val-title').show();
  }

  function isStored(res){
    try{
      return res &&  res.result.success.length >0;
    }catch(e){
      return res && res.success.length >0;
    }
  }

  function controlStatus($el, res){
    if (isStored(res)){
      showOkStatus();
    }else{
      showErrorStatus();
    }
  }

  function handleInputUpdate($el, res, newValue){
    controlStatus($el, res);

    $el.val(newValue);

    if (isStored(res)){
      $el.data('value', newValue);
      $el.attr('placeholder', newValue);
    }
  }

  function bindEvents($el, blurOnEnter, clearOnFocus){
    $el.click(function(e){
      e.stopPropagation();
    });

    if (clearOnFocus){
      var lastVal = $el.val();

      $el.focusin(function(e){
        $(this).val('');
      });

      $el.focusout(function(e){
        $(this).val(lastVal);
      });
    }

    if (blurOnEnter){
      $el.keypress(function(e){
        if(e.which == 13){
          $el.blur();
        }
      });
    }
  }


  function paintLineStock(el, child){
    var stock = child._Estoque;
    var hasLocal = child.localizacao.length > 0;

    if (!hasLocal){
      //Red
      $(el).css('background-color', '#ff000026');
      return;
    }

    if (stock.estoqueReal < 1){
      //Yellow
      $(el).css('background-color', '#ffe20026');
      return;
    }

    if (stock.estoqueDisponivel < 0){
      //Red
      $(el).css('background-color', '#ff000026');
      return;
    }
  }

  var currentUser;

  function isUnlocked(){
    return currentUser != undefined;
  }

  function onLockClick(){
    if (isUnlocked()){
      initialLockState();
    }else{
      waittingToLock();
    }
  }

  function loadUserLockAuth(){
    var userAcess = $('#lock-user-id').val();
    if (userAcess){
      _get('/user?userId='+userAcess,{},(user)=>{
        unlock(user);
      },()=>{
        errorLock();
      });
    }
  }

  function initialLockState(){
    $('#lock-icon').hide().attr('src','/img/lock.png').fadeIn();
    currentUser = undefined;
    $('#lock-user-id').val('');
    $('.editable-input').attr('disabled', true);
  }

  function waittingToLock(){
    $('#lock-icon').hide().attr('src','/img/lock-loupe.png').fadeIn();
    $('#lock-user-id').select().focus();

    $('#lock-user-id').one("focusout",()=>{
      if (!isUnlocked()){
        initialLockState();
      }
    });
  }

  function unlock(user){
    $('#lock-icon').hide().attr('src','/img/unlocked.png').fadeIn();
    currentUser = user;
    $('.editable-input').attr('disabled', false);
  }

  function errorLock(user){
    $('#lock-icon').hide().attr('src','/img/lock-error.png').fadeIn();
    $('#lock-user-id').select().focus();
  }


  function prepareAutoComplete(){
    var options = {

      url: function(phrase) {
        return "/product-search-autocomplete?typing=" + phrase;
      },

      getValue: function(element) {
        return element.sku;
      },

      template: {
        type: "description",
        fields: {
          description: "name"
        }
      },

      ajaxSettings: {
        dataType: "json",
        method: "GET",
        data: {
          dataType: "json"
        }
      },
      requestDelay: 400,
      list: {
        maxNumberOfElements: 150,
        match: {
          enabled: false
        },
        sort: {
          enabled: true
        },
        onClickEvent: function() {
          findCurrentProduct();
        }
      },
    };

    $("#search").easyAutocomplete(options);
  }

  function checkPermissionUser(){
    if (Sett.every(loggedUser,[4,7])){
      unlock(loggedUser);
    }
  }

  function sortProducts() {
    $('#child-skus-holder .tr-child').sort(function(a, b) {
      return getProductLineSize(a) - getProductLineSize(b);
    }).appendTo($('#child-skus-holder tbody'));
  }

  function getProductLineSize(el){
    var arr = $('td:first .child-sku', el).text().split('-');
    return decodeLetterSizeProduct(arr[arr.length-1]);
  }

  function decodeLetterSizeProduct(size){
    var sizes = ['RN', 'P', 'M', 'G', 'GG' , 'XXG'];
    var nums = ['-7', '-6', '-5', '-4', '-3' , '-2'];
    var index = sizes.indexOf(size);
    return Num.def(index > -1 ? index : size);
  }
