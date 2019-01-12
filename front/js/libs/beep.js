
function beepSucess() {
  playBeep('beep-sucess.ogg');
}

function beepError() {
  playBeep('beep-error.ogg');
}

function playBeep(sound) {
  new Audio('front/sound/' + sound).play();
}
