var uploadsLinks = []

$(document).ready(() => {
  $('#save').click(() => {
    if (checkFormBeforeSave()) saveNewOrder()
  })

  bindComboBox()

  $('#upload-img').click(function () {
    $('#input-upload').click()
  })

  bindDatePicker()
  handleUploadSubmit()
  uploadAttach()
})

function checkFormBeforeSave() {
  var isOk = true
  $('#new-stock-order').find('.order-input').each((i, each) => {
    isOk = isOk && checkMaterialInput($(each))
  })
  return isOk
}

function bindComboBox(el, data, limit) {
  if (loggedUser.type === 1) {
    buildCombo($('#season'), 'Estacao')
    $('#manufacturer').attr('disabled', true).val(loggedUser.manufacturer)
    buildBrandsFromUser()
  } else {
    $('.input-combo').each((index, el) => {
      var attr = $(el).data('attr')
      buildCombo($(el), attr)
    })
  }
}

function buildBrandsFromUser() {
 var combo = new ComboBox($('#brand'), loggedUser.brands)
    .setAutoShowOptions(true)
    .setOnItemBuild((item, index) => {
      return { text: item, value: item }
    })

  if (loggedUser.brands.length === 1) {
    $('#brand').val(loggedUser.brands[0])
  }
  combo.load()
}

function buildCombo(el, data) {
  var url = '/stock/stock-order-attr?attr=' + data
  new ComboBox(el, url)
    .setAutoShowOptions(true)
    .setOnItemBuild((item, index) => {
      return { text: item.description.trim(), value: item.value }
    }).load()
}

function bindDatePicker() {
  datePicker = new DatePicker()

  datePicker.holder('#date-picker', true)
    .setOnSelect((dateVal, date) => {
      $('#date-picker').val(dateVal)
      $('#date-hidden').val(date)
    })
    .load()
}

function uploadAttach() {
  var inputUpload = document.getElementById('input-upload')

  inputUpload.onchange = () => {
    $('#img-upload').submit()
  }
}

function handleUploadSubmit() {
  $('#img-upload').on('submit', function (e) {
    e.preventDefault()
    var form = $(this);
    setLoading(true)
    $.ajax({
      type: 'POST',
      url: '/stock/order-attach-upload',
      cache: false,
      contentType: false,
      processData: false,
      data: new FormData(form[0]),
      success: function (data) {
        handleUploadResult(data)
        setLoading(false)
      }
    })
  })
}

function deleteAttach() {
  var fileId = $(this).data('fileId')
  $.ajax({
    type: 'POST',
    url: '/stock/order-attach-delete',
    data: { fileId: fileId },
    success: (data) => {
      uploadsLinks.filter((each, index) => {
        if (each.id === fileId) { uploadsLinks.splice(index, 1) }
      })
      $(this).parent().remove()
      $('#save').focus()
    }
  })
}

function handleUploadResult(data) {
  uploadsLinks.push({ id: data.id, name: data.name })
  bindAttachsInfo(uploadsLinks)
}

function bindAttachsInfo(data) {
  $('.files').empty()

  data.forEach((each) => {
      var $holder = $('<div>')
      var $name = $('<span>').text(each.name).attr('file-id', each.id).click(viewAttach).addClass('file-info')
    var $delete = $('<img>').attr('src', '/img/block.png').addClass('upload-delete').data('fileId', each.id).click(deleteAttach)
    $('.files').append($holder.append($name, $delete))
    })
}

function setLoading(isLoading) {
  if (isLoading) {
    $('#upload-img').attr('src', '/img/loader/circle.svg');
  } else {
    $('#upload-img').attr('src', '/img/create-doc.png');
  }
}

function saveNewOrder() {
  $.ajax({
    type: 'POST',
    url: '/stock/new-order',
    data: buildFormData(),
    success: (data) => {
      window.location.reload()
    }
  })

  // _post('/stock/new-order', { data: buildFormData() }, (result) => {
  //   window.location.reload()
  // })
}

function buildFormData() {
  var data = {}
  $('#new-stock-order').find('input').each((index, each) => {
    data[$(each).attr('name')] = $(each).val()
  })

  data.attachs = uploadsLinks

  return data
}

function viewAttach() {
  window.open('https://drive.google.com/file/d/' + $(this).attr('file-id'), '_blank')
}

function clearModal() {
  $('#new-stock-order').find('input').each((index, input) => {
    $(input).val('')
  })
  $('#year').val(new Date().getFullYear() + 1)
  $('#save').text('Agendar Pedido')
  $('.register-title').text('Agendar novo Pedido')
  $('.files').empty()
  uploadsLinks = []
}
