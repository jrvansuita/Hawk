var datePicker = null
$(document).ready(() => {
  $('#save').click(() => {
    if (checkFormBeforeSave()) $('#new-stock-order').submit()
  })

  $('#new-button').click(() => {
    showModal()
  })
  $('#search-button').click(() => {
    searchOrder()
  })

  $('#search-input').on('keyup', function (e) {
    if (e.which === 13) {
      searchOrder()
    }
  })

  bindHideModal()
  bindDatePicker()

  placeOrders(window.orders)

  $('.input-combo').each((index, el) => {
    var attr = $(el).data('attr')
    bindComboBox($(el), attr)
  })
})

function showModal() {
  $('.modal-holder').show()
}

function bindHideModal() {
  var modal = document.querySelector('.modal-holder')
  window.onclick = e => {
    if (e.target === modal) {
      $(modal).hide()
    }
  }
}

function createOrdersList(parent, orders, showAvatar) {
  if (orders.length) {
    parent.empty()
    orders.forEach((each) => {
      var table = $('<table>')
      var holder = $('<div>').addClass('shadow order-item').data({ number: each.number, status: each.status, id: each._id })

      if (each.status === 0) holder.addClass('awaiting')
      else holder.addClass('in-progress')

      // infos
      var number = $('<span>').text(each.number).addClass('label-number')
      var season = $('<label>').text(each.season).addClass('label-season')
      var brand = $('<label>').text(each.brand).addClass('label-brand')
      var manufacturer = $('<label>').text(each.manufacturer).addClass('label-manufacturer')
      var date = $('<label>').text(each.date).addClass('label-date')
      var userImg = $('<img>').attr('src', each.user.avatar).addClass('avatar')

      var trOne = $('<tr>').append($('<td>').append(season))

      if (showAvatar) {
        var tdAvatar = $('<td>')
        tdAvatar.attr('rowspan', '4').append(userImg).addClass('avatar-holder')
        trOne.prepend(tdAvatar)
      }

      var trTwo = $('<tr>').append($('<td>').append(manufacturer))
      var trThree = $('<tr>').append($('<td>').append(brand), $('<td>').append(number).addClass('right'))
      var trFour = $('<tr>').append($('<td>').append(date))

      holder.append(table.append(trOne, trTwo, trThree, trFour))
      parent.append(holder)
    })
  }
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
    .setOnSelect((date) => {
      $('#date-picker').val(date)
    })
    .load()
}

function bindDropdown() {
  $('.order-item').each((i, each) => {
    var divMenu = $('<div>').addClass('menu-dots')
    var drop = Dropdown.on(divMenu)
    $(each).append(divMenu)

    drop.item('/img/delete.png', 'Excluir', (helper) => {
      _post('/stock/delete-order', { number: helper.parent.data('number') }, (_err, res) => {
        window.location.reload()
      })
    })
    if ($(each).data('status') === 0) {
      drop.item('/img/checked.png', 'Assumir', (helper) => {
        console.log(helper.parent.data('id'))
        _post('/stock/update-order-status', { orderId: helper.parent.data('number') }, (_err, res) => {
          window.location.reload()
        })
      })
    }
  })
}

function checkFormBeforeSave() {
  var isOk = false
  $('.material-input-holder input').each((i, each) => {
    isOk = checkMaterialInput($(each))
  })
  return isOk
}

function searchOrder() {
  _get('/stock/get-orders', { value: $('#search-input').val() }, (data) => {
    emptyList()

    placeOrders(data)
  })
}

function emptyList() {
  $('.list-content').empty()
}

function placeOrders(data) {
  createOrdersList($('.awaiting-col .list-content'), data?.awaiting)
  createOrdersList($('.in-progress-col .list-content'), data?.processing, true)
  bindDropdown()
}
