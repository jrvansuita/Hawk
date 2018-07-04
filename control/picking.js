$(document).ready(() => {
  $( "#user-id" ).focus();

  $(".print-progress").click(function(e) {
    //do something
    e.stopPropagation();
  });

  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    e.stopPropagation();
  });

  window.setInterval(function() {
    $(".inprogress-begin").each(function(index, item) {
      var diftime = parseInt($(item).attr("diftime"));
      diftime+= 1000;

      $(item).text((diftime/1000).toString().toMMSS());
      $(item).attr('diftime', diftime);
    });
  }, 1000);


  $('#user-id').on("keyup", function(e) {
    var key = e.which;
    if (key == 13){
      var code = $('#user-id').val();

      if (code.length >= 9 && isNum(code)) {
        $.ajax({
          url: "/picking-sale",
          type: "get",
          data: {
            userid: code
          },
          success: function(response) {
            if (response.includes("end-picking")) {
              $('.sucess').text("Picking encerrado com sucesso.").fadeIn().delay(1000).fadeOut();
              var sale = response.split("-");
              sale = sale[sale.length - 1];
              $('div[data-sale="progress-' + sale + '"]').css('background-color', '#13bb7070').delay(1000).fadeOut();
              $(".inprogress-count").text(parseInt($(".inprogress-count").text()) - 1);
              //Inicia um novo picking
              //$('#user-id').trigger(jQuery.Event( 'keyup', { which: 13 } ));
              $('#user-id').val('');
            } else {
              $('.sucess').text("Aguardando impressão do pedido").fadeIn();
              setTimeout(function() {
                window.open(response, "picking");
                window.location.reload();
              }, 1000);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            $('.error').text(jqXHR.responseText).fadeIn().delay(1000).fadeOut();
          }
        });
      }
    }
  });


  $('.inner-label').click(()=>{
    $('.drop-ttl').click();
  });




  $('.inprogress-item').click(function(){
    var saleNumber = $(this).data('sale').split('-')[1];
    var sale = getInProgressSale(saleNumber);
    loadSale(sale);
  });

  $('.pending-item').click(function(e){
    var index = $(this).data('index').split('-')[1];
    loadPendingSaleItems($(this), pendingSales[index]);
    e.stopPropagation();
  });


  $('.pending-button').click(function(){
    $.ajax({
      url: "/picking-pending",
      type: "post",
      data: {
        pendingSale: selectedPendingSale
      },
      success: function(response) {
        window.location.reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        $('.error').text(jqXHR.responseText).fadeIn().delay(1000).fadeOut();
      }
    });
  });

  $('.done-sale-item').click(function(e){
    var saleId = $(this).data('saleid').split('-')[1];
    var sale = $(this).data('sale').split('-')[1];
    $('.md-dropdown').remove();

    $div = $('<div>').addClass('md-dropdown');
    $ul = $('<ul>').css('left', e.pageX).css('top', e.pageY -10);

    $printIcon = $('<img>').attr('src','/img/print.png');
    $pendingIcon = $('<img>').attr('src','/img/back.png');

    $aPrint = $('<li>').append($('<a>').attr('href',printPickingUrl + saleId).attr('target','_blank').append($printIcon,'Imprimir'));
    $aRestart = $('<a>').attr('href','#').append($pendingIcon,'Reseparar');

    $aRestart.click(function(){
      doneSaleRestart(sale);
    });

    $ul.append($('<li>').append($aPrint));
    $ul.append($('<li>').append($aRestart));

    $div.append($ul);
    $(this).append($div);
    $ul.hide().fadeIn(400);

    $div.mouseleave(function(){
      $div.remove();
      $( "#user-id" ).focus();
    });

    $('.md-dropdown a').click(function(e){
      e.stopPropagation();
    });
  });
});

function getInProgressSale(number){
  for (var key in inprogress) {
    if (inprogress.hasOwnProperty(key)) {
      if (inprogress[key].numeroPedido === number){
        return inprogress[key];
      }
    }
  }
}

function doneSaleRestart(saleNumber){

  $.ajax({
    url: "/picking-done-restart",
    type: "post",
    data: {
      sale: saleNumber
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


var selectedPendingSale;

function loadSale(sale){
  if ((selectedPendingSale != sale) || !$('.opened-sale-box').is(':visible')){
    $('.opened-sale-box').css('display','-webkit-inline-box').fadeIn(200);

    selectedPendingSale = sale;
    $('.sale-number').text(sale.numeroPedido);
    $('#sale-transport').text(sale.transport);
    $('#sale-date').text(Dat.format(new Date(sale.data)));
    $('#sale-itens').text(sale.itemsQuantity + ' Itens');
    $('#sale-value').text(Num.money(sale.totalProdutos));

    $('#opened-sale').find('.row-padding').remove();
    sale.items.forEach(item => {
      var row = $('<tr>').addClass('row-padding');

      row.append($('<td>').append(buildProductFirstCol(item, true)));
      row.append($('<td>').append(buildProductSecondCol(item)));
      row.append($('<td>').append(buildProductThirdCol(item)));
      row.append($('<td>').append(buildProductFourthCol(item)));

      $('#opened-sale').append(row);
      row.hide().fadeIn();
    });
  }else{
    $('.opened-sale-box').fadeOut(200);
  }
}


function isNum(v) {
  return /^\d+$/.test(v);
}

String.prototype.toMMSS = function() {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ':' + seconds;
};


function togglePending(item){
  item.pending = !item.pending;
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
      row.append($('<td>').append(buildProductSecondCol(item)));
      row.append($('<td>').addClass('right-align').append(buildProductThirdCol(item)));

      table.append(row);
    }
  });

  table.find('tr').last().addClass('dotted-line');

  var last = $('<tr>').addClass('closable');

  var solve = $('<label>').addClass('button shadow solve-pending').append(getPendingItemButtonLabel(pending)).click(function(){
    onPendingItemButtonClicked($(this), pending);
  });

  last.append($('<td>').attr('colspan','2').append($('<span>').addClass('pick-value small-font').append('Última alteração: ' + (pending.updateDate ? Dat.format(new Date(pending.updateDate)): ''))));
  last.append($('<td>').attr('colspan','1').append(!pending.solving && !pending.solved? getEmailSwitch(): ((pending.sendEmail == true || pending.sendEmail == "true") ? getEmailImage(): '')));
  last.append($('<td>').attr('colspan','1').append(solve));
  table.append(last);
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

function getEmailImage(){
  var img = $('<img>').addClass('icon').attr('src','/img/envelop.png');
  var span = $('<span>').addClass('right').append(img);
  return span;
}

function onPendingItemButtonClicked(button, pending){
  if (pending.solved == true || pending.solved == "true"){
    restartPendingSale(pending);
  }else if (pending.solving == true || pending.solving == "true"){
    solvedPendingSale(button,pending);
  }else{
    solvingPendingSale(button, pending);
  }
}

function getPendingItemButtonLabel(pending){
  return (pending.solved == true || pending.solved == "true") ? 'Reiniciar' : (pending.solving ? 'Resolver' : 'Atender');
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


function buildProductSecondCol(item){
  var second = $('<div>');
  second.append($('<span>').addClass('pick-value center').text(parseInt(item.quantidade)));
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
