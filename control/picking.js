$(document).ready(() => {

  window.setInterval(function() {
    $(".inprogress-begin").each(function(index, item) {
      var begin = parseInt($(item).data("begin"));
      var dif = (new Date().getTime() - begin) / 1000;
      $(item).text(dif.toString().toMMSS());
    });
  }, 1000);


  $('#user-id').on('input', () => {
    var code = $('#user-id').val();

    if (code.length >= 9 && isNum(code)) {
      $.ajax({
        url: "/picking-sale",
        type: "get",
        data: {
          userid: code
        },
        success: function(url) {
          window.open(url, "picking");
          window.location.reload();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          $('.error').text(jqXHR.responseText).fadeIn().delay(3000).fadeOut();
        }
      });
    }
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