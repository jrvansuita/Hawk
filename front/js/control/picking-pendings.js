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


  if (isWideOpen() && ($('.pending-item.not-solved').length > 0)){


    $('.menu-dots').each((index, el)=>{
      $(el).click(function(e){
        var drop = new MaterialDropdown($(this), e);

        if ($(el).hasClass('menu-red-top')){
          if (Sett.get(loggedUser, 10)){
            drop.addItem('/img/send-mass-email.png', 'Enviar Todos E-mails', function(){
              icon.attr('src','/img/loader/circle.svg');
              doallSolvingPendingSale();
            });
          }
        }

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
  last.append($('<td>').addClass('middle-option-holder').attr('colspan','1').append(getMiddleBottomBarOptions(pending)));
  last.append($('<td>').attr('colspan','1').append(getLastBottomBarOption(pending)));
  table.append(last);
}



function getFirstBottomBarOptions(pending){
  var div = $('<div>');

  var span = $('<span>').addClass('pick-value small-font last-update').append('Última alteração: ' + (pending.updateDate ? Dat.formatwTime(new Date(pending.updateDate)): ''));
  div.append(span);

  if (isTrueStr(pending.sendEmail) ){
    div.append(getEmailImage());
  }

  if (pending.status == 0){
    if (typeof wideOpen == "undefined"){
      var lamp = $('<img>').addClass('small-icon-button').attr('src', '/img/lamp.png').attr('title','Encontrei!').click(function(){
        restartPendingSale(pending);
      });
      div.append(lamp);
    }
  }

  return div;
}

function getMiddleBottomBarOptions(pending){
  var els = [];

  els.push(getPendingLocal(pending));


  if (pending.status==0 && isWideOpen()){
    if (Sett.get(loggedUser, 10)){
      els.push(getEmailSwitch());
    }

    return els;
  }else{
    return els;
  }
}

function getLastBottomBarOption(pending){
  var div = $('<div>');

  if ((pending.status < 2 && isWideOpen()) || (pending.status == 2 && !isWideOpen()) ){
    var solve = $('<label>').addClass('button shadow solve-pending').append(getPendingItemButtonLabel(pending)).click(function(){
      onPendingItemButtonClicked($(this), pending);
    });

    if(isBlocked(pending)){
      solve.addClass('blocked');
    }

    if (pending.status == 1){
      var block = $('<img>').addClass('block-pending').attr('src','/img/block.png').attr('title','Bloquear').click((e) =>{
        hidePedingItemModal();
        e.stopPropagation();

        new BlockedSelector().onSelect((reason)=>{
          new BlockedPost(pending.number, reason).call();
        }).show();
      });

      div.prepend(block);
    }

    div.prepend(solve);
  }

  return div;
}

function getEmailSwitch(){
  var input = $('<input>').attr('type', 'checkbox').addClass('switch-input').attr('id','send-email-switch').attr('checked','checked');
  var title = $('<span>').addClass('pick-value').append('Email');
  var label = $('<label>').attr('type', 'checkbox').addClass('switch-label').attr('for','send-email-switch').append(title, $('<span>').addClass('toggle--on'), $('<span>').addClass('toggle--off'));

  var holder = $('<div>').append(input, label);

  holder.click(function(e){
    $('#send-email-switch').prop("checked", !$('#send-email-switch').prop('checked'));
    e.stopPropagation();
  });

  return holder;
}

function isWideOpen(){
  return typeof wideOpen !== "undefined";
}

function getEmailImage(){
  var img = $('<img>').addClass('icon').attr('src','/img/envelop.png');
  var span = $('<span>').addClass('right').append(img);
  span.css('margin','10px 3px');
  return span;
}

function onPendingItemButtonClicked(button, pending){
  if (pending.status == 2){
    restartPendingSale(pending);
  }else if (isBlocked(pending)){

  }else if (pending.status == 1){
    solvedPendingSale(button,pending);
  }else{
    solvingPendingSale(button, pending);
  }
}

function getPendingItemButtonLabel(pending){
  if (pending.status == 2){
    return "Assumir";
  }else if (isBlocked(pending)){
    return "Bloqueado";
  }else if (pending.status == 1){
    return "Resolver";
  }else{
    return 'Atender';
  }
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


  var gtinStr = slim ? item.gtin.slice(9, item.gtin.length) : item.gtin;

  var gtin = $('<span>').addClass('pick-value right').text(gtinStr);


  if (item.changed || item.observacao.includes('changed')){
    addChangedLabel(gtin);
  }

  div.append(sku);
  div.append(gtin);
  first.append(div);

  div = $('<div>').addClass('nobreak');
  var descHolder = $('<label>').addClass('pick-value desc no-wrap').text(Util.ellipsis(Util.getProductName(item.descricao, true), 50));
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

function solvingPendingSale(button, pending){
  showLoadingButton(button);
  innerSolvingPendingSale(pending, $('#send-email-switch').prop('checked'), (resultPending)=>{
    rebuildSpawItem('not-solved', 'solving', resultPending);
  });
}


function doallSolvingPendingSale(icon){
  $('.pending-item.not-solved').each(function(index, item){
    var pending =  getPendingSale($(item).data('sale').split('-')[1]);

    if(!isBlocked(pending)){
      innerSolvingPendingSale(pending, true, (res)=>{

        $(item).fadeOut(400, function() {
          $(item).remove();
          if ($('.pending-item.not-solved').length == 0){
            window.location.reload();
          }
        });

      });
    }
  });
}


function innerSolvingPendingSale(pending, sendEmail, callback){
  pending.sendEmail = sendEmail ? true: false;
  execute("/pending-status", pending, function(r){
    callback(r);
  });
}

function solvedPendingSale(button, pending){
  showLoadingButton(button);
  execute("/pending-status", pending,  function(resultPending){
    rebuildSpawItem('solving','solved', resultPending);
  });
}

function restartPendingSale(pending){
  execute("/picking-pending-restart", pending);
}

function rebuildSpawItem(actualClass, nextClass , resultPending){
  updatePendingSales(resultPending);
  var $this = $('.'+actualClass+'.mini-item-modal');

  $this.removeClass(actualClass).addClass(nextClass);

  $this.delay(1000).fadeOut(400, function() {
    $this.remove();

    setTimeout(function() {
      window.location.reload();
    }, 300);
  });

  hidePedingItemModal();


}

function execute(path, pending, onSucess){
  _post(path,  {
    pendingSale: pending
  }, onSucess, (error)=>{
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

function showLoadingButton(el){
  el.prepend($('<img>').addClass('loading-circle').attr('src','/img/loader/circle.svg'));
}

function updatePendingSales(pending){
  pendingSales = pendingSales.map(function(i) { return i.sale.numeroPedido == pending.sale.numeroPedido ? pending : i; });
}

function isBlocked(pending){
  return false; //pending.status == 0 && Dat.hoursDif(pending.updateDate, new Date()) <= 1;
}


function getPendingLocal(pending){
  if (pending.local){
    return $('<label>').addClass('local-label').text(pending.local);
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
