
function beepSucess() {
  playBeep('beep-sucess.ogg');
}

function beepError() {
  playBeep('beep-error.ogg');
}

function beepThreeSign() {
  playBeep('beep-three-sign.mp3');
}

function beepNoisy() {
  playBeep('beep-noisy.mp3');
}

function playBeep(sound) {
  new Audio('/front/sound/' + sound).play();
}
