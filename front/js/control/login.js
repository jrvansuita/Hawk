$(document).ready(() => {
  $('.login-form').hide().fadeIn();

  $('#user-pass').on('keyup', function (e) {
    if (e.which == 13) {
      if (isEverythingRight(false)) {
        login();
      }
    }
  });

  $('.signin').click(() => {
    if (isEverythingRight(false)) {
      login();
    }
  });

  $('.forget').click(() => {
    forgetPass();
  });
});

function forgetPass() {
  $('.sub-title').hide();
  $('.login-form').css('animation', '0.3s ease-in-out .3s 1 normal both running login-form');
  $('.material-input-holder').empty();

  var putE = $('<input>').val('').addClass('email-pass');
  var panS = $('<span>').addClass('bar');
  var abeL = $('<label>').text('insira seu e-mail').attr('type', 'text');

  $('.material-one').append(putE, panS, abeL).hide().fadeIn(800);

  $('.forget').hide();

  var send = $('<span>').text('Receber Senha').addClass('forgot-pass').css('cursor', 'pointer');

  send.click(() => {
    resetPass();
  });
  $('.login-els').append(send).hide().fadeIn(3000);
}

function isNum(v) {
  return /^\d+$/.test(v);
}

function onError() {
  $('.img-holder')
    .addClass('red')
    .delay(600)
    .queue(function (next) {
      $(this).removeClass('red');
      next();
    });

  $('#user-access').val('');
  $('#user-pass').val('');
  $('.login-form').shake({
    interval: 80,
    distance: 8,
    times: 4,
  });
}

function onSucess() {
  location.href = '/';
}

function login(code) {
  $.ajax({
    url: '/login',
    type: 'post',
    data: {
      access: $('#user-access').val(),
      pass: $('#user-pass').val(),
    },
    success: function (response) {
      onSucess();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('.error').text(jqXHR.responseText).css('display', 'block').fadeIn().delay(2000).fadeOut();
      onError();
    },
  });
}

function resetPass() {
  $.ajax({
    url: '/login/reset-password',
    type: 'post',
    data: {
      email: $('.email-pass').val(),
    },
    success: function (response) {
      onSucess();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('.error').text(jqXHR.responseText).css('display', 'block').fadeIn().delay(2000).fadeOut();
      onError();
    },
  });
}

function isEverythingRight(doError) {
  var ok = $('#user-access').val().length >= 9 && isNum($('#user-access').val());

  ok = ok && $('#user-pass').val().length > 5;

  if (!ok && doError) {
    onError();
  }

  return ok;
}
