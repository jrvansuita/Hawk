$(document).ready(() => {

  $('.login-form').hide().fadeIn();


  $('#guest').click(() => {
    login(100);
  });

  $('#user-access').on("keyup", function(e) {
    var key = e.which;
    if (key == 13){
      if (isEverythingRight(false))
      login();
    }
  });

  $('.new-cancel').click(()=>{
    $('.user-id-holder').fadeOut(100);
    $('.new-user').text('Novo');
    $('#user-access').val('');
    $('#user-id').val('');
    $('.new-cancel').fadeOut(100);
  });

  $('.new-user').click(()=>{
    if ($('.user-id-holder').is(":visible")){
      if (isEverythingRight(true)){
        login();
      }
    }else{
      $('.user-id-holder').fadeIn(100);
      $('.new-user').text('Salvar');
      $('.new-cancel').fadeIn(100);
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
      userAccess: code ? code : $('#user-access').val(),
      userId: $('#user-id').val()
    },
    success: function(response) {
      onSucess();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('.error').text(jqXHR.responseText).fadeIn().delay(2000).fadeOut();
      onError();
    }
  });
}


function isEverythingRight(doError){
  var ok = ($('#user-access').val().length >= 9 && isNum($('#user-access').val()));

  if (ok){
    ok = (!$('.user-id-holder').is(":visible") || ($('#user-id').val().length >= 9 && isNum($('#user-id').val())));
  }

  if (!ok && doError){
    onError();
  }

  return ok;
}
