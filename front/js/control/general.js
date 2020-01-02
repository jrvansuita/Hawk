$(document).ready(() => {
  bindCopiable();


  $('img.avatar-img').error(function(){
    $(this).unbind("error").attr("src", "/img/avatar.png");
  });


  setTimeout(() => {
    $('.hidable-script').remove();
  }, 100);


});



function isTrueStr(val){
  return val == true || val == "true";
}


function onSimpleMaterialInputError(input){
  input.addClass("simple-material-input-error").delay(4000).queue(function(next){
    $(this).removeClass("simple-material-input-error");
    next();
  });
}



function checkMaterialInput(el){
  if (!el.val()){
    onSimpleMaterialInputError(el);
    return false;
  }

  return true;
}


function bindCopiable(){
  var event = function(e){
    Util.selectContent(this);
    Util.copySeleted();
    $(this).select();
    e.stopPropagation();
  };


  $('.copiable').off('click', event).on('click', event);
}
