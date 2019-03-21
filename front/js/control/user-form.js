
var userSelector;

$(document).ready(() => {

  userSelector = new UserSelector($('#user-search'));
  userSelector.load();

  var name;

  $('#user-search').focusin(()=>{
    name = $('#user-search').val();
    $('#user-search').val('');
  });

  $('#user-search').focusout(()=>{
    $('#user-search').val(name);
  });

  userSelector.setOnSelect((name)=>{
    var user = userSelector.findUserByName(name);
    window.location=
    '/user-form?userId='+ user.id;
  });

  $('#new').click(()=>{
    clearForm();
  });

  $('#save').click(()=>{
    if (checkform()){
      $('#user-form').submit();
    }
  });

  $('#delete').click(()=>{
    if ($('#id').val().length > 0){
      $.ajax({
        url: '/user-delete',
        type: "post",
        data: {id: $('#id').val()},
        success: (response) =>{
          window.location=
          '/user-form';
        },
        error: (error, message, errorThrown) =>{
          console.log(error);
        }
      });
    }
  });

  if (!loggedUser.full){
    $('#user-search').attr('disabled', true);
    $('#full').attr('disabled', true);
  }


  loadSectors();
  loadSetts();
});


function loadSectors(){
  var options = {
    data: ["Admnistração", "Atendimento", "Expedição", "Estoque"],
    list: {
      match: {
        enabled: true
      }
    }
  };

  $("#title").easyAutocomplete(options);
}


function clearForm(){
  $('input').val('');
  $('#title-label').text('');
  $('input[type="checkbox"]').prop('checked', false);
  $('#avatar-user-form').attr('src', 'img/avatar.png');
}


function checkform(){
  var c = checkMaterialInput($('#title'));
  c = checkMaterialInput($('#name')) & c;
  c = checkMaterialInput($('#avatar')) & c;
  c = checkMaterialInput($('#access')) & c;

  if ($('#access').val()){
    c = testUniqueAccess() & c;
  }



  return c;
}


function testUniqueAccess(){

  var user = userSelector.findUserByAccess($('#access').val());

  if (user && (user.id != $('#editing').val())){
    $('#access').val('Cartão de acesso já utilizado');
    onSimpleMaterialInputError($('#access'));
    return false;
  }else{
    return true;
  }
}


function loadSetts(){
  if (loggedUser.full){
    _get('/get-setts', {}, (all)=>{
      $('.settings').empty();

      var groups = buildSettsGroups(all, ['Geral', 'Picking', 'Packing', 'Estoque', 'Pendências']);

      for (var i = 0; i < groups.length; i++) {
        showGroup(groups[i]);
      }
    });
  }
}

function buildSettsGroups(groups, titles){
  var result = [];
  for (var i = 0; i < titles.length; i++) {
    result.push(buildCurrentGroup(groups, i, titles));
  }
  return result;
}

function buildCurrentGroup(groups, index, titles){
  return {arr : getGroupSetts(index, groups),
    title: titles[index]};
  }


  function getGroupSetts(groupNum, arr){
    return arr.filter((i)=>{
      return i.group == groupNum;
    });
  }


  function showGroup(group){
    var $div = $('<div>').addClass('setts-group');
    var $title = $('<span>').addClass('setts-group-title').text(group.title);
    $div.append($title);

    group.arr.forEach((each)=>{
      if (each.type == 0){
        $div.append(createCheckBox(each));
      }

    });

    $('.settings').append($div);
  }


  function createCheckBox(settItem){
    var div = $('<div>').addClass('setts-row');
    var row = $('<label>').addClass('pure-material-checkbox').attr('title',settItem.id);
    var input = $('<input>').attr('type', 'checkbox').attr('name', 'sett-' + settItem.id);
    var title = $('<span>').text(settItem.name);

   if (userSetts[settItem.id]){
     input.attr('checked', 'checked');
   }

    row.append(input, title);
    div.append(row);

    return div;
  }
