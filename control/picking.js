$(document).ready(() => {

  $('#user-id').on('input', () => {
    var code = $('#user-id').val();

    if (code.length >= 9 && isNum(code)) {
      console.log('chamou');
      $.ajax({
        url: "/picking-sale",
        type: "get",
        data: {
          userid: code
        },
        success: function(response) {
          window.open(response, "minhaJanela", );
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(errorThrown);
        }
      });
    }
  });
});

function isNum(v) {
  return /^\d+$/.test(v);
}