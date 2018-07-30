$(document).ready(() => {

  $(".checkable-avatar").change(function() {
    var $img = $(this).parent().find('img');
    if(this.checked) {
      $img.attr('src', '../img/checked.png').hide().fadeIn(300);
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
  var row = $('<tr>').addClass('row-padding dotted-line closable');

  row.append($('<td>').attr('colspan','2').append($('<span>').addClass('pick-value').append('Produto')));
  row.append($('<td>').append($('<span>').addClass('pick-value center').append('Quant.')));
  row.append($('<td>').append($('<span>').addClass('pick-value').css('float', 'right').append('Preço')));
  table.append(row);

  pending.sale.items.forEach(function(item){
    if (item.pending){
      var row = $('<tr>').addClass('row-padding closable hover-pending-item');

      row.append($('<td>').attr('colspan','2').append(buildProductFirstCol(item, false)));
      row.append($('<td>').append(buildProductSecondCol(item, false)));
      row.append($('<td>').addClass('right-align').append(buildProductThirdCol(item)));

      table.append(row);
    }
  });

  table.find('tr').last().addClass('dotted-line');

  var last = $('<tr>').addClass('closable');

  last.append($('<td>').attr('colspan','2').append(getFirstBottomBarOptions(pending)));
  last.append($('<td>').attr('colspan','1').append(getMiddleBottomBarOptions(pending)));
  last.append($('<td>').attr('colspan','1').append(getLastBottomBarOption(pending)));
  table.append(last);
}



function getFirstBottomBarOptions(pending){
  var div = $('<div>');

  var span = $('<span>').addClass('pick-value small-font last-update').append('Última alteração: ' + (pending.updateDate ? Dat.format(new Date(pending.updateDate)): ''));
  div.append(span);

  if (!isTrueStr(pending.solved) && !isTrueStr(pending.solving)){
    if (typeof wideOpen == "undefined"){
      var lamp = $('<img>').addClass('lamp').attr('src', '/img/lamp.png').attr('title','Encontrei!').click(function(){
        restartPendingSale(pending);
      });
      div.append(lamp);
    }
  }

  return div;
}

function getMiddleBottomBarOptions(pending){
  if (!pending.solving && !pending.solved){
    if (showOption(pending)){
      return getEmailSwitch();
    }

    return "";
  }else if (isTrueStr(pending.sendEmail) ){
    return getEmailImage();
  }else{
    return "";
  }
}

function getLastBottomBarOption(pending){
  var solve = $('<label>').addClass('button shadow solve-pending').append(getPendingItemButtonLabel(pending)).click(function(){
    onPendingItemButtonClicked($(this), pending);
  });

  solve.css('visibility', 'hidden');

  console.log(pending);

  if(isBlocked(pending)){
    solve.addClass('blocked');
  }

  if (showOption(pending)){
    solve.css('visibility', 'visible');
  }

  return solve;
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

function showOption(pending){
  var isWideOpen = typeof wideOpen !== "undefined";
  var showOption = (isWideOpen && !isTrueStr(pending.solved)) || (!isWideOpen && isTrueStr(pending.solved));
  return showOption;
}

function getEmailImage(){
  var img = $('<img>').addClass('icon').attr('src','/img/envelop.png');
  var span = $('<span>').addClass('right').append(img);
  return span;
}

function onPendingItemButtonClicked(button, pending){
  if (isBlocked(pending)){

  }else if (isTrueStr(pending.solved)){
    restartPendingSale(pending);
  }else if (isTrueStr(pending.solving)){
    solvedPendingSale(button,pending);
  }else{
    solvingPendingSale(button, pending);
  }
}

function getPendingItemButtonLabel(pending){
  if (isBlocked(pending)){
    return "Bloqueado";
  }else if (isTrueStr(pending.solved)){
    return "Reiniciar";
  }else if (isTrueStr(pending.solving)){
    return "Resolver";
  }else{
    return 'Atender';
  }
}


function buildProductFirstCol(item, slim){
  var desc = item.descricao.split('-')[0];
  var b = item.descricao.split('-');
  var brand = b.length >=2 ? b[1].trim() : "";

  if (brand.length > 10){
    brand = brand.split(' ')[0];
  }

  desc = desc.trim().split(' ');

  if (desc.length >= 3){
    if (slim){
      desc = desc[0] +  ' ' + desc[desc.length-1];
    }else{
      desc.splice(5,desc.length -5);
      desc = desc.join(' ');
    }
  }

  var first = $('<div>').addClass('vertical-content');

  var div = $('<div>').addClass('nobreak');
  var sku = $('<label>').addClass('pick-value sku copiable').text(item.codigo);

  sku.click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    e.stopPropagation();
  });

  div.append(sku);
  div.append($('<span>').addClass('pick-value right').text(slim ? item.gtin.slice(9, item.gtin.length) : item.gtin));
  first.append(div);


  div = $('<div>').addClass('nobreak');
  var descHolder = $('<label>').addClass('pick-value desc no-wrap').text(desc);
  div.append(descHolder);
  div.append($('<span>').addClass('pick-value right').text(brand));

  first.append(div);

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

    togglePending(item);

    $(this).toggleClass('pending');
    $(this).toggleClass('checked');

    pendingCount += item.pending ? 1 : -1;

    if (pendingCount){
      $('.pending-button').fadeIn();
    }else{
      $('.pending-button').fadeOut();
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



function togglePending(item){
  item.pending = !item.pending;
}


function solvePendingSale(sale){
  $.ajax({
    url: "/picking-pending-solve",
    type: "post",
    data: {
      pendingSale: sale
    },
    success: function(response) {
      window.location.reload();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      $('.error').text(jqXHR.responseText).fadeIn().delay(1000).fadeOut();
    }
  });
}

function solvingPendingSale(button, pending){
  showLoadingButton(button);
  pending.sendEmail = $('#send-email-switch').prop('checked');
  executePendingAjax("/picking-pending-solving", pending, function(resultPending){
    rebuildSpawItem('not-solved', 'solving', resultPending);
  });
}

function solvedPendingSale(button, pending){
  showLoadingButton(button);
  executePendingAjax("/picking-pending-solved", pending,  function(resultPending){
    rebuildSpawItem('solving','solved', resultPending);
  });
}

function restartPendingSale(pending){
  executePendingAjax("/picking-pending-restart", pending);
}

function rebuildSpawItem(actualClass, nextClass , resultPending){
  updatePendingSales(resultPending);
  $('.'+actualClass+'.mini-item-modal').removeClass(actualClass).addClass(nextClass);
  hidePedingItemModal();
}

function executePendingAjax(path, pending, onSucess){
  $.ajax({
    url: path,
    type: "post",
    data: {
      pendingSale: pending
    },
    success: function(response) {
      if (onSucess){
        onSucess(response);
      }else{
        window.location.reload();
      }
    },
    error: function (request, status, error) {
      console.log(request.responseText);
      $('.error').text(request.responseText).fadeIn().delay(1000).fadeOut();
    }
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
  return Dat.hoursDif(pending.updateDate, new Date()) <= 1;
}
