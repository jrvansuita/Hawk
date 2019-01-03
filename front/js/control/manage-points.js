
var userSelector;

$(function() {

  userSelector = new UserSelector($('#user'));
  userSelector.load(()=>{
    onInit();
  });

  userSelector.setOnSelect((name)=>{
    var user = userSelector.findUserByName(name);
    $('#profile-img').attr('src', user.avatar);
    $('#profile-name').text(user.name);
  });
});

function onInit(){

    var typesList = {'Packing': null, 'Picking' : null};

    var ins = $('#type').autocomplete({
      data: typesList
    });

    $('.store-button').click(()=>{
      var c = checkField($('#user'));
      c = checkField($('#obs')) & c;
      c = checkField($('#val')) & c;
      c = checkValIsInList($('#type'), typesList) & c;

      if (c){
        var user = userSelector.getSelectedUser();
        
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
