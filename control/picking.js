$(document).ready(() => {

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