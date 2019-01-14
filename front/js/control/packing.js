$(document).ready(()=>{

  $('#search-sale').select();

  $('#product-ean').on("keyup", function(e) {
    if (e.which == 13 && $(this).val().length>10){
      checkProduct($(this).val());
    }
  });

  $('#search-sale').on("keyup", function(e) {
    if (e.which == 13 && $(this).val().length>5){
      window.location.href='/packing?sale=' + $(this).val();
    }
  });

  if (sale.items){
    initForPacking();
  }
});

function initForPacking(){
  refreshCountProductItens();

  createProductsTable('products-out-holder', 'products-out', {icon : false, title: 'Lista de Produtos do Pedido'});
  createProductsTable('products-in-holder', 'products-in', {icon: true, title: 'Lista de Produtos em Picking'} );
  loadProductsOutTable();

  addListeners();
}

function findItem(gtin){
  gtin = gtin.trim();

  return sale.items.find((each)=>{
    return each.gtin == gtin;
  });
}

function refreshCountProductItens(){
  $('#itens-progress').text(itemsChecked + '/' + sale.itemsQuantity);
}

function refreshProgressLine(){
  var progress = (itemsChecked * 100) / sale.itemsQuantity;
  var width = (progress * $('.progress-line').width()) / 100;

  $('.progress-line.inner').width(width);
}

function refreshSaleWeight(saleItem){
  sale.pesoLiquido = parseFloat(sale.pesoLiquido) + parseFloat(saleItem.liq);
  $('#sale-liq').val(Floa.weight(sale.pesoLiquido));

  sale.pesoBruto = parseFloat(sale.pesoBruto) + parseFloat(saleItem.bru);
  $('#sale-bru').val(Floa.weight(sale.pesoBruto));
}

function checkProduct(gtin){
  var saleItem = findItem(gtin);
  var erroMsg;

  if (saleItem){
    if (saleItem.checkedQtd == 0){
      erroMsg = 'Produto ' + saleItem.gtin + ' já foi adicionado';
    }else{
      beepSucess();
      handleProductChecking(saleItem);
    }
  }else{
    erroMsg = 'Produto ' + gtin + ' não está presente neste pedido!';
  }

  if(erroMsg){
    beepError();
    showProductMsg(erroMsg, 'alert');
  }
}



var itemsChecked = 0;


function handleProductChecking(saleItem){
  saleItem.checkedQtd--;
  itemsChecked++;

  if (saleItem.checkedQtd == 0){
    $('#out-' + saleItem.id).remove();
  }else{
    $('#out-' + saleItem.id).find('.qtd').text(fmtQtd(saleItem, false));
  }

  var inItem = $('#in-' + saleItem.id);

  if (inItem.length > 0){
    inItem.find('.qtd').text(fmtQtd(saleItem, true));
  }else{
    $('#products-in tr:first').after(buildProductLine(saleItem, {icon: true, table: 'in'}));
  }

  onOneMoreProductChecked(saleItem);
}

function onOneMoreProductChecked(saleItem){
  if (!$('.products-in-holder').is(":visible")){
    $('.products-in-holder').show();
    loadPackagesTypes();
  }

  if ($('#products-in tr').length == 3){
    $('.products-out-holder').find('.icon-open-list').click();
  }

  if (!$('.editable-infos-holder').is(":visible")){
    $('.editable-infos-holder').show();
  }

  if ($('#products-out tr').length == 1){
    onLastProductChecked();
  }else{
    showProductMsg(null, 'checked');
  }

  showLastProduct(saleItem);
  refreshSaleWeight(saleItem);
  refreshProgressLine();
  refreshCountProductItens();
}

function onLastProductChecked(){
  $('.products-out-holder').hide();
  $('#product-ean-icon').attr('src','img/barcode-ok.png');
  $('#product-ean').attr('disabled', true).val('Picking Finalizado').addClass('picking-over');
}

function createProductsTable(holder, id, data){
  var table = $('<table>').attr('id',id).addClass('products-table');

  var cols = [];

  if (!data || data.icon){
    cols.push($('<td>'));
  }

  var closeIcon = $('<img>').addClass('icon-open-list')
  .data('table',id)
  .attr('title', data.title)
  .data('title', data.title)
  .attr('src','img/open-up.png');

  cols.push($('<td>').append('Código'));
  cols.push($('<td>').append('EAN'));
  cols.push($('<td>').append('Descrição'));
  cols.push($('<td>').append('Marca'));
  cols.push($('<td>').append('Quantidade'));
  cols.push($('<td>').append('Peso Líquido'));
  cols.push($('<td>').append('Peso Bruto', closeIcon));



  $('.' + holder).append(table.append($('<tr>').append(cols)));
}

function buildProductLine(saleItem, data){
  var cols = [];

  if (!data || data.icon){
    cols.push(createProductIcon('checked'));
  }

  cols.push(createProductVal(saleItem.codigo).addClass('copiable'));
  cols.push(createProductVal(saleItem.gtin));

  var desc = createProductVal(saleItem.descricao.split('-')[0])
  .addClass('long-desc cursor-img');

  cols.push(desc);
  cols.push(createProductVal(saleItem.descricao.split('-')[1]).addClass('long-desc'));

  saleItem.quantidade = parseInt(saleItem.quantidade);

  if (saleItem.checkedQtd == undefined){
    saleItem.checkedQtd = saleItem.quantidade;
  }

  cols.push(createProductVal(fmtQtd(saleItem, data.table == 'in'), true).addClass('qtd'));

  cols.push(createProductVal(Floa.weight(saleItem.liq), true).addClass('long-desc'));
  cols.push(createProductVal(Floa.weight(saleItem.bru), true).addClass('long-desc'));

  var tr = $('<tr>').append(cols)
  .attr('id', data.table + '-' + saleItem.id);

  addHoverProductImage(desc, saleItem.codigo);

  return tr;
}

function createProductVal(val, center){
  var td = $('<td>').addClass('product-val').append($('<span>').append(val));

  if (center){
    td.css('text-align','center');
  }

  return td;
}

function createProductIcon(iconPath){
  return $('<td>').append($('<img>').attr('src','img/' + iconPath + '.png').addClass('product-icon'));
}

function fmtQtd(saleItem, useDif){
  var pre = useDif ? saleItem.quantidade - saleItem.checkedQtd : saleItem.checkedQtd;

  var showNormal = (saleItem.quantidade == 1) || (saleItem.checkedQtd == saleItem.quantidade);

  return  showNormal ? saleItem.quantidade : + pre + '/' + saleItem.quantidade;
}


function showProductMsg(msg, icon){
  $('#product-ean-icon').attr('src','img/'+ icon +'.png').hide().show();
  $('#product-ean').val('');
  showMessage(msg, true, ()=>{
    $('#product-ean-icon').attr('src','img/scan-barcode.png').show();
  });
}

function showMessage(msg, isError, onAutoHide){
  var delay = 2000 + (msg ? (msg.length * 150) : 0);
  console.log(delay);

  $('.product-msg')
  .text(msg)
  .css('color',isError ? 'red' : 'green')
  .clearQueue()
  .delay(delay)
  .queue(function(next){
    if (onAutoHide) onAutoHide();
    $(this).text('').clearQueue();
    next();
  });
}


function loadProductsOutTable(){
  sale.items.forEach(each => {
    $('#products-out tr:last').after(buildProductLine(each, {icon:false, table: 'out'}));
  });
}


function addListeners(){

  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    $(this).select();
    e.stopPropagation();
  });


  $('.icon-open-list').click(function(){
    var tableId = $(this).data('table');

    if (!$(this).hasClass('closed')){
      $(this).addClass('closed').attr('src','img/open-down.png').hide().fadeIn();
      $('#' + tableId + ' > tbody > tr').not(':first').hide();
      $('#' + tableId).parent().append($('<span>').addClass('title-product-closed ' + tableId).text($(this).data('title')));
    }else{
      $('.title-product-closed.' + tableId).remove();
      $(this).removeClass('closed').attr('src','img/open-up.png').hide().fadeIn();
      $('#' + tableId + ' > tbody  > tr').not(':first').show();
    }
  });
}



function addHoverProductImage(holder, sku){
  new ImagePreview(holder).hover((self)=>{
    _get('/product-image', {sku: sku },(product)=>{
      self.show(product.image);
    });
  });
}


function showLastProduct(saleItem){
  $('.input-group').hide();

  $('.last-product-holder').show();
  $('#last-product-img').attr('src','/sku-image?sku='+saleItem.codigo);
  $('#last-product-sku').text(saleItem.codigo);
}


function loadPackagesTypes(){


  new ComboBox($('#sale-package-type'), '/package-types')
  .setOnSelect((name, item)=>{
    $('#sale-height').val(item.height);
    $('#sale-width').val(item.width);
    $('#sale-length').val(item.length);
  }).load();

}
