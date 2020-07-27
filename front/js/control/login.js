$(document).ready(() => {
  $('.login-form').hide().fadeIn()

  $('#user-pass').on('keyup', function (e) {
    if (e.which == 13) {
      if (isEverythingRight(false)) { login() }
    }
  })

  $('.forget').click(() => {
    $('.sub-title').hide()
    $('.sign-up').hide()
    $('.login-form').css('animation', '0.1s ease-in-out .1s 1 normal both running login-form')
    $('.material-input-holder').empty()
    forgetPass()
  })

  $('.sign-up').click(() => {
    successRegister()
  })
})

function forgetPass () {
  var putE = $('<input>')
  var panS = $('<span>').addClass('bar')
  var abeL = $('<label>').text('insira seu e-mail').attr('type', 'text')

  $('.material-one').append(putE, panS, abeL).hide().fadeIn(700)

  $('.forget').hide()

  var send = $('<span>').text('Receber Senha').addClass('forgot-pass').css('cursor', 'pointer')

  $('.login-els').append(send).hide().fadeIn(2000)
}

function acessRegister(holder, label, type) {
  var $put = $('<input>').attr('type', type)
  var $pan = $('<span>').addClass('bar')
  var $label = $('<label>').text(label)

  holder.append($put, $pan, $label).hide().fadeIn(3000)
}

function successRegister() {
  $('.sub-title').hide()
  $('.forget').hide()
  $('.login-form').css('animation', '0.1s ease-in-out .1s 1 normal both running login-form')
  $('.material-input-holder').empty()
  acessRegister($('.material-one'), 'E-mail', 'text')
  acessRegister($('.material-two'), 'Senha', 'password')
  acessRegister($('.material-three'), 'Confirmar Senha', 'password')

  $('.sign-up').hide()

  var acess = $('<span>').text('Cadastrar').addClass('register').css('cursor', 'pointer')
  $('.login-els').append(acess)

  acess.click(() => {
    $('.material-input-holder').empty()
    var sucessReg = $('<span>').text('Seu cadastro foi efetuado com sucesso e está em análise, em breve seu acesso será liberado.').addClass('sucess-end')
    $('.material-one').append(sucessReg)
    acess.hide()
  })
}

function isNum (v) {
  return /^\d+$/.test(v)
}

function onError () {
  $('.img-holder').addClass('red').delay(600).queue(function (next) {
    $(this).removeClass('red')
    next()
  })

  $('#user-access').val('')
  $('#user-pass').val('')
  $('.login-form').shake({
    interval: 80,
    distance: 8,
    times: 4
  })
}

function onSucess () {
  location.href = '/'
}

function login (code) {
  $.ajax({
    url: '/login',
    type: 'post',
    data: {
      access: $('#user-access').val(),
      pass: $('#user-pass').val()
    },
    success: function (response) {
      onSucess()
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('.error').text(jqXHR.responseText).css('display', 'block').fadeIn().delay(2000).fadeOut()
      onError()
    }
  })
}

function isEverythingRight (doError) {
  var ok = ($('#user-access').val().length >= 9 && isNum($('#user-access').val()))

  ok = ok && $('#user-pass').val().length > 5

  if (!ok && doError) {
    onError()
  }

  return ok
}
