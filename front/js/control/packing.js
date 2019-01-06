$(document).ready(()=>{

  $('#search-sale').select();

  $('#product-ean').on("keyup", function(e) {
    if (e.which == 13 && $(this).val().length>10){
      checkAndAddProduct($(this).val());
    }
  });

  $('#search-sale').on("keyup", function(e) {
    if (e.which == 13 && $(this).val().length>5){
      window.location.href='/packing?sale=' + $(this).val();
    }
  });

});

function findProduct(gtin){
  return sale.items.find((each)=>{
    return each.gtin == gtin;
  });
}

function checkAndAddProduct(gtin){
  var product = findProduct(gtin);

  if (product){
    if (product.checked){
      showProductMsg('Produto ' + product.gtin + ' já foi adicionado', 'alert');
    }else{
      product.checked = true;
      $('#products-in tr:last').after(buildProductLine(product));
      showProductMsg(null, 'checked');
    }
  }
}

function buildProductLine(product){
  var cols = [];

  cols.push(createProductIcon('checked'));
  cols.push(createProductVal(product.codigo));
  cols.push(createProductVal(product.gtin));
  cols.push(createProductVal(product.descricao.split('-')[0]));
  cols.push(createProductVal(product.descricao.split('-')[1]));
  cols.push(createProductVal(parseInt(product.quantidade), true));

  cols.push(createProductVal(0, true));
  cols.push(createProductVal(0, true));
  return $('<tr>').append(cols);
}

function createProductVal(val, center){
  var td = $('<td>').addClass('product-val').append($('<label>').append(val));

  if (center){
    td.css('text-align','center');
  }

  return td;
}

function createProductIcon(iconPath){
  return $('<td>').append($('<img>').attr('src','img/' + iconPath + '.png').addClass('product-icon'));
}


function showProductMsg(msg, icon){
  $('#product-ean-icon').attr('src','img/'+ icon +'.png').hide().fadeIn();
  $('#product-ean').val('');
  showMessage(msg, true, ()=>{
    $('#product-ean-icon').attr('src','img/scan-barcode.png').fadeIn();
  });
}

function showMessage(msg, isError, onAutoHide){
  $('.product-msg')
  .text(msg)
  .css('color',isError ? 'red' : 'green')
  .clearQueue()
  .delay(1000 + (msg ? (msg.length * 20) : 0))
  .queue(function(next){
    if (onAutoHide) onAutoHide();
    $(this).text('');
    next();
  });
}
