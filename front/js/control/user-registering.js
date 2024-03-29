var userSelector;
var passPlaceHolder = 'Impossível Decifrar';

var comboManufaturer;

$(document).ready(() => {
  if (selectedUser.type === 1) {
    bindBrandCombo()
    placeBrandTags()
  }

  new ComboBox($('#user-search'), '/performance/profiles')
    .setAutoShowOptions()
    .setOnItemBuild((user, index) => {
      return { text: user.name, img: user.avatar };
    })
    .setOnItemSelect((item, user) => {
      window.location = '/user/registering?userId=' + user.id;
    })
    .load()
    .then(binder => (userSelector = binder));

  var name;

  $('#user-search').focusin(() => {
    name = $('#user-search').val();
    $('#user-search').val('');
  });

  $('#user-search').focusout(() => {
    $('#user-search').val(name);
  });

  $('#new').click(() => {
    clearForm();
  });

  $('#save').click(() => {
    if (checkform()) {
      $('#user-registering').submit();
    }
  });

  $('#delete').click(() => {
    if ($('#id').val().length > 0) {
      $.ajax({
        url: '/user/delete',
        type: 'post',
        data: { id: $('#id').val() },
        success: response => {
          window.location = '/user/registering';
        },
        error: (error, message, errorThrown) => {
          console.log(error);
        },
      });
    }
  });

  if (!loggedUser.full) {
    $('#user-search').attr('disabled', true);
    $('#full').attr('disabled', true);
    $('#token').attr('disabled', true);
  }

  var showActive = loggedUser && loggedUser.full && loggedUser.id != selectedUser.id;

  if (!showActive) {
    $('#active').parent().removeClass('active').addClass('disabled');
  }

  $('.token-label').click(() => {
    $('#token').fadeIn();
    $('.token-label').hide();
  });

  $('.disabled').click(e => {
    e.preventDefault();
  });

  new ComboBox($('#title')).fromEnum('EMP-GROUPS').setAutoShowOptions().load();

  loadSetts();

  new ComboBox($('#office'))
    .fromEnum('TYPE-FUNC')
    .setAutoShowOptions()
    .setOnItemSelect((item, index) => {
      $('#office').val(item.value);
      $('#type').val(item.data.name);
    })
    .load();

  $('.avatar-img, .edit-image').hover(
    () => {
      if ($('#editing').val() > 0) {
        $('.avatar-img').css('opacity', '0.8');
        $('.edit-image').css('opacity', '1');
      }
    },
    () => {
      if ($('#editing').val() > 0) {
        $('.avatar-img').css('opacity', '1');
        $('.edit-image').css('opacity', '0');
      }
    }
  );

  $('.avatar-img, .edit-image').click(() => {
    if ($('#editing').val() > 0) {
      $('#avatar-input-file').trigger('click');
    }
  });

  $('#avatar-input-file').change(event => {
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      $('.avatar-img').attr('src', event.target.result);

      showAvatarCropper();
    };

    reader.readAsDataURL(selectedFile);
  });

  loadMenuOpts();

  $('#pass').val(passPlaceHolder);

  createCombo();

  Dropdown.on('.icon-dots', true, true)
    .item('/img/loader/refresh.svg', 'Recarregar Fabricantes', (helper) => {
      _post('/stock/refresh-attrs', () => { })
  }).onMouseLeave()
})

function createCombo() {
  comboManufacturer = new ComboBox($('#manufac'), '/stock/storer-attr?attr=Fabricante');

  comboManufacturer
    .setAutoShowOptions()
    .setOnItemBuild((item, index) => {
      return { text: item.description, value: item.value };
    })
    .setOnItemSelect((item, index) => {
      $('#manufac').val(item.value);
    }).load()
}
function showAvatarCropper() {
  $('.avatar-holder').width(300).height(300);

  $('.avatar-crop-ok')
    .click(() => {
      var r = {
        type: 'base64',
        size: { width: 100, height: 100 },
        format: 'png',
      };

      croppie.result(r).then(function (base64Image) {
        $('.avatar-img').attr('src', base64Image);
        _postImg('/user/avatar', { userId: $('#editing').val(), avatar: base64Image.split(',')[1] }, url => {
          selectedUser.avatar = url;
          $('#avatar-input-file').val(url);
        });
      });

      croppie.destroy();
      $('.avatar-holder').width(100).height('auto');
      $('.avatar-crop-ok').hide();
    })
    .show();

  croppie = new Croppie(document.getElementById('avatar-user-registering'), {
    enableExif: true,
    enableResizeboolean: true,
    enableZoomboolean: true,
    enforceBoundary: true,
    viewport: {
      width: 150,
      height: 150,
      type: 'circle',
    },
  });
}

function clearForm() {
  $('input').val('');
  $('#editing').attr('value', '');
  $('#editing').val('');
  $('#token').val('');
  $('#title-label').text('');
  $('input[type="checkbox"]').prop('checked', false);
  $('#avatar-user-registering').attr('src', '/img/avatar.png');
  $('#email').val('');
  $('#office').val('');
}

function checkform() {
  var c = checkMaterialInput($('#title'));
  c = checkMaterialInput($('#name')) & c;
  c = checkMaterialInput($('#access')) & c;
  c = checkMaterialInput($('#email')) & c;

  if ($('#access').val()) {
    c = testUniqueAccess() & c;
  }

  if ($('#pass').val() == passPlaceHolder) {
    $('#pass').val(selectedUser.pass);
  }

  if ($('#email').val()) {
    c = testUniqueAccess() & c;
  }

  return c;
}

function testUniqueAccess() {
  var access = $('#access').val().trim();

  var option = userSelector.getData().find(each => {
    var user = each.data;
    return user.access && user.access.trim() == access.trim();
  });

  var user = option ? option.data : null;

  if (user && user.id != $('#editing').val()) {
    $('#access').val('Cartão de acesso já utilizado');
    onInputError($('#access'));
    return false;
  } else {
    return true;
  }
}

function loadSetts() {
  if (loggedUser.full) {
    $('.settings').empty();

    _get('/enum?tag=USER-PERM', {}, data => {
      data = data.items.reduce((o, each) => {
        o[each.description] = [].concat(o[each.description], each).filter(Boolean);
        return o;
      }, {});

      Object.keys(data)
        .sort()
        .forEach(key => {
          showGroup(key, data[key]);
        });
    });
  }
}

function showGroup(title, items) {
  var $div = $('<div>').addClass('setts-group');
  var $title = $('<span>').addClass('setts-group-title').text(title);
  $div.append($title);

  items.forEach(each => {
    $div.append(createCheckBox(each));
  });

  $('.settings').append($div);
}

function createCheckboxElement(index, id, name, checked, disabled) {
  var holder = $('<label>').addClass('pure-material-checkbox').attr('title', index);
  var input = $('<input>').attr('type', 'checkbox').attr('name', id);
  var title = $('<span>').text(name).attr('title', index);

  if (checked) {
    input.attr('checked', 'checked');
  }

  if (disabled) {
    input.attr('disabled', 'disabled');
  }

  holder.append(input, title);

  return holder;
}

function createCheckBox(settItem) {
  var div = $('<div>').addClass('setts-row');
  var check = createCheckboxElement(settItem.value, 'sett-' + settItem.value, settItem.name, userSetts[settItem.value]);

  div.append(check);

  return div;
}

function loadMenuOpts() {
  $('.main-menu-nav .menu-item').each((i, each) => {
    var name = $(each).text().trim();

    if (selectedUser.menus) {
      checked = selectedUser.menus.includes(name.toLowerCase());
    }

    $('.menus-opts-inner').append(createCheckboxElement(null, 'menu-' + name.toLowerCase(), name, checked || selectedUser.full, selectedUser.full));
  });
}

function bindBrandCombo() {
  new ComboBox($('.brand-input'), '/stock/stock-order-attr?attr=Marca')
    .setAutoShowOptions()
    .setOnItemBuild((brand, index) => {
      return { text: brand.description.trim(), value: brand.value };
    })
    .setOnItemSelect((brand, index) => {
      if (Arr.notIn(checkBrand(), brand.value)) {
        $('.sel-box').append(Util.getToastItem(brand.value, brand.value, null, getBrandList))
        getBrandList()
      }
    })
    .load()
}

function getBrandList() {
  var value
  $('.sel-box span').each((i, each) => {
    value = value ? value + '|' + $(each).text() : $(each).text()
  })
  $('#brands').val(value)
}

function placeBrandTags() {
  if (selectedUser.brands) {
    selectedUser.brands.forEach((each) => {
      $('.sel-box').append(Util.getToastItem(each, each, null, getBrandList))
    })
  }
}

function checkBrand() {
  return $('.sel-box .toast-item')
    .map(function () {
      return $(this).data('val');
    })
    .get();
}
