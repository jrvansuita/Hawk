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

      if (diftime > 0){
        $(item).text((diftime/1000).toString().toMMSS());
      }

      $(item).attr('diftime', diftime);
    });
  }, 1000);

  $('#blocked-sale-input').on("keyup", function(e) {
    var key = e.which;
    if (key == 13){
      var saleNumber = $('#blocked-sale-input').val();

      if (saleNumber.length >= 5 && isNum(saleNumber)) {
        if ($('.blocked-sales-holder').find("[data-sale='" + saleNumber + "']").length > 0){
          new BlockedPost(saleNumber).call();
        }else{
          new BlockedSelector().onSelect((reason)=>{
            new BlockedPost(saleNumber, reason).call();
          }).show();
        }
      }
    }
  });


  $('#user-id').on("keyup", function(e) {
    var key = e.which;
    if (key == 13){
      var code = $('#user-id').val();

      if (code.length >= 9 && isNum(code)) {

        var onSucess = function(response){
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
        };

        var onError = function(error){
          var l = error.responseText.length * 20;
          var showDelay = 1000 + l;

          $('.error').text(error.responseText).clearQueue().fadeIn().delay(showDelay).fadeOut();
        };

        _get("/picking-sale",{
          userid: code
        },
        onSucess,
        onError);
      }
    }
  });

  $('.inprogress-item').click(function(){
    var saleNumber = $(this).data('sale').split('-')[1];
    var sale = getInProgressSale(saleNumber);
    loadSale(sale);
  });


  $('.pending-button').click(function(){
    if (checkIsLocalFilled(true)){

      _post("/start-pending", {
        pendingSale: selectedPendingSale,
        local: $('#pending-local').val()
      },
      null,
      (error)=>{
        $('.error').text(error.responseText).fadeIn().delay(1000).fadeOut();
      });

    }
  });

  $('.table-sale-blocked-holder').click(function(e){
    var saleNumber = $(this).data('sale');

    var drop = new MaterialDropdown($(this), e);
    drop.addItem('/img/delete.png', 'Desbloquear', function(){
      new BlockedPost(saleNumber).call();
    });

    drop.show();
  });

  $('.done-sale-item').click(function(e){
    var saleId = $(this).data('saleid').split('-')[1];
    var sale = $(this).data('sale').split('-')[1];

    var drop = new MaterialDropdown($(this), e);
    drop.addItem('/img/print.png', 'Imprimir', null, printPickingUrl + saleId, '_blank');
    drop.addItem('/img/back.png', 'Reseparar', function(){
      doneSaleRestart(sale);
    });

    drop.onMouseLeave(()=>{
      $( "#user-id" ).focus();
    });

    drop.show();
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
  _post("/picking-done-restart", {
    sale: saleNumber
  },null, (error)=>{
    $('.error').text(error.responseText).fadeIn().delay(1000).fadeOut();
  });
}


var selectedPendingSale;

function loadSale(sale){
  if ((selectedPendingSale != sale) || !$('.opened-sale-box').is(':visible')){
    $('.opened-sale-box').css('display','inline-block').fadeIn(200);

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


function checkIsLocalFilled(shake){
  var isFilled = $('#pending-local').val().length > 0;

  if (shake && !isFilled){
    $('#pending-local').shake({
      interval: 80,
      distance: 8,
      times: 4
    });

    onSimpleMaterialInputError($('#pending-local'));
  }

  return isFilled;
}
