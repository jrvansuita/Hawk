$(document).ready(() => {

  loadCompletSaleData((data) => {
    bindSaleInfoViewer(data);
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
  $('.sale-client-name').text(data.store.customer_firstname + " " + data.store.customer_lastname);
  $('.sale-client-social-code').text(data.store.customer_taxvat);
  $('.sale-client-date').text(Dat.formatwTime(new Date(data.store.customer_dob)));
}

function bindSaleShippingInfo(data){
  $('.sale-shipping-adress-street').text(data.store.shipping_address.street + ", " + data.store.shipping_address.num);
  $('.sale-shipping-adress-bairro').text(data.store.shipping_address.street.bairro);
  $('.sale-shipping-adress-complemento').text(data.store.shipping_address.complemento);
  $('.sale-shipping-postal-code').text(data.store.shipping_address.postcode);
  $('.sale-shipping-city').text(data.store.shipping_address.city);
  $('.sale-shipping-uf').text(data.store.shipping_address.region);
  $('.sale-shipping-transport').text(data.erp.transportador.split(" ",1));
  $('#transport-img').attr('src', data.erp.transportadora_img);
  $('.sale-shipping-transport-description').text(data.store.shipping_description);
  $('.sale-shipping-transport-cost').text(Num.money(data.store.shipping_amount));
}

function bindPaymentInfo(data){
  $('.sale-payment-method').text(Util.getPaymentDescription(data.store.payment.method));
  $('.sale-payment-total').text(Num.money(data.store.payment.base_amount_ordered));
  $('.sale-payment-info').text(data.store.payment.installment_description || "1x (à vista)");
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
  data.store.items.forEach((item) => {

    if(item.parent_item_id === null){
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
        $itemQtd.text(Num.int(item.qty_ordered)),
        $itemPrice.text(Num.money(item.price)),
        $itemDiscount.text(Num.money(item.discount_amount)),
        $itemWeight.text(item.weight),
        $itemTotalValue.text(Num.money(item.price - item.discount_amount)));

        $tableHolder.append($saleItensHolder);
      }});
      $('.sale-itens-count').text("Itens Magento: "+ itensCount + " Itens Eccosys: " + data.erp.items.length);
      bindCopiable();

    }


  function bindSaleTotalInfo(data){
    $('.sale-info-subtotal').text(Num.money(data.store.base_subtotal));
    $('.sale-info-discount').text(Num.money(data.store.discount_amount));
    $('.sale-info-weight-total').text(data.store.weight);
    $('.sale-info-total').text(Num.money(data.store.base_grand_total));

  }

  function bindSaleBasicInfos(data){
    $('.sale-number').text(data.erp.numeroDaOrdemDeCompra);
    $('.sale-ecco').text(data.erp.numeroPedido);
    $('.sale-nfe').text(data.erp.numeroNotaFiscal || '########');
    $('.status').text(saleStatusDePara(data.store.status));
    $('.sale-situation').text(Util.getSaleSituationName(parseInt(data.erp.situacao)));
    $('.sale-step').text(Util.getSaleStatusName(data.erp.pickingRealizado));
    $('.sale-date').text(Dat.formatwTime(Dat.rollHour(new Date(data.store.created_at),-3)));
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
    bindSaleTotalInfo(data);
  }
