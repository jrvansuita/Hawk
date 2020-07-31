var datePicker = null
var page = 0
var loading = false
var showAll = false
$(document).ready(() => {
  console.log(orders)

  $('#new-button').click(() => {
    showModal()
  })

  $('#search-input').on('keyup', function (e) {
    if (e.which === 13) {
      searchOrder()
    }
  })

  bindHideModal()

  placeOrders(window.orders)

  getFinishedOrders()
  bindScrollLoad()

  dataPicker = new RangeDatePicker()

  dataPicker.holder('.date-filters-holder', false)
    .setTitles('Data de Início', 'Data de Fim')
    .setPos(-72, 0)
    .load()
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
  if (orders?.length) {
    parent.empty()
    orders.forEach((each) => {
      var table = $('<table>').attr('width', '100%').addClass('table-orders')
      var holder = $('<div>').addClass('shadow order-item clickable-mini-item').data({ id: each.id, status: each.status })

      if (each.status === 0) holder.addClass('awaiting')
      else holder.addClass('in-progress')

      // infos
      var number = $('<span>').text(each.number).addClass('info-value green-title')
      var season = $('<label>').text(each.season).addClass('mini-red-circle right')
      var brand = $('<label>').text(each.brand).addClass('info-value')
      var manufacturer = $('<label>').text(Str.short(each.manufacturer, 10)).addClass('info-value')
      var date = $('<label>').text(Dat.format(new Date(each.date))).addClass('info-value')
      var userImg = $('<img>').attr('src', each.user.avatar).addClass('mini-avatar shadow circle')
      var delivery = $('<label>').text(calculateDelivery(each.date)).addClass('info-value right')

      var trOne = $('<tr>').append($('<td>').append(number), $('<td>').append(brand), $('<td>').append(season))

      if (showAvatar) {
        var tdAvatar = $('<td>').css('max-width', '30px')
        tdAvatar.attr('rowspan', '2').append(userImg)
        trOne.prepend(tdAvatar)
      }

      var trTwo = $('<tr>').append($('<td>').append(manufacturer), $('<td>').append(date), $('<td>').append(delivery))

      holder.append(table.append(trOne, trTwo))
      parent.append(holder)
    })
  }
}

function bindOrdersDropdown() {
  $('.order-item').each((i, each) => {
    var divMenu = $('<div>').addClass('menu-dots')
    var drop = Dropdown.on(divMenu)
    $(each).append(divMenu)

    drop.item('/img/delete.png', 'Excluir', (helper) => {
      _post('/stock/delete-order', { orderId: helper.parent.data('id') }, (_err, res) => {
        window.location.reload()
      })
    })
    if ($(each).data('status') === 0) {
      drop.item('/img/checked.png', 'Assumir', (helper) => {
        _post('/stock/update-order-status', { orderId: helper.parent.data('id') }, (_err, res) => {
          window.location.reload()
        })
      })
    }

    if ($(each).data('status') === 1) {
      drop.item('/img/checked.png', 'Finalizar', (helper) => {
        _post('/stock/update-order-status', { orderId: helper.parent.data('id') }, (_err, res) => {
          window.location.reload()
        })
      })
    }
  })
}

function bindFinishedDropdown(el) {
  var drop = Dropdown.on(el)

  drop.item('/img/delete.png', 'Excluir', (helper) => {
    console.log(helper)
    _post('/stock/delete-order', { orderId: helper.data.id }, (_err, res) => {
      window.location.reload()
    })
  })
}

function searchOrder() {
  _get('/stock/get-orders', {
    value: $('#search-input').val(),
    begin: $('#date-begin').data('begin'),
    end: $('#date-end').data('end')
  }, (data) => {
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
  bindOrdersDropdown()
}

function calculateDelivery(date) {
  var today = new Date()
  var result = Dat.daysDif(today, new Date(date))

  if (result > 0) {
    return 'Em ' + result + ' dia(s)'
  } else if (result < 0) {
    return 'Atrasado ' + Math.abs(result) + ' dia(s)'
  } else {
    return 'Entrega Hoje'
  }
}

function getFinishedOrders() {
  if (!showAll) {
    page++
    loading = true

    _get('/stock/get-orders', { status: 2, page: page, limit: 20 }, (data) => {
      showAll = data.finished.length === 0
      console.log(showAll)
      loading = false
      createFinishedTable(data.finished)
    })
  }
}

function createFinishedTable(data) {
  data.forEach((each) => {
    var trLine = $('<tr>').addClass('line-order')
    var date = $('<td>').text(Dat.format(new Date(each.date)))
    var number = $('<td>').text(each.number)
    var manufacturer = $('<td>').text(each.manufacturer)
    var brand = $('<td>').text(each.manufacturer)
    var user = $('<td>').text(each.user.name)
    var menuHolder = $('<div>').addClass('menu-dots')
    var menu = $('<td>').append(menuHolder)
    trLine.append(date, number, manufacturer, brand, user, menu)

    $('.content-table').append(trLine)
    bindFinishedDropdown(menuHolder)
  })
}

function bindScrollLoad() {
  var $pane = $('.right-holder')
  var $list = $('.content-scroll')

  $list.unbind('scroll').bind('scroll', function () {
    if ($pane.scrollTop() + $pane.height() + 1000 >= $list.height() && !loading) {
      getFinishedOrders()
    }
  })
}
