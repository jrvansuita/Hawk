var hideIds = [
  'email-pass',
  'magento-pass',
  'eccosys-secret',
  'imgur-pass',
  'mundipagg-secret'
]

$(document).ready(() => {
  $('.save').click(saveApiKey)
  buildApiItemList()
  onInit()

  $('#api-key').focus(function () {
    if (!$(this).val()) $(this).val(btoa(Math.round(Util.uid(12) * Math.random())))
  })

  $('.api-item').click(function () {
    editApiItem($(this))
  })
  // Set the Values
  $('input:text').each((each, el) => {
    loadTextVal(el)
  })

  $(':input[type="number"]').each((each, el) => {
    loadTextVal(el)
  })

  $('input:checkbox').each((each, el) => {
    loadCheckboxVal(el)
  })

  if (loggedUser.full) {
    $('input:text').change(onPutString)
    $(':input[type="number"]').change(onPutNumber)
    $('input:checkbox').change(onPutBoolean)
  } else {
    hideIds.forEach((id) => {
      $('#' + id).attr('type', 'password')
    })
  }

  $('#access-time-renew').prop('disabled', true)
  $('.renew-time').click(() => {
    $('#access-time-renew').val('Acesso Renovado para +3 Horas')
    putParam('access-time-renew', Dat.rollHour(new Date(), 3).getTime())
  })
})

function loadTextVal (el) {
  $(el).val(window._fullparams[$(el).attr('id')])
}

function loadCheckboxVal (el) {
  $(el).prop('checked', window._fullparams[$(el).attr('id')])
}

function onPutString () {
  if (!$(this).hasClass('locked')) putParam($(this).attr('id'), $(this).val())
}

function onPutNumber () {
  putParam($(this).attr('id'), Num.def($(this).val()))
}

function onPutBoolean (el) {
  putParam($(this).attr('id'), $(this).is(':checked'))
}

function putParam (id, value) {
  _post('/put-main-param', { name: id || 'none', val: value }, () => {
    console.log('[Put]: ' + id + ' - ' + value)
  })
}

function saveApiKey () {
  var key = $('#api-user').val() + '-' + btoa($('#api-key').val()) + '-' + $('#api-permission').val()
  key = btoa(key)

  var index = $('.api-holder').attr('index')
  var apiKeys = window._fullparams['api-app-keys']

  index ? (apiKeys[index] = key) : apiKeys.push(key)

  putParam('api-app-keys', apiKeys)
  window.location.reload()
}

function buildApiItemList () {
  var $table = $('.table-api')

  window._fullparams['api-app-keys'].forEach((key) => {
    var $line = $('<tr>').addClass('api-item')
    key = atob(key)
    key.split('-').forEach((e, index) => {
      index++
      var $item = $('<td>')
      var $span = $('<span>').addClass('item-span')
      index === 2 ? $span.text(btoa(key)).addClass('copiable') : $span.text(e)
      $table.append($line.append($item.append($span)))
    })
    var $menu = $('<div>').addClass('menu-dots')
    $('.api-item td span').last().append($menu)
  })
  bindCopiable()
}

function editApiItem (item) {
  var index = $(item).index() - 1
  var arr = atob(window._fullparams['api-app-keys'][index]).split('-')

  $('#api-user').val(arr[0])
  $('#api-key').val(atob(arr[1]))
  $('#api-permission').val(arr[2])

  $('.api-holder').attr('index', index)
}

function onInit () {
  if ($('#api-permission').length) {
    new ComboBox($('#api-permission'))
      .fromEnum('API-PERM')
      .setAutoShowOptions()
      .setOnItemSelect((item, index) => {
        $('#api-permission').val(item.value)
      })
      .load()

    $('.menu-dots').each((index, each) => {
      Dropdown.on(each).item('/img/delete.png', 'Excluir', (helper) => {
        removeApiItem($(helper.parent).closest('tr'))
      })
    })
  }
}

function removeApiItem (item) {
  var index = $(item).index() - 1
  window._fullparams['api-app-keys'].splice(index, 1)
  putParam('api-app-keys', window._fullparams['api-app-keys'])
  $(item).fadeOut()
}
