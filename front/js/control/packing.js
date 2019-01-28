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

  $('#packing-done').click(packingClick);

  if (sale.items){
    initForPacking();
  }
});

function initForPacking(){
  showNfePrintControls();
  refreshCountProductItens();

  createProductsTable('products-out-holder', 'products-out', {icon : false, title: 'Lista de Produtos do Pedido'});
  createProductsTable('products-in-holder', 'products-in', {icon: true, title: 'Lista de Produtos em Picking'} );
  loadProductsOutTable();

  addListeners();

  sale.pesoLiquido = 0;
  sale.pesoBruto = 0;

  $('#product-ean').focus();
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

function refreshSaleWeight(liqWeight, bruWeigth){
  sale.pesoLiquido = parseFloat(sale.pesoLiquido) + parseFloat(liqWeight);
  $('#sale-liq').val(Floa.weight(sale.pesoLiquido)).data('val' , sale.pesoLiquido).hide().fadeIn();

  sale.pesoBruto = parseFloat(sale.pesoBruto) + parseFloat(bruWeigth);
  $('#sale-bru').val(Floa.weight(sale.pesoBruto)).data('val' , sale.pesoBruto).hide().fadeIn();
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

  if (itemsChecked == sale.itemsQuantity){
    showMainInputTitle('Confêrencia Finalizada', 'barcode-ok.png');
    autoSelectPackingType();
    $('#packing-done').fadeIn();
    $('#itens-progress').fadeIn();
    $('.products-out-holder').hide();
    $('#sale-liq').select();
  }else{
    showProductMsg(null, 'checked');
  }

  showLastProduct(saleItem);
  refreshSaleWeight(saleItem.liq, saleItem.bru);
  refreshProgressLine();
  refreshCountProductItens();
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

  cols.push(createProductVal(saleItem.codigo).addClass('copiable').dblclick(()=>{
    window.open('/stock?sku=' + saleItem.codigo,'_blank');
  }));
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
  .css('color', isError ? 'red' : 'green')
  .clearQueue()
  .fadeIn()
  .delay(delay)
  .queue(function(next){
    if (onAutoHide) onAutoHide();
    $(this).hide().clearQueue();
    next();
  });
}


function loadProductsOutTable(){
  sale.items.forEach(each => {
    $('#products-out tr:last').after(buildProductLine(each, {icon:false, table: 'out'}));
  });
}


function addListeners(){
  $('#print-nfe').click(()=>{
    window.open('/packing-danfe?nfe=' + sale.numeroNotaFiscal, '_blank');
  });

  $('#print-transport-tag').click(()=>{
    window.open('/packing-transport-tag?idnfe=' + sale.idNotaFiscalRef, '_blank');
  });

  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    $(this).select();
    e.stopPropagation();
  });


  $('.icon-open-list').click(function(e){
    var tableId = $(this).data('table');

    if (!$(this).hasClass('closed')){
      $(this).addClass('closed').attr('src','img/open-down.png').hide().fadeIn();
      $('#' + tableId + ' > tbody > tr').not(':first').hide();

      var title = $('<span>').addClass('title-product-closed ' + tableId).text($(this).data('title')).click(()=>{
        $(this).click();
      });

      $('#' + tableId).parent().append(title);
    }else{
      $('.title-product-closed.' + tableId).remove();
      $(this).removeClass('closed').attr('src','img/open-up.png').hide().fadeIn();
      $('#' + tableId + ' > tbody  > tr').not(':first').show();
    }

    e.stopPropagation();
    e.preventDefault();
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
  $('.material-input-holder').hide();

  $('.last-product-holder').show();

  new ProductImageLoader($('#last-product-img'))
  .src('/sku-image?sku='+saleItem.codigo).put();

  $('#last-product-sku').text(saleItem.codigo);
}

var packingTypeCombo;

function loadPackagesTypes(){
  $('#sale-package-type').focus(()=>{
    $('#sale-package-type').val('');
  });

  var lastWeight = 0;

  packingTypeCombo = new ComboBox($('#sale-package-type'), '/package-types');

  packingTypeCombo
  .setAutoShowOptions(true)
  .setOnSelect((name, item)=>{

    if (item.stockQtd < item.minStockQtd){
      $('.pack-alert').hide().fadeIn();
    }

    refreshSaleWeight(item.weight - lastWeight, item.weight - lastWeight);

    $('#sale-height').val(item.height).hide().fadeIn();
    $('#sale-width').val(item.width).hide().fadeIn();
    $('#sale-length').val(item.length).hide().fadeIn();
    $('#sale-package-type').data('sel',item._id);
    lastWeight = item.weight;
  }).load(()=>{
    //Para casos ontem tem só 1 peça no Pedido
    autoSelectPackingType();
  });

}


function checkAllFields(){
  var c = checkFloat($('#sale-liq'));
  c = checkFloat($('#sale-bru')) & c;
  c = checkInt($('#sale-vols')) & c;
  c = checkMaterialInput($('#sale-esp')) & c;

  c = checkInt($('#sale-height')) & c;
  c = checkInt($('#sale-width')) & c;
  c = checkInt($('#sale-length')) & c;


  return c;
}

function checkFloat(el){
  if (Floa.def(el.val().replace(',','.')) <= 0){
    onSimpleMaterialInputError(el);
    return false;
  }

  return true;
}

function checkInt(el){
  if (Num.def(el.val()) <= 0){
    onSimpleMaterialInputError(el);
    return false;
  }

  return true;
}

function packingClick(){
  if (checkAllFields()){
    postPackingDone();
  }
}

function postPackingDone(){
  $('#packing-done').fadeOut();
  showMainInputTitle('Atualizando Pedido...','/loader/circle.svg',  '#7eb5f1');
  $('.editable-infos-holder>input').prop("disabled", true);

  _post('packing-done', {
    saleNumber: sale.numeroPedido,
    liqWeigth : Floa.def($('#sale-liq').val()),
    bruWeigth : Floa.def($('#sale-bru').val()),
    vols: Num.def($('#sale-vols').val()),
    esp: $('#sale-esp').val(),
    height: Num.def($('#sale-height').val()),
    width: Num.def($('#sale-width').val()),
    length: Num.def($('#sale-length').val()),
    packageId: $('#sale-package-type').data('sel')
  },
  (result)=>{
    onSucess(result);
  },(error, message)=>{
    onError(error);
  });
}

function onSucess(result){
  if (result.code == 200){
    showMainInputTitle('Enviando Nf-e...','/loader/circle.svg',  '#7eb5f1');
    new Broadcast(sale.numeroPedido).onReceive((result)=>{
      onNfeSucess(result);
    });
  }
}

function onError(error){
  hideLastProductView();
  showMessage(error.responseText, true, false);
  showMainInputTitle('Erro na Requisição', 'alert.png', '#f36c6c');
}

function onNfeSucess(result){
  hideLastProductView();

  if (result.success.length > 0){
    result = result.success[0];

    if (result){
      sale.numeroNotaFiscal = result.codigo;
      sale.idNotaFiscalRef = result.id;
      $('#nfe-label').text(sale.numeroNotaFiscal);
      showNfePrintControls(true);
    }
  }else{
    showMessage(result.error[0], true, false);
    showMainInputTitle('Rejeição de Nfe', 'paper-alert.png', '#f1d26a');
  }
}

function hideLastProductView(){
  $('.material-input-holder').fadeIn();
  $('.last-product-holder').hide();
}


function showNfePrintControls(triggerClick){
  if (sale.numeroNotaFiscal && sale.numeroNotaFiscal.length > 0){
    showMainInputTitle('Nf-e Emitida', 'checked.png');

    $('#print-transport-tag').fadeIn();
    $('#print-nfe').fadeIn();

    if (triggerClick){
      $('#print-nfe').click();
      $('#print-transport-tag').click();
    }
  }
}


function showMainInputTitle(title, icon, lineColor){
  $('.progress-line.inner').width('100%').css('background', lineColor ? lineColor : '#4ad44f');
  $('#product-ean-icon').attr('src', 'img/' + icon);
  $('#product-ean').attr('disabled', true).val(title).addClass('picking-over');
  $('#itens-progress').hide();
}


function autoSelectPackingType(){
    var options = packingTypeCombo.getOptions();
    if (options && (itemsChecked == sale.itemsQuantity)){
      var packElement = null;
      var lastDif = 100000000;

      for(var i=0; i < options.length; i++){
        var pack = options[i];

        if (pack.maxWeight > sale.pesoLiquido){
          if ((pack.maxWeight - sale.pesoLiquido)  < lastDif){
            lastDif = pack.maxWeight - sale.pesoLiquido;
            packElement = pack;
          }
        }
      }

      if (packElement){
        packingTypeCombo.select(packElement);
      }
    }
}
