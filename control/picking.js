$(document).ready(() => {
  $( "#user-id" ).focus();

  $(".print-progress").click(function(e) {
    //do something
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

      item.quantidade = parseInt(item.quantidade);

      row.append($('<td>').append(buildProductFirstCol(item, true)));
      row.append($('<td>').append(buildProductSecondCol(item, true)));
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
