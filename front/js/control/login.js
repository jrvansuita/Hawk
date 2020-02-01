$(document).ready(() => {

  $('.login-form').hide().fadeIn();


  $('#user-pass').on("keyup", function(e) {
    if (e.which == 13){
      if (isEverythingRight(false))
      login();
    }
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

  $('#user-access').val('');
  $('#user-pass').val('');
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
      access: $('#user-access').val(),
      pass: $('#user-pass').val()
    },
    success: function(response) {
      onSucess();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('.error').text(jqXHR.responseText).css('display','block').fadeIn().delay(2000).fadeOut();
      onError();
    }
  });
}


function isEverythingRight(doError){
  var ok = ($('#user-access').val().length >= 9 && isNum($('#user-access').val()));

  ok = ok && $('#user-pass').val().length > 5;

  if (!ok && doError){
    onError();
  }

  return ok;
}
