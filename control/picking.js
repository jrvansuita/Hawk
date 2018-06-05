$(document).ready(() => {
  $( "#user-id" ).focus();


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

    $('.opened-sale-box').fadeIn(200);
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


function loadSale(sale){
  $('.sale-number').text(sale.numeroPedido);
  $('#sale-transport').text(sale.transport);
  $('#sale-date').text(Dat.format(new Date(sale.data)));
  $('#sale-itens').text(sale.itemsQuantity + ' Itens');
  $('#sale-value').text(Num.money(sale.totalProdutos));



  sale.items.forEach(item => {
    var row = $('<tr>').addClass('row-padding');

    var desc = item.descricao.split('-')[0];
    var brand = item.descricao.split('-')[1].trim().split(' ')[0];

    desc = desc.trim().split(' ');

    if (desc.length >= 3){
      desc = desc[0] +  ' ' + desc[desc.length-1] + ' ' + brand;
    }

    var first = $('<div>').addClass('vertical-content');

    var div = $('<div>').addClass('nobreak');
    div.append($('<label>').addClass('pick-value sku').text(item.codigo));
    div.append($('<span>').addClass('pick-value right').text(item.gtin.slice(9,item.gtin.length)));
    first.append(div);
    first.append($('<label>').addClass('pick-value desc no-wrap').text(desc));

    var second = $('<div>');
    second.append($('<span>').addClass('pick-value center').text(parseInt(item.quantidade)));

    var third = $('<div>');
    third.append($('<span>').addClass('pick-value no-wrap').text(Num.money(item.valor)));

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

    row.append($('<td>').append(first));
    row.append($('<td>').append(second));
    row.append($('<td>').append(third));
    row.append($('<td>').append(fourth));

    $('#opened-sale').append(row);
    row.hide().fadeIn();
  });
}

var pendingCount;

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
