$(document).ready(() => {
  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    e.stopPropagation();
  });
});



function isTrueStr(val){
  return val == true || val == "true";
}


function onSimpleMaterialInputError(input){
  input.addClass("simple-material-input-error").delay(1000).queue(function(next){
      $(this).removeClass("simple-material-input-error");
      next();
  });
}
