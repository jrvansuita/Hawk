$(document).ready(() => {

  $('.login-form').hide().fadeIn();


  $('#guest').click(() => {
    login(100);
  });

  $('#user-id').on('input', () => {
    var code = $('#user-id').val();

    if (code.length >= 9 && isNum(code))
      login(code);
  });
});

function isNum(v) {
  return /^\d+$/.test(v);
}

function onError() {
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

function onSucess() {
  location.href = "/";
}

function login(code) {
  $.ajax({
    url: "/login",
    type: "post",
    data: {
      userid: code
    },
    success: function(response) {
      onSucess();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      onError();
    }

  });
}