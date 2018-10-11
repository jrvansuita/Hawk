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


function loadUsersAutoComplete(el, users, onSelect){
  var data = [];

  Object.keys(users).forEach((key)=>{
    if (users[key].avatar)
    data[users[key].name] = users[key].avatar;
  });

  el.autocomplete({
    data: data,
    limit: 5,
    onAutocomplete: onSelect
  });
}
