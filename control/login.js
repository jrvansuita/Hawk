$(document).ready(() => {

  $('.login-form').hide().fadeIn();

  $('#user-id').on('input', () => {
    var code = $('#user-id').val();


    if (code.length >= 9 && isNum(code)) {

      $.ajax({
        url: "login",
        type: "post",
        data: {
          userid: code
        },
        success: function(response) {
          location.href = "/";
        },
        error: function(jqXHR, textStatus, errorThrown) {


          $('.img-holder').addClass("red").delay(600).queue(function(next) {
            $(this).removeClass("red");
            next();
          });

          $('#user-id').val('');
          $('.login-form').shake({
            interval: 80,
            distance: 8,
            times: 4
          });

        }

      });

    }

  });



});

function isNum(v) {
  return /^\d+$/.test(v);
}