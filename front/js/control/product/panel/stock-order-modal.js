var uploadsLinks = []

$(document).ready(() => {
  $('#save').click(() => {
    if (checkFormBeforeSave()) $('#new-stock-order').submit()
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
  var isOk = false
  $('.material-input-holder input').each((i, each) => {
    isOk = checkMaterialInput($(each))
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
  uploadsLinks.push(data.id)
  $('#attachs-hidden').val(uploadsLinks)

  var $span = $('<span>')
  $('.files').append($span.html(data.name + '<br>'))
}

function setLoading(isLoading) {
  if (isLoading) {
    $('#upload-img').attr('src', '/img/loader/circle.svg');
  } else {
    $('#upload-img').attr('src', '/img/attach.png');
  }
}
