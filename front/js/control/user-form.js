
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
    console.log(name);

    var user = userSelector.findUserByName(name);
    console.log(user);
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
    $('#token').attr('disabled', true);
  }

  var showActive =  (loggedUser && loggedUser.full && loggedUser.id != selectedUser.id);

  if (!showActive){
    $('#active').parent().removeClass('active').addClass('disabled');
  }

  $('.token-label').click(()=>{
    $('#token').fadeIn();
    $('.token-label').hide();
  });


  $('.disabled').click((e)=>{
    e.preventDefault();
  });

  loadSectors();
  loadSetts();


  $('.avatar-img, .edit-image').hover(()=>{
    if ($('#editing').val() > 0){
      $('.avatar-img').css('opacity', '0.8');
      $('.edit-image').css('opacity', '1');
    }
  },()=>{
    if ($('#editing').val() > 0){
      $('.avatar-img').css('opacity', '1');
      $('.edit-image').css('opacity', '0');
    }
  });

  $('.avatar-img, .edit-image').click(()=>{
    if ($('#editing').val() > 0){
      $('#avatar-input-file').trigger('click');
    }
  });

  $('#avatar-input-file').change((event)=>{
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
      $('.avatar-img').attr('src', event.target.result);

      showAvatarCropper();
    };

    reader.readAsDataURL(selectedFile);
  });



  loadMenuOpts();

});

function showAvatarCropper(){
  $('.avatar-holder').width(300).height(300);

  $('.avatar-crop-ok').click(()=>{
    var resultParams = {
      type: 'base64',
      size: {width: 100, height: 100},
      format: 'png'
    };

    croppie.result(resultParams).then(function(base64Image) {
      $('.avatar-img').attr('src', base64Image);
      _post('/upload-user-avatar', {userId: $('#editing').val() , avatar: base64Image.split(',')[1]},(url)=>{
        selectedUser.avatar = url;
      });
    });

    croppie.destroy();
    $('.avatar-holder').width(100).height('auto');
    $('.avatar-crop-ok').hide();

  }).show();

  croppie = new Croppie(document.getElementById('avatar-user-form'), {
    enableExif : true,
    enableResizeboolean : true,
    enableZoomboolean: true,
    enforceBoundary: true,
    viewport: { width: 150,
      height: 150,
      type: 'circle' }
    });
  }


  function loadSectors(){
    var options = {
      data: ["Admnistração", "Atendimento", "Conferência", "Reposição", "Pendência", "Devolução", "Picking", "Packing"],
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
    $('#editing').attr('value', '');
    $('#editing').val('');
    $('#token').val('');
    $('#title-label').text('');
    $('input[type="checkbox"]').prop('checked', false);
    $('#avatar-user-form').attr('src', 'img/avatar.png');
  }


  function checkform(){
    var c = checkMaterialInput($('#title'));
    c = checkMaterialInput($('#name')) & c;
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

    function createCheckboxElement(id, name, checked, disabled){
      var holder = $('<label>').addClass('pure-material-checkbox').attr('title', id);
      var input = $('<input>').attr('type', 'checkbox').attr('name', id);
      var title = $('<span>').text(name);

      if (checked){
        input.attr('checked', 'checked');
      }

      if (disabled){
        input.attr('disabled', 'disabled');
      }

      holder.append(input, title);

      return holder;
    }


    function createCheckBox(settItem){
      var div = $('<div>').addClass('setts-row');
      var check = createCheckboxElement('sett-' + settItem.id, settItem.name, userSetts[settItem.id]);

      div.append(check);

      return div;
    }


    function loadMenuOpts(){

      $('li.menu-item').each((i, each)=>{
        var name = $(each).text().trim();

        if (selectedUser.menus){
          checked = selectedUser.menus.includes(name.toLowerCase());
        }


        $('.menus-opts-inner').append(createCheckboxElement('menu-' + name.toLowerCase(), name, checked || selectedUser.full, selectedUser.full));
      });

    }
