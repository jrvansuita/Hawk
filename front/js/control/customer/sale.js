$(document).ready(() => {

  loadCompletSaleData((data) => {
    bindSaleInfoViewer(data.data);
  });

  $('.sale-nfe').dblclick(() => {
    printNFe();
  });
});

function printNFe(){
  if($('.sale-nfe').text() != '########'){
    window.open('/packing-danfe?nfe=' +$('.sale-nfe').text());
  }
}

function menuClick(menu){

  menu.click(function(e){
    var drop = new MaterialDropdown($(this), e);
    var cardClass =  menu.parent().prop('className');

    if(cardClass.includes('payment') && data.payment.method == 'mundipagg_boleto'){
      drop.addItem('/img/barcode.png', 'Imprimir Boleto', function(){
        window.open(data.payment.boleto);
      });
    }else if(cardClass.includes('transport')){
      drop.addItem('/img/transport/default.png', 'Rastreio', function(){
        window.open("https://status.ondeestameupedido.com/tracking/6560/" + data.oc);
      });
    }
    drop.show();
  });
}

function buildMenu(holder){
  $menu = $('<div>').addClass('menu-dots');
  $menuImg = $('<img>').addClass('dots-glyph').attr('src', '../../img/dots.png');

  $menu.append($menuImg);
  menuClick($menu);

  return holder.prepend($menu);
}


function loadCompletSaleData(callback){
  _get('/customer-service/sale', {saleNumber : saleNumber}, (data) => {
    window.data = data.data;
    window.provisorio = data.provisorio;
    callback(data);
  })
}

function bindClientSaleInfo(data){
  $('.sale-client-name').text(data.client.name);
  $('.sale-client-social-code').text(data.client.socialCode);
  $('.sale-client-date').text(data.client.dateOfBirth);
}

function bindSaleAddressInfo(data){
  buildMenu($('.card-transport'));

  $('.sale-shipping-adress-street').text(data.shipping_address.street + ', ' + data.shipping_address.number);
  $('.sale-shipping-adress-bairro').text(data.shipping_address.bairro);
  $('.sale-shipping-adress-complemento').text(data.shipping_address.complement);
  $('.sale-shipping-postal-code').text(data.shipping_address.cep);
  $('.sale-shipping-city').text(data.shipping_address.city);
  $('.sale-shipping-uf').text(data.shipping_address.state);

  $('.sale-billing-adress-street').text(data.billing_address.street + ', ' + data.billing_address.number);
  $('.sale-billing-adress-bairro').text(data.billing_address.bairro);
  $('.sale-billing-adress-complemento').text(data.billing_address.complement);
  $('.sale-billing-adress-postal-code').text(data.billing_address.cep);
  $('.sale-billing-adress-city').text(data.billing_address.city);
  $('.sale-billing-adress-uf').text(data.billing_address.state);

  $('.sale-shipping-transport').text(data.transport.name);
  $('#transport-img').attr('src', '/img/transport/' + provisorio.erp.transport + '.png');
  $('.sale-shipping-transport-description').text(data.transport.desc);
  $('.sale-shipping-transport-cost').text(Num.money(data.transport.cost));


}

function bindPaymentInfo(data){
  buildMenu($('.card-payment'));
  $('.payment-img').attr('src','/img/' + checkPaymentMethod(data.payment.method) + '.png');
  $('.sale-payment-method').text(Util.getPaymentType(data.payment.method));
  $('.sale-payment-total').text(Num.money(data.payment.total));
  $('.sale-payment-info').text(data.payment.desc);
  $('.sale-payment-status').text(data.payment.status);
}

function checkPaymentMethod(method){
  if(method.includes('boleto')) return 'barcode';
  if(method.includes('creditcard')) return 'credit-card';
  if(method.includes('paypal')) return 'paypal';
}


function saleStatusDePara(status){
  switch(status){
    case 'processing':{
      return 'Pagamento Confirmado';
      break;
    }
    case 'separation':{
      return 'Em Separação';
      break;
    }
    case 'pending_payment':{
      return 'Pagamento Pendente';
      break;
    }
    case 'payment_review':{
      return 'Aguardando Analise Antifraude';
      break;
    }
    case 'waiting_antifraud_analisys':{
      return 'Análise do Credito';
      break;
    }
    case 'holded':{
      return 'Bloqueado na Expedição';
      break;
    }
    case 'ip_delivered':{
      return 'Entregue';
      break;
    }
  }
}

function bindSaleItens(data){

  var $tableHolder = $('.client-sale-itens');
  var itensCount = 0;

  data.items.sort((a, b) => {
    if(a.erp.toString().length < b.store.toString().length ) return 1;
    if(a.erp.toString().length  > b.store.toString().length ) return -1;
    return 0;
  });

  data.items.forEach((item) => {
    itensCount++;

    var itemErpChanged = item.erp == false ? 'Removido' : '';
    var itemStoreChanged = item.store == false ? 'Adicionado' : '';

    var $saleItensHolder = $('<tr>').addClass('sale-itens-information');
    var $itemInfos = $('<td>').addClass('sale-item-infos');

    var $itemDesc = $('<span>').addClass('sale-item-desc');
    var $itemSku = $('<span>').addClass('item-sku copiable');
    var $itemName = $('<span>').addClass('gray');

    var $itemQtd = $('<td>').addClass('sale-item-quantity center');
    var $itemPrice = $('<td>').addClass('sale-item-price center');
    var $itemDiscount = $('<td>').addClass('sale-item-discount center');
    var $itemWeight = $('<td>').addClass('sale-item-weight center');
    var $itemTotalValue = $('<td>').addClass('sale-item-total-value center');

    if(itemErpChanged || itemStoreChanged){
      var $itemObs = $('<span>').addClass('right changed');
      $itemObs.text(itemErpChanged || itemStoreChanged);
    }

    $itemInfos.append($itemDesc.append($itemSku.text(item.sku + ' - '), $itemName.text(item.name), $itemObs));

    $saleItensHolder.append($itemInfos,
      $itemQtd.text(Num.int(item.quantity)),
      $itemPrice.text(Num.money(item.price)),
      $itemDiscount.text(Num.money(item.discount)),
      $itemWeight.text(item.weight),
      $itemTotalValue.text(Num.money(item.total)));

      $tableHolder.append($saleItensHolder);
    });
    $('.sale-itens-count').text("Itens Magento: "+ data.magentoItensQuantity + " " + "Itens Eccosys: "+ data.eccoItensQuantity);
    bindCopiable();
  }

  function bindSaleTotalInfo(data){
    $('.sale-info-subtotal').text(Num.money(data.subtotal));
    $('.sale-info-discount').text(Num.money(data.discount));
    $('.sale-info-weight-total').text(data.weight);
    $('.sale-info-total').text(Num.money(data.total));

  }

  function bindSaleBasicInfos(data){
    $('.sale-number').text(data.oc);
    $('.sale-ecco').text(data.number);
    $('.sale-nfe').text(data.nf || '########');
    $('.status').text(data.status);
    $('.sale-situation').text(data.situation);
    $('.sale-step').text(data.pickingStatus);
    $('.sale-date').text(data.saleDate);
  }

  function bindSaleHistory(data){

    var comments = [];
    var $commentsEccoTable = $('.ecco-comments-table');
    var $commentsMageTable = $('.magento-comments-table');

    comments = data.comments.erp.split(/\n/g);

    comments.reverse().forEach((each) => {
      var $commentsTr = $('<tr>');
      var $commentsTd = $('<td>');
      $commentsTd.text(each);

      $commentsEccoTable.append($commentsTr.append($commentsTd));
    });

    data.comments.store.filter((each) => {
      if(each.comment != null && each.comment != '[Intelipost Webhook] - ' && each.comment != '[ERP - ECCOSYS] - '){
        var $commentsTr = $('<tr>');
        var $commentsDate = $('<td>').addClass('comment-date');
        var $commentsTd = $('<td>');

        $commentsTd.text(each.comment);
        $commentsDate.text(Dat.formatwTime(Dat.rollHour(new Date(each.created_at),-3)));

        $commentsMageTable.append($commentsTr.append($commentsDate,$commentsTd));
      }
    });

  }

  function bindSaleInfoViewer(data){
    bindSaleBasicInfos(data);
    bindClientSaleInfo(data);
    bindSaleAddressInfo(data);
    bindPaymentInfo(data);
    bindSaleItens(data);
    bindSaleTotalInfo(data);
    bindSaleHistory(data);

    $('.loading-sale-modal').hide();
    $('.sale-dialog').css('display','flex');

  }
