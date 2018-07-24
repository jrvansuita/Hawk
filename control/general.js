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
