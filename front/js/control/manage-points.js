
var users;

$(function() {

  _get('/profiles', null, (allUsers)=>{
    users = allUsers;

    loadUsersAutoComplete($('#user'), users, function(val) {
      var user = Util.findUserInListByName($('#user').val(), allUsers);
      $('#profile-img').attr('src', user.avatar);
      $('#profile-name').text(user.name);
    });
  });

  var typesList = {'Packing': null,
  'Picking' : null};

  var ins = $('#type').autocomplete({
    data: typesList
  });

  $('.store-button').click(()=>{
    var c = checkField($('#user'));
    c = checkField($('#obs')) & c;
    c = checkField($('#val')) & c;
    c = checkValIsInList($('#type'), typesList) & c;

    if (c){
      var user = Util.findUserInListByName($('#user').val(), users);

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
});


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
