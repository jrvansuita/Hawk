$(document).ready(() => {

  $('#search').focusin(function(){
    $('#search').select();
  });

  $('#search').on("keyup", function(e) {
    var key = e.which;
    var skuOrEan = $('#search').val();
    if (key == 13 && skuOrEan){

      var url = window.location.origin + window.location.pathname;
      var query;

      if (Num.isEan(skuOrEan)){
        query = '?ean=' + skuOrEan;
      }else{
        query = '?sku=' + skuOrEan;
      }

      window.location.href =  url + query;
    }
  });

  requestProductChilds();
});

var skusCount = 0;

function requestProductChilds(){


  if (product._Skus.length == 0){
    product._Skus = [{codigo:product.codigo}];
  }

  skusCount = product._Skus.length;
  product._Skus.forEach((sku)=>{
    _get('/product-child', {sku: sku.codigo}, (child)=>{
      buildChildSku(product, child);
      skusCount--;

      if (skusCount == 0){
        onFinishedLoading();
      }
    });
  });

}

function onFinishedLoading(){
  addFooter();
  $('.right-loading').hide().fadeIn().attr('src', '/img/checked.png').delay(2000).fadeOut();
}


function buildChildSku(product, child){
  var estoque = child._Estoque;

  var cols = [];
  cols.push(buildSkuCol(child));
  cols.push(buildLocalCol(child));
  cols.push(buildStockCol(child));
  cols.push(buildTextCol(estoque.estoqueDisponivel).addClass('available-stock'));
  cols.push(buildTextCol(estoque.estoqueReal - estoque.estoqueDisponivel).addClass('reserved-stock'));

  estoqueRealTotal+= estoque.estoqueReal;
  estoqueDisponivelTotal+= estoque.estoqueDisponivel;
  estoqueReservadoTotal+= estoque.estoqueReal - estoque.estoqueDisponivel;

  var $tr = $('<tr>').addClass('tr-child');
  cols.forEach((col)=>{
    $tr.append(col);
  });

  paintLineStock($tr, estoque);

  $('.label-val-title').hide();

  $tr.click(()=>{
    $('.label-val-title').hide();
    $('.selected').removeClass('selected');
    $tr.addClass('selected');
    onChildSelected(child);
  });

  var sel = product.selected.toLowerCase();

  if (sel == child.codigo.toLowerCase() || sel == child.gtin){
    $tr.addClass('selected');
    $tr.trigger('click');
  }

  $('#child-skus-holder').append($tr);
}


function buildLocalCol(product){
  var $valElement = buildInput(product.localizacao);

  bindEvents($valElement, true);

  $valElement.focusout(function(){
    if ($(this).val() && $(this).val().trim() !== $(this).data('value').toString().trim()){
      $(this).addClass('loading-value');
      _post('/product-local', {sku:product.codigo, local: $(this).val()}, (res)=>{
        handleInputUpdate($(this), res, $(this).val());
      });
    }
  });

  return buildCol($valElement);
}

function buildStockCol(product){
  var $valElement = buildInput(product._Estoque.estoqueReal, true);

  bindEvents($valElement, true, true);

  $valElement.change(function(e, v){
    if ($(this).val()){
      $(this).addClass('loading-value');
      var val = parseInt($(this).val());

      _post('/product-stock', {sku:product.codigo, stock: val}, (res)=>{
        handleInputUpdate($(this), res, $(this).data('value') + val);

        var $disp = $(this).closest('tr').find('.available-stock .child-value');

        $disp.text(parseInt($disp.text()) + val);
      });
    }
  });


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
  $('#child-skus-holder').append($tr);
}


var lastSelected;

function onChildSelected(child){
  if (lastSelected != child.codigo){
    $('#product-history').text(child.obs).hide().fadeIn();
    loadStockHistory(child.codigo);
  }

  lastSelected = child.codigo;
}


function loadStockHistory(childSku){
  $('#stock-history').find("tr:gt(0)").remove();
  $('#stock-history').hide();

  _get('/product-stock-history', {sku:childSku},(rows)=>{

    var groupArr={};

    rows.forEach((i)=>{
        var id = Dat.format(new Date(i.data)) + (i.es == 'S' ? i.es : '');

        if (groupArr[id]){
          groupArr[id].quantidade += parseInt(i.quantidade);
        }else{
          i.quantidade = parseInt(i.quantidade);
          groupArr[id] = i;
        }
    });

    loadLayoutLoadHistory(Object.values(groupArr));

    $('#stock-history').hide().fadeIn();
    loadSumsStocks();
  });
}

function loadLayoutLoadHistory(rows){
  rows.forEach((i)=>{
    var obs = '';

   if (i.idOrigem != '' && i.es == 'S' && i.obs == ''){
      obs = 'Saída por Faturamento';
    }else{
      obs = i.obs;
    }

    var $tr = $('<tr>').append(buildTextCol(Dat.format(new Date(i.data))),
    buildTextCol(parseInt(i.quantidade)).addClass('stock-val'),
    buildTextCol(obs));

    if (parseInt(i.quantidade) > 0){
      $tr.addClass('positive-row');
    }else{
      $tr.addClass('negative-row');
    }

    $('#stock-history').append($tr);
  });


}


function loadSumsStocks(){
  var totals = ['.negative-row', '.positive-row'];

  totals.forEach((item)=>{
    var total = $('#stock-history ' + item + ' .stock-val .child-value').map(function() {
      return parseInt($(this).text());
    })
    .get().reduce(function(i, e) {
      return i + e;
    },0);

    $('.label-val-title' + item).text(Math.abs(total));
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


function flashOnUpdate($el, res){
  if (isStored(res)){
    flashColor($el, 'positive-row');
  }else{
    flashColor($el, 'negative-row');
  }
}

function flashColor($el, clazz){
  $el.removeClass('loading-value').addClass(clazz).delay(1000).queue(function(){
    $el.removeClass(clazz).dequeue();
  });
}


function handleInputUpdate($el, res, newValue){
  flashOnUpdate($el, res);

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
    $el.focusin(function(e){
      $(this).val('');
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


function paintLineStock(el, stock){
  if (stock.estoqueReal < 1){
    $(el).css('background-color', '#ff00003d');
  }else if (stock.estoqueDisponivel < 1){
    $(el).css('background-color', '#ffbf004f');
  }
}
