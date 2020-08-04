$(document).ready(() => {
  $('#save').click(() => {
    if (checkFormBeforeSave()) $('#new-stock-order').submit()
  })

  $('.input-combo').each((index, el) => {
    var attr = $(el).data('attr')
    bindComboBox($(el), attr)
  })

  $('#upload').click(function () {
    $('#input-upload').click()
  })

  bindDatePicker()
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
  var selectedFile = document.getElementById('input-upload').files[0];
}
