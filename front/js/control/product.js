$(document).ready(() => {

  $('#search').on("keyup", function(e) {
    var key = e.which;
    var sku = $('#search').val();
    if (key == 13 && sku){
      var url = window.location.origin + window.location.pathname;
      window.location.href =  url + '?sku=' + sku;
    }
  });

  requestProductChils();
});

var skusCount = 0;

function requestProductChils(){
  if (product._Skus){
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
}

function onFinishedLoading(){
  addFooter();
  $('.right-loading').hide().fadeIn().attr('src', '/img/checked.png').delay(2000).fadeOut();
}


function buildChildSku(product, child){
  var estoque = child._Estoque;

  var cols = [];
  cols.push(buildSkuCol(child));
  cols.push(buildCol(child.localizacao, true));
  cols.push(buildCol(estoque.estoqueReal, true, true));
  cols.push(buildCol(estoque.estoqueDisponivel));
  cols.push(buildCol(estoque.estoqueReal - estoque.estoqueDisponivel));

  estoqueRealTotal+= estoque.estoqueReal;
  estoqueDisponivelTotal+= estoque.estoqueDisponivel;
  estoqueReservadoTotal+= estoque.estoqueReal - estoque.estoqueDisponivel;

  var $tr = $('<tr>').addClass('tr-child');
  cols.forEach((col)=>{
    $tr.append(col);
  });

  if (product.selected == child.codigo){
    $tr.addClass('selected');
  }

  $('#child-skus-holder').append($tr);
}


function buildCol(val, canEdit, isNumber){
  var $valElement;

  if (canEdit){
    $valElement = $('<input>').attr('value',val).addClass('child-value editable-input');
    //Allow only numbers
    if (isNumber){
      $valElement.attr('onkeypress',"return isStockValid(event, this);");
    }
  }else{
    $valElement = $('<label>').addClass('child-value').text(val);
  }

  return $('<td>').addClass('td-child').append($valElement);
}

function buildSkuCol(product){
  var $sku = $('<label>').addClass('child-value child-sku').text(product.codigo);
  var $ean = $('<label>').addClass('child-title child-ean').text(product.gtin);

  return $('<td>').addClass('td-child').append($sku, $ean);
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

function isStockValid(event, input){
  return isNumberKey(event) && parseInt(input.value) < 1000;
}

function isNumberKey(evt){
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  return !(charCode > 31 && (charCode < 48 || charCode > 57));
}
