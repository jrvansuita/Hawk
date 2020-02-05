$(document).ready(() => {
  $(".checkable-avatar").change(function() {
    var $img = $(this).parent().find('img');
    if(this.checked) {
      $img.attr('src', '/img/checked.png').hide().fadeIn(300);
    }else{
      $img.attr('src', $img.data('src')).hide().fadeIn(300);
    }

    var count = $(this).closest('.pending-box').find('.pending-count').data('count');
    var selecteds = $(this).closest('.pending-box').find('.checkable-avatar:checkbox:checked').length;
    $(this).closest('.pending-box').find('.pending-count').text(selecteds == 0 ?  count : selecteds + '/' + count);
  });


  $('.label-for-avatar').click(function(e){
    e.stopPropagation();
  });


  $('.pending-item').click(function(e){
    var saleNumber = $(this).data('sale').split('-')[1];
    loadPendingSaleItems($(this), getPendingSale(saleNumber));
    e.stopPropagation();
  });



  if (location.pathname.includes('pending')){

    $('.menu-dots').each((index, el)=>{
      $(el).click(function(e){
        var drop = new MaterialDropdown($(this), e);

        /*if ($(el).hasClass('menu-red-top')){
        if (Sett.get(loggedUser, 10)){
        drop.addItem('/img/send-mass-email.png', 'Enviar Todos E-mails', function(){
        $('.menu-red-top>.dots-glyph').attr('src','/img/loader/circle.svg');
        doallSolvingPendingSale();
      });
    }
  }*/

  drop.addItem('/img/print.png', 'Imprimir Listagem', function(){
    window.open(
      '/pending-print-list?status=' +  ($(el).hasClass('menu-red-top') ? 0 : ($(el).hasClass('menu-orange-top')? 1 : 2)),
      '_blank' // <- This is what makes it open in a new window.
    );
  });

  drop.show();

});

});

}

});


function getPendingSale(number){
  var arr = pendingSales.filter(function(p){
    return p.sale.numeroPedido == number;
  });

  return arr[0];
}



function showPendingItemModal(el){
  el.parent().addClass('modal');
  el.addClass('mini-item-modal dense-shadow');
  el.find('.closable').fadeIn(200);


  changeFontSize(el,2);

  el.parent().unbind('click').click(function(e){
    hidePedingItemModal(e);
    e.stopPropagation();
  });
}

function hidePedingItemModal(){
  var el = $('.mini-item-modal');
  el.parent().removeClass('modal');
  el.removeClass('mini-item-modal dense-shadow');
  el.find('.closable').remove();
  changeFontSize(el, -2);
  $( "#user-id" ).focus();
  el.find('.menu-dots-pending').hide();
}

function buildPendingItemsViews(el, pending){
  var table = el.find('table');
  var row = $('<tr>').addClass('dotted-line closable');

  row.append($('<td>').attr('colspan','2').append($('<span>').addClass('pick-value').append('Produto').css('padding-top','20px')));
  row.append($('<td>').append($('<span>').addClass('pick-value center').append('Quant.')));
  row.append($('<td>').append($('<span>').addClass('pick-value').css('float', 'right').append('Preço')));
  table.append(row);

  pending.sale.items.forEach(function(item){
    if (item.pending || item.changed){
      var row = $('<tr>').addClass('row-padding closable hover-pending-item');

      row.append($('<td>').attr('colspan','2').append(buildProductFirstCol(item, false, pending)));
      row.append($('<td>').append(buildProductSecondCol(item, false)));
      row.append($('<td>').addClass('right-align').append(buildProductThirdCol(item)));

      table.append(row);
    }
  });

  table.find('tr').last().addClass('dotted-line');


  var last = $('<tr>').addClass('closable');

  last.append($('<td>').attr('colspan','2').append(getFirstBottomBarOptions(pending)));
  last.append($('<td>').addClass('middle-option-holder').attr('colspan','1').append(getPendingLocal(pending)));
  last.append($('<td>').attr('colspan','1').append(getBlockedLabel(pending)));
  table.append(last);

  bindMenuOptions(el, pending);
}

function bindMenuOptions(el, pending){
  var dots = el.find('.menu-dots-pending');

  var drop = new MaterialDropdown(dots).setOnAnyOptionsClick(function(e){
    e.stopPropagation();
    $('.mini-item-modal').parent().remove();

  });

  if (location.pathname.includes('picking')){

    //Com status em aberto ou resolvido
    if (Util.isIn([0,2], pending.status)){

      //Permitir assumir pendências
      if (Sett.get(loggedUser, 3)){
        drop.addItem('/img/back.png', 'Assumir', function(){
          assumePendingSale(pending);
        });

        if (pending.status == 0){
          drop.addItem('/img/lamp.png', 'Encontrado', function(){
            assumePendingSale(pending, true);
          });
        }
      }else{
        if (pending.status == 0){
          drop.addItem('/img/restart.png', 'Reiniciar', function(){
            restartPendingSale(pending);
          });
        }
      }
    }

  }else{

    if (pending.status == 0){
      if (!isBlocked(pending)){
        drop.addItem('/img/forward.png', 'Em Atendimento', function(){
          pending.sendEmail = false;
          updatePendingStatus(pending);
        });

        if (Sett.get(loggedUser, 10)){
          drop.addItem('/img/envelop.png', 'Enviar E-mail', function(){
            pending.sendEmail = true;
            updatePendingStatus(pending);
          });
        }
      }
    }else if (pending.status == 1){
      drop.addItem('/img/block.png', 'Bloquear', function(){
        new BlockedSelector().onSelect((reason)=>{
          new BlockedPost(pending.number, reason)
          .setUserId(pending.sale.pickUser.id)
          .onSuccess(()=>{
            //No Page Reload
          })
          .isPending()
          .call();

        }).show();
      });

      drop.addItem('/img/forward.png', 'Resolvido', function(){
        updatePendingStatus(pending);
      });

<<<<<<< HEAD
      drop.addItem('/img/money-coin.png', 'Voucher', function(){
        var pendingPrice = getPendingPrice(pending);

        new InputDialog("Trocar itens por Voucher", "Código do Voucher")
        .addSubTitle("Valor total da pendência: <b>" + pendingPrice + "</b>")
        .onChangeListener((key) => {
          $('.ms-input').on("keyup", function(e) {
            var key = e.which;
            if (key == 13){
              validateVoucher();
            }
          });
        })
        .onPositiveButton("Enviar", () => {
          _post('/pending-send-voucher', {
            pending: pending,
          });
        }).show();
      });
=======
>>>>>>> ae1d7b5a41e6e37d7d8d0689c2204b1dfcd542bd
    }
  }


  if (drop.hasOptions()){
    dots.show();
    dots.unbind('click').click(function (e){
      drop.show();
    });
  }else{
    dots.hide();
  }
}


function getFirstBottomBarOptions(pending){
  var div = $('<div>');

  var span = $('<span>').addClass('pick-value small-font last-update').append('Última alteração: ' + (pending.updateDate ? Dat.formatwTime(new Date(pending.updateDate)): ''));
  div.append(span);

  if (isTrueStr(pending.sendEmail) ){
    div.append(getEmailImage());
  }

  return div;
}


function getEmailImage(){
  var img = $('<img>').addClass('icon').attr('src','/img/envelop.png');
  var span = $('<span>').addClass('right').append(img);
  span.css('margin','10px 3px');
  return span;
}

function getPendingPrice(pending){
  var valor = 0;
  console.log(pending);
  pending.sale.items.forEach(function(item){
    valor += parseFloat(item.valor);
  });
  return Num.money(valor);
}

function validateVoucher(){
  var voucher = $('.ms-input').val();

  if(!voucher.startsWith("PEN")){
    showMsgError("Voucher deve começar com 'PEN'!");
  }
}

function showMsgError(msg){
  var $info = $('<span>').addClass('pick-value error-text').text(msg);
  var $imgError = $('<img>').addClass('icon-error').attr('src','img/error.png').css('width','10px');
  var $errorHolder = $('<div>').add('error-holder');

  $errorHolder.append($imgError, $info);

  $('.material-input-holder').append($errorHolder).delay(4000).queue(function(next){
    $errorHolder.remove();
    next();
  });




}

function addChangedLabel(el){
  el.prepend($('<label>').addClass('changed-label').text('Trocado'));
}

function buildProductFirstCol(item, slim, pending){


  var first = $('<div>').addClass('vertical-content');

  var div = $('<div>').addClass('nobreak');

  var sku;
  var isSwapableSku = !slim && pending.status == 1 && Sett.get(loggedUser, 1);

  if (isSwapableSku){
    sku = $('<input>');
  }else{
    sku = $('<label>');
  }

  sku.addClass('pick-value sku ' + (isSwapableSku ? 'sku-input' : 'copiable' ))
  .val(item.codigo)
  .text(item.codigo)
  .attr('data-sku', item.codigo)
  .attr('placeholder', item.codigo)
  .dblclick(()=>{
    window.open(
      '/product?sku=' + item.codigo,
      '_blank' // <- This is what makes it open in a new window.
    );
  });



  sku.click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    $(this).select();
    e.stopPropagation();
  });


  var gtin = $('<span>').addClass('pick-value right').text(item.gtin.slice(9, item.gtin.length));


  if (item.changed || item.observacao.includes('changed')){
    addChangedLabel(gtin);
  }

  div.append(sku);
  div.append(gtin);
  first.append(div);

  div = $('<div>').addClass('nobreak');
  var descHolder = $('<label>').addClass('pick-value desc no-wrap').text(Util.ellipsis(Util.getProductName(item.descricao, true), 25));
  div.append(descHolder);
  var brand = $('<span>').addClass('pick-value right').text(Util.getProductBrand(item.descricao, true));
  div.append(brand);

  first.append(div);


  if (isSwapableSku){
    sku.on("keyup", function(e) {
      var key = e.which;
      if (key == 13){
        var productDesc = descHolder.text();
        descHolder.text('Carregando...');
        gtin.text('');
        brand.text('');
        handlSwapProductSale(pending.number, item.codigo, $(this).val(), parseInt(item.quantidade), (swapProduct)=>{
          descHolder.text(Util.getProductName(swapProduct.nome, true));
          gtin.text(swapProduct.gtin);
          sku.val(swapProduct.codigo);
          brand.text(Util.getProductBrand(swapProduct.nome, true))
          addChangedLabel(gtin);
        },(error)=>{
          descHolder.text(error.slice(0,40) + '...').attr('title',error).addClass("error").delay(3000).queue(function(next){
            $(this).removeClass("error");
            descHolder.text(productDesc);
            next();
          });
        });
      }
    });
  }else{
    new ImagePreview(first).hover((self)=>{
      _get('/product-image', {sku: item.codigo },(product)=>{
        self.show(product.image);
      });
    });


  }



  return first;
}


function buildProductSecondCol(item, slim){

  var second = $('<div>');
  second.append($('<span>').addClass('pick-value center').text(parseInt(item.quantidade)));

  if (slim){
    var minQuantity = 1;
    var maxQuantity = item.quantidade;

    second.addClass('quantity-click');

    second.click(function(e){
      item.quantidade = (item.quantidade -1) > 0 ? item.quantidade -1 : minQuantity;
      second.find('span').text(item.quantidade);
    });

    second.bind('contextmenu', function(e){
      e.preventDefault();
      item.quantidade = (item.quantidade +1) > maxQuantity ? maxQuantity : item.quantidade +1;
      second.find('span').text(item.quantidade);
      return true;
    });
  }

  return second;
}

function buildProductThirdCol(item){
  return $('<span>').addClass('pick-value no-wrap').text(Num.money(item.valor));
}

var pendingCount;

function buildProductFourthCol(item){
  var fourth = $('<div>');
  var img = $('<div>').addClass('checked pick-icon');

  pendingCount = 0;
  img.click(function(){
    item.pending = $(this).hasClass('checked');

    $(this).toggleClass('pending');
    $(this).toggleClass('checked');

    pendingCount += item.pending ? 1 : -1;

    if (pendingCount > 0){
      $('.pending-button-holder').fadeIn();
    }else{
      $('.pending-button-holder').fadeOut();
    }
  });

  fourth.append(img);
  return fourth;
}

function loadPendingSaleItems(el, pending){
  if (!el.hasClass('mini-item-modal')){
    var table = el.find('table');
    if (table.find('.closable').length == 0){
      buildPendingItemsViews(el, pending);
    }

    showPendingItemModal(el);
  }
}





function updatePendingStatus(pending){
  execute("/pending-status", pending, ()=>{
    window.location.reload();
  });
}

function restartPendingSale(pending){
  execute("/pending-restart", pending, ()=>{
    window.location.reload();
  });
}

function assumePendingSale(pending, removePoints){
  pending.removePoints = removePoints;
  execute("/pending-assume", pending, ()=>{
    window.location.reload();
  });
}

function execute(path, pending, onSucess){
  _post(path,  {
    pendingSale: pending
  }, ()=>{
    if (onSucess){
      onSucess();
    }
  }, (error)=>{
    $('.error').text(error.responseText).fadeIn().delay(1000).fadeOut();
  });
}


function changeFontSize(els, direction){
  els.find('span,label').each(function(i, e){
    $(e).css("font-size", parseInt($(e).css("font-size"))+direction);
  });

  els.find('.avatar-img').each(function(i, e){
    $(e).css("width", parseInt($(e).css("width"))+(direction * 4));
    $(e).css("height", parseInt($(e).css("height"))+(direction * 4));
  });

  els.css("padding-left",  parseInt(els.css("padding-left"))+(direction * 4));
  els.css("padding-right",  parseInt(els.css("padding-right"))+(direction * 4));
  els.css("padding-top",  parseInt(els.css("padding-top"))+(direction * 2));
}


function isBlocked(pending){
  return (pending.status == 0) && Params.autoBlockPending() && (Dat.hoursDif(pending.updateDate, new Date()) <= Params.timeBlockPending());
}


function getPendingLocal(pending){
  if (pending.local){
    return $('<label>').addClass('local-label').text(pending.local);
  }else{
    return "";
  }
}

function getBlockedLabel(pending){
  if (isBlocked(pending)){
    return $('<label>').addClass('local-label red').text('Bloqueado');
  }else{
    return "";
  }
}




function handlSwapProductSale(saleNumber, targerSku, swapSku, quantity, onSucess, onError ){
  _get('/product-child', {sku: swapSku },(product)=>{
    if (product.error){
      onError(product.error);
    }else{
      _post('/pending-swap-items',
      { saleNumber: saleNumber,
        targetSku: targerSku,
        swapSku: swapSku,
        quantity: parseInt(quantity),
      },(sucess)=>{
        if (sucess && onSucess){
          onSucess(product);
        }
      },(e)=>{
        if (onError){
          onError(e.responseText);
        }
      });
    }
  });
}
