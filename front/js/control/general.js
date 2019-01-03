$(document).ready(() => {
  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    e.stopPropagation();
  });


  $('img.avatar-img').error(function(){
    $(this).unbind("error").attr("src", "/img/avatar.png");
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
