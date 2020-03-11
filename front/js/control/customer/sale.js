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
  if($('.sale-nfe').text() != 'Sem Nota Fiscal'){
    window.open('/packing-danfe?nfe=' + $('.sale-nfe').text());
  }
}

function menuClick(menu){

  menu.click(function(e){
    var drop = new MaterialDropdown($(this), e, false, true);
    var cardClass =  menu.parent().prop('className');

    if(cardClass.includes('payment') && data.payment.method == 'mundipagg_boleto'){

      //data atual e data do vencimento do boleto
      var actualDate = new Date();
      var boletoExpiresDate = new Date(data.payment.boleto_expires);

      drop.addItem('/img/barcode.png', 'Imprimir Boleto', function(){
        window.open(data.payment.boleto);
      });

      //compara as datas, só mostra se a atual for menos que do vencimento
      if(actualDate < boletoExpiresDate){
        drop.addItem('/img/envelop.png', 'Enviar Boleto por Email', function(){
          $(menu).children().attr('src','/img/loader/circle.svg');

          _post('/customer-email-boleto', {
            cliente: data.client,
            oc: data.oc,
            linkBoleto: data.payment.boleto,
            userid: loggedUser.id
          }, (result) => {
            if(result){
              showMenuMsg(menu, 'Email enviado', 'sucess');

            }else{
              showMenuMsg(menu, 'Erro ao enviar email', 'error');
            }
          });
        });
      }
    }else if(cardClass.includes('transport')){
      drop.addItem('/img/transport/default.png', 'Rastreio', function(){
        window.open(Params.trackingUrl() + data.oc);
      });

      drop.addItem('/img/envelop.png', 'Enviar Rastreio por Email', function(){
        $(menu).children().attr('src','/img/loader/circle.svg');

        _post('/customer-email-tracking',{
          cliente: data.client,
          oc: data.oc,
          tracking: Params.trackingUrl() + data.oc,
          userid: loggedUser.id
        }, (result) => {
          result ? showMenuMsg(menu, 'Email enviado', 'sucess') : showMenuMsg(menu, 'Erro ao enviar email', 'error');
        });
      });
    }

    else if(cardClass.includes('sale-header-holder')){
      drop.addItem('/img/envelop.png', 'Enviar NF', function(){
        $(menu).children().attr('src','/img/loader/circle.svg');

        _post('/customer-email-danfe',{
          cliente: data.client,
          oc: data.oc,
          nfNumber: data.nf,
          userid: loggedUser.id
        }, (result) => {
          result ? showMenuMsg(menu, 'Nota fiscal enviada', 'sucess') : showMenuMsg(menu, 'Erro ao enviar nota fiscal', 'error');
        });
      });

      drop.addItem('/img/paper.png', 'Visualizar NF', function(){
        printNFe();
      });

    }
    drop.show();
  });
}

function copyTextFromElement(id) {
  var range = document.createRange();
  range.selectNode(document.getElementById(id));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand("copy");
  window.getSelection().removeAllRanges();
}

function showMenuMsg(holder, msg, type){
  if(type == 'error'){
    $(holder).children().attr('src','/img/error.png');
  }else{
    $(holder).children().attr('src','/img/checked.png');
  }

  $(holder).append($('<span>').addClass('msg-info').text(msg).delay(3000).queue(() => {
    $('.msg-info').remove();
    $(holder).children().attr('src','/img/dots.png');
  }));
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
  $('.sale-client-email').text(data.client.email);
}

function bindSaleAddressInfo(data){
  buildMenu($('.card-transport'));

  $('.sale-shipping-adress-street').text(data.shipping_address.street);
  $('.sale-shipping-adress-bairro').text(data.shipping_address.bairro);
  $('.sale-shipping-adress-complemento').text(data.shipping_address.complement);
  $('.sale-shipping-postal-code').text(Util.formatCEP(data.shipping_address.cep));
  $('.sale-shipping-city').text(data.shipping_address.city);
  $('.sale-shipping-uf').text(data.shipping_address.state);

  $('.sale-billing-adress-street').text(data.billing_address.street);
  $('.sale-billing-adress-bairro').text(data.billing_address.bairro);
  $('.sale-billing-adress-complemento').text(data.billing_address.complement);
  $('.sale-billing-adress-postal-code').text(Util.formatCEP(data.billing_address.cep));
  $('.sale-billing-adress-city').text(data.billing_address.city);
  $('.sale-billing-adress-uf').text(data.billing_address.state);

  //card transport
  $('.sale-shipping-transport').text(data.transport.name);
  $('#transport-img').attr('src', '/img/transport/' + data.transport.name.toLocaleLowerCase() + '.png');
  $('.sale-shipping-transport-description').html(data.transport.desc + '<br>' + data.transport.tracking);
  $('.sale-shipping-transport-delivery').html(Dat.format(new Date(addDaysToDate(data.date, data.transport.deliveryTime))));

  if(data.transport.cost > 0){
    $('.sale-shipping-transport-cost').text(Num.money(data.transport.cost));
  }else{
    $('.sale-shipping-transport-cost').addClass('sale-status').text(data.transport.cost);
  }
}

function bindPaymentInfo(data){
  $('.card-payment').css('border-top', '3px solid '+ setBorderOnCard(data.status));
  $('.payment-img').attr('src', getPaymentMethodImage(data.payment.method));
  $('.sale-payment-method').text(Util.getPaymentType(data.payment.method));
  $('.sale-payment-total').text(Num.money(data.payment.total));
  $('.sale-payment-info').text(data.payment.desc);
  $('.sale-payment-status').addClass('info').text(data.payment.status).css('border-color', setBorderOnCard(data.status));

  if($('.sale-payment-method').text() == "Boleto"){
    buildMenu($('.card-payment'));
  }
}

function setBorderOnCard(status){
  if(status == 'pending_payment'){
    return "#efd834";
  }
  else if(status == 'canceled'){
    return "#ff0006";
  }
  else{
    return "#61d427";
  }
}

function addDaysToDate(date, days){
  var result = new Date(date);

  result.setDate(result.getDate() + days);
  return result;
}

function getPaymentMethodImage(method){
  if(method.includes('boleto')) return '/img/barcode.png';
  if(method.includes('creditcard')) return '/img/credit-card.png';
  if(method.includes('paypal')) return '/img/paypal.png';
  if(method.includes('free')) return '/img/voucher.png'

}

function setTagOnItem(itemStatus){
  var $itemObs = $('<span>');

  if(itemStatus == 'Removido'){
    $itemObs.addClass('right item-removed');
    $itemObs.text(itemStatus);

    return $itemObs;
  }
  else{
    $itemObs.addClass('right item-add');
    $itemObs.text(itemStatus);

    return $itemObs;
  }
}

function bindSaleItens(data){

  $('.qtd').text('Qtd: ' + data.totalPecas);
  $('.sale-itens-count').text("Itens Magento: "+ data.magentoItensQuantity + " " + "Itens Eccosys: "+ data.eccoItensQuantity);

  var $tableHolder = $('.client-sale-itens');

  //sorting items
  data.items.sort((a, b) => {
    if(a.erp < b.store ) return 1;
    if(a.erp  > b.store ) return -1;
    return 0;
  });

  data.items.reverse().forEach((item) => {

    //tabela de itens
    var $saleItensHolder = $('<tr>').addClass('sale-itens-information');

    //item sku
    var $itemSkuHolder = $('<td>').addClass('item-sku-holder copiable').text(item.sku).dblclick(() => {
      window.open('/product?sku=' + $itemSkuHolder.text());
    });

    //item name
    var $itemNameHolder = $('<td>').addClass('sale-item-infos');
    var $itemName = $('<span>').addClass('item-name').dblclick(() => {
      window.open('/product-url-redirect?sku=' + $itemSkuHolder.text());
    });
    var $itemBrand = $('<td>').addClass('item-brand');

    //tag for item if is pending or voucher
    var itemErpChanged = item.erp == false ? 'Removido' : '';
    var itemStoreChanged = item.store == false ? 'Adicionado' : '';

    if(itemErpChanged || itemStoreChanged){
      var $itemObs = setTagOnItem(itemErpChanged || itemStoreChanged);
    }

    $itemNameHolder.append($itemName.text(item.name.split('-')[0]), $itemObs);

    var $itemQtd = $('<td>').addClass('sale-item-quantity center');
    var $itemPrice = $('<td>').addClass('sale-item-price center');
    var $itemDiscount = $('<td>').addClass('sale-item-discount center gray');
    var $itemWeight = $('<td>').addClass('sale-item-weight center gray');
    var $itemTotalValue = $('<td>').addClass('sale-item-total-value center');

    $saleItensHolder.append($itemSkuHolder,
      $itemNameHolder,
      $itemBrand.text(item.name.split('-')[1]),
      $itemQtd.text(Num.int(item.quantity)),
      $itemPrice.text(Num.money(item.price)),
      $itemDiscount.text(Num.money(item.discount)),
      $itemWeight.text(item.weight),
      $itemTotalValue.text(Num.money(item.total)));

      $tableHolder.append($saleItensHolder);

      hoverProductImage($itemName, item.sku);
    });

    bindCopiable();
  }

  function bindSaleTotalInfo(data){
    if(data.transport.cost == 'Frete Grátis'){
      $('.tr-frete').hide();
    }
    $('.sale-info-subtotal').text(Num.money(data.subtotal));
    $('.sale-info-cupom').html(data.payment.coupon ? data.payment.coupon.toLocaleUpperCase() + '<br>' + data.payment.discount_desc.split(',').join('<br>') : data.payment.discount_desc);
    $('.sale-info-discount').text(Num.money(data.discount));
    $('.sale-info-weight-total').text(data.weight);
    $('.sale-info-total').text(Num.money(data.total));
  }

  function bindSaleBasicInfos(data){
    if(!data.payment.coupon && !data.payment.discount_desc){
      $('.cupom-card').hide();
    }

    $('.sale-number').text(data.oc).dblclick(() => {
      window.open('/packing?sale=' +$('.sale-number').text());
    });
    $('.sale-ecco').text(data.number);
    $('.sale-nfe').text(data.nf || 'Sem Nota Fiscal');
    $('.status').text(Util.getSaleStatusInfo(data.status)).css('border-color', Util.strToColor(data.status));
    $('.sale-situation').text(data.situation);
    $('.sale-step').text(data.pickingStatus);
    $('.sale-date').text(data.saleDate);

    if($('.sale-nfe').text() != 'Sem Nota Fiscal'){
      buildMenu($('.sale-header-holder'));
    }

    $('.sale-viewer-holder').css('border-top', '3px solid ' + setBorderOnCard(data.status));
  }

  function bindSaleHistory(data){

    var comments = [];
    var $commentsEccosysTable = $('.history-comments-table');
    var $magentoCommentsTable = $('.magento-comments-table');

    comments = data.comments.erp.split(/\n/g);

    comments.reverse().forEach((each) => {
      var $comment = $('<p>').addClass('ecco-comments');
      $comment.text(each);
      $commentsEccosysTable.append($comment);
    });

    data.comments.store.forEach((each) => {
      var $commentsTr = $('<tr>').addClass('comments');
      var $commentsDate = $('<td>').addClass('comment-date');
      var $commentsTd = $('<td>');

      var $commentTitle = $('<p>').addClass('comment-title');
      var $commentDesc = $('<span>');

      var $commentNotified = $('<img>').attr('src','/img/checked.png').addClass('client-notified');

      $commentTitle.text(Util.getSaleStatusInfo(each.status));
      $commentDesc.text(each.comment);

      if(each.is_customer_notified == 1){
        $commentTitle.append($commentNotified);
      }

      $commentsTd.append($commentTitle, $commentDesc);

      $commentsDate.text(Dat.formatwTime(Dat.rollHour(new Date(each.created_at),-3)));
      $magentoCommentsTable.append($commentsTr.append($commentsDate,$commentsTd));
    });
  }

  function hoverProductImage(holder, sku){
    new ImagePreview(holder).hover((self) => {
      _get('/product-image', {sku: sku },(product)=>{
        self.show(product.image);
      });
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
