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
});

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
