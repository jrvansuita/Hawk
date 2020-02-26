$(document).ready(() => {

  $('.sale-viewer-holder').css('border-top', 'none');

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
  $('#transport-img').attr('src', '/img/transport/' + data.transport.name + '.png');
  $('.sale-shipping-transport-description').text(data.transport.desc);
  $('.sale-shipping-transport-cost').text(Num.money(data.transport.cost));


}

function bindPaymentInfo(data){
  buildMenu($('.card-payment'));
  var saleStatus = saleStatusDePara(data.payment.status);

  $('.payment-img').attr('src', getPaymentMethodImage(data.payment.method));
  $('.sale-payment-method').text(Util.getPaymentType(data.payment.method));
  $('.sale-payment-total').text(Num.money(data.payment.total));
  $('.sale-payment-info').text(data.payment.desc);
  $('.sale-payment-status').addClass(data.payment.status).text(saleStatus);
}

function getPaymentMethodImage(method){
  if(method.includes('boleto')) return '/img/barcode.png';
  if(method.includes('creditcard')) return '/img/credit-card.png';
  if(method.includes('paypal')) return '/img/paypal.png';
}


function saleStatusDePara(status){
  switch(status){
    //sale status
    case 'processing': return 'Pagamento Confirmado';
    case 'canceled': return 'Cancelado';
    case 'separation': return 'Em Separação';
    case 'pending_payment': return 'Pagamento Pendente';
    case 'payment_review': return 'Aguardando Analise Antifraude';
    case 'waiting_antifraud_analisys': return 'Análise do Credito';
    case 'holded': return 'Bloqueado na Expedição';
    case 'ip_delivered': return 'Entregue';
    case 'ip_delivery_failed': return 'Entrega Falhou';
    case 'ip_delivery_late': return 'Atraso na Entrega';
    case 'ip_in_transit': return 'Em Trânsito';
    case 'ip_shipped': return 'Despachado';
    case 'awaiting': return 'Aguardando Devolução';
    case 'complete': return 'Conferência do(s) produto(s) e NF-e';
    case 'closed': return 'Estornado';
    case 'ip_shipped': return 'Despachado';

    //sale payment status
    case ('Captured' || 'Paid') : return 'Pago';
    case 'Generated': return 'Não Pago';
  }
}

function bindSaleItens(data){

  var $tableHolder = $('.client-sale-itens');

  data.items.sort((a, b) => {
    if(a.erp < b.store ) return 1;
    if(a.erp  > b.store ) return -1;
    return 0;
  });

  data.items.forEach((item) => {

    var itemErpChanged = item.erp == false ? 'Removido' : '';
    var itemStoreChanged = item.store == false ? 'Adicionado' : '';

    var $saleItensHolder = $('<tr>').addClass('sale-itens-information');
    var $itemInfoHolder = $('<td>').addClass('sale-item-infos');
    var $itemName = $('<span>').addClass('item-name');
    var $itemDesc = $('<span>').addClass('sale-item-desc');

    var $itemSku = $('<span>').addClass('item-sku copiable').dblclick(() => {
      window.open('/product?sku=' + $itemSku.text());
    });

    var $itemQtd = $('<td>').addClass('sale-item-quantity center');
    var $itemPrice = $('<td>').addClass('sale-item-price center');
    var $itemDiscount = $('<td>').addClass('sale-item-discount center');
    var $itemWeight = $('<td>').addClass('sale-item-weight center');
    var $itemTotalValue = $('<td>').addClass('sale-item-total-value center');

    if(itemErpChanged || itemStoreChanged){
      var $itemObs = $('<span>').addClass('right changed');
      $itemObs.text(itemErpChanged || itemStoreChanged);
    }

    $itemInfoHolder.append($itemDesc.append($itemSku.text(item.sku), $itemName.text(' - ' + item.name), $itemObs));

    $saleItensHolder.append($itemInfoHolder,
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
    $('.sale-info-cupom').text(data.payment.coupon || 'Não possui');
    $('.sale-info-discount').text(Num.money(data.discount));
    $('.sale-info-weight-total').text(data.weight < 1.000 ? data.weight + 'g' : data.weight + 'Kg');
    $('.sale-info-total').text(Num.money(data.total));
  }

function bindSaleBasicInfos(data){
    $('.sale-number').text(data.oc).dblclick(() => {
      window.open('/packing?sale=' +$('.sale-number').text());
    });
    $('.sale-ecco').text(data.number);
    $('.sale-nfe').text(data.nf || '########');
    $('.status').text(saleStatusDePara(data.status));
    $('.sale-situation').text(data.situation);
    $('.sale-step').text(data.pickingStatus);
    $('.sale-date').text(data.saleDate);

    //fazer logica para bordar do modal conforme o status do pedido
    /*if($('.status').text() == 'Cancelado'){
      $('.sale-viewer-holder').css('border-top', '3px solid red');
    }else if($('.status').text() != 'Pagamento Confirmado'){
      $('.sale-viewer-holder').css('border-top', '3px solid #FF9800');
    }
    else{
      $('.sale-viewer-holder').css('border-top', '3px solid rgb(74, 212, 79)');
    }*/
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

    data.comments.store.forEach((each) => {
        var $commentsTr = $('<tr>');
        var $commentsDate = $('<td>').addClass('comment-date');
        var $commentsTd = $('<td>');

        $commentsTd.text(each.comment);
        $commentsDate.text(Dat.formatwTime(Dat.rollHour(new Date(each.created_at),-3)));
        $commentsMageTable.append($commentsTr.append($commentsDate,$commentsTd));
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
