
var userSelector;

$(function() {

  new ComboBox($('#user'), '/profiles')
  .setAutoShowOptions()
  .setOnItemBuild((user, index)=>{
    return {text : user.name, img : user.avatar};
  })
  .setOnItemSelect((item, user)=>{
    $('#profile-img').attr('src', user.avatar);
    $('#profile-name').text(user.name);
  })
  .load()
  .then((binder) => {
    userSelector = binder;
    onInit();
  });
});

function onInit(){

  new ComboBox($('#type'), ["Packing", "Picking"])
  .setAutoShowOptions()
  .load();



  $('.store-button').click(()=>{
    var c = checkField($('#user'));
    c = checkField($('#obs')) & c;
    c = checkField($('#val')) & c;
    c = checkField($('#type')) & c;

    if (c){
      var user = userSelector.getSelectedObject();

      var data = {
        userId : user.id,
        points : $('#val').val(),
        obs : $('#obs').val(),
        type : $('#type').val()
      };

      _post('/points',{data:data}, (e)=>{
        window.location.href='/history';
      });
    }
  });
}


function checkField(el){
  if (!el.val()){
    onSimpleMaterialInputError(el);
    return false;
  }

  return true;
}

function checkValIsInList(el, list){
  if (!Object.keys(list).includes(el.val())){
    onSimpleMaterialInputError(el);
    return false;
  }

  return true;
}
