var uploadsLinks = []

$(document).ready(() => {
  $('#save').click(() => {
    if (checkFormBeforeSave()) saveNewOrder()
  })

  $('.input-combo').each((index, el) => {
    var attr = $(el).data('attr')
    bindComboBox($(el), attr)
  })

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
  var url = '/stock/stock-order-attr?attr=' + data
  new ComboBox(el, url)
    .setAutoShowOptions(true)
    .setLimit(limit)
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

function handleUploadResult(data) {
  uploadsLinks.push({ id: data.id, name: data.name })
  bindAttachsInfo(data)
}

function bindAttachsInfo(data) {
  if (Array.isArray(data)) {
    data.forEach((each) => {
      var $span = $('<span>').addClass('file-info')
      $('.files').append($span.html(each.name + '<br>').attr('file-id', each.id).click(viewAttach))
    })
  } else {
    var $span = $('<span>').addClass('file-info')
    $('.files').append($span.html(data.name + '<br>').attr('file-id', data.id).click(viewAttach))
  }
}

function setLoading(isLoading) {
  if (isLoading) {
    $('#upload-img').attr('src', '/img/loader/circle.svg');
  } else {
    $('#upload-img').attr('src', '/img/create-doc.png');
  }
}

function saveNewOrder() {
  _post('/stock/new-order', { data: buildFormData() }, (result) => {
    window.location.reload()
  })
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
