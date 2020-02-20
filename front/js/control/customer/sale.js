$(document).ready(() => {

  loadCompletSaleData((data) => {
    bindSaleInfoViewer(data.data);
  });
  $('.menu-transport').click(() => {
    menuTransportClick();
  });
});


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

function bindSaleShippingInfo(data){
  $('.sale-shipping-adress-street').text(data.shipping_address.street + ', ' + data.shipping_address.number);
  $('.sale-shipping-adress-bairro').text(data.shipping_address.bairro);
  $('.sale-shipping-adress-complemento').text(data.shipping_address.complement);
  $('.sale-shipping-postal-code').text(data.shipping_address.cep);
  $('.sale-shipping-city').text(data.shipping_address.city);
  $('.sale-shipping-uf').text(data.shipping_address.state);

  $('.sale-shipping-transport').text(data.transport.name);
  //$('#transport-img').attr('src', data.erp.transportadora_img);
  $('.sale-shipping-transport-description').text(data.transport.desc);
  $('.sale-shipping-transport-cost').text(Num.money(data.transport.cost));
}

function bindPaymentInfo(data){
  $('.sale-payment-method').text(Util.getPaymentDescription(data.payment.method));
  $('.sale-payment-total').text(Num.money(data.payment.total));
  $('.sale-payment-info').text(data.payment.desc || "1x (à vista)");
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
  data.items.forEach((item) => {
      itensCount++;
      var $saleItensHolder = $('<tr>').addClass('sale-itens-information');
      var $itemInfos = $('<td>').addClass('sale-item-infos');

      var $itemDesc = $('<span>').addClass('sale-item-desc');
      var $itemSku = $('<p>').addClass('item-sku copiable');
      var $itemQtd = $('<td>').addClass('sale-item-quantity');
      var $itemPrice = $('<td>').addClass('sale-item-price');
      var $itemDiscount = $('<td>').addClass('sale-item-discount');
      var $itemWeight = $('<td>').addClass('sale-item-weight');
      var $itemTotalValue = $('<td>').addClass('sale-item-total-value');

      $itemInfos.append($itemDesc.text(item.name), $itemSku.text(item.sku));

      $saleItensHolder.append($itemInfos,
        $itemQtd.text(Num.int(item.quantity)),
        $itemPrice.text(Num.money(item.price)),
        $itemDiscount.text(Num.money(item.discount)),
        $itemWeight.text(item.weight),
        $itemTotalValue.text(Num.money(item.total)));

        $tableHolder.append($saleItensHolder);
      });
      $('.sale-itens-count').text("Itens: "+ data.items.length);
      bindCopiable();

    }


  function bindSaleTotalInfo(data){
    $('.sale-info-subtotal').text(Num.money(data.store.base_subtotal));
    $('.sale-info-discount').text(Num.money(data.store.discount_amount));
    $('.sale-info-weight-total').text(data.store.weight);
    $('.sale-info-total').text(Num.money(data.store.base_grand_total));

  }

  function bindSaleBasicInfos(data){
    $('.sale-number').text(data.oc);
    $('.sale-ecco').text(data.number);
    $('.sale-nfe').text(data.nf || '########');
    $('.status').text(saleStatusDePara(data.status));
    $('.sale-situation').text(data.situation);
    $('.sale-step').text(data.pickingStatus);
    $('.sale-date').text(data.saleDate);
  }

  function menuTransportClick(){
    return function(e){
      new MaterialDropdown($(this), e)
      .addItem('../img/transport/default.png', 'Rastreio', ()=>{
        window.open('https://status.ondeestameupedido.com/tracking/6560/' + sale, '_blank');
      }).show();
    }
  }

  function bindSaleInfoViewer(data){
    $('.loading-sale-modal').hide();

    bindSaleBasicInfos(data);
    bindClientSaleInfo(data);
    bindSaleShippingInfo(data);
    bindPaymentInfo(data);
    bindSaleItens(data);
    /*bindSaleTotalInfo(data);
    */
  }
