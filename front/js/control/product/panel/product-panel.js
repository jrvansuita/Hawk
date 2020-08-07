
var datePicker = null
var page = 0
var loading = false
var showAll = false

$(document).ready(() => {
  console.log(orders)

  $('#new-button').click(() => {
    showNewOrderModal(true)
  })

  $('#search-input').on('keyup', function (e) {
    if (e.which === 13) {
      searchOrder()
    }
  })

  buildOrdersColumns(window.orders)

  getFinishedOrders()
  bindScrollLoad()

  dataPicker = new RangeDatePicker()

  dataPicker.holder('.date-filters-holder', false)
    .setTitles('Data de Início', 'Data de Fim')
    .setPos(-72, 0)
    .setDates(Dat.firstDayOfMonth(), Dat.lastDayOfMonth())
    .load()

  $('.order-item').click(function (e) {
    e.stopPropagation()
   orderItemClick(e.currentTarget)
  })
})

function showNewOrderModal(clear) {
  if (clear) clearModal()

  $('.new-order-modal').show()
  bindHideModal()
}

function bindHideModal() {
  var modal = document.querySelector('.modal-holder')
  window.onclick = e => {
    if (e.target === modal) $(modal).hide()
  }
}

function createOrdersList(parent, orders, showAvatar) {
  if (orders?.length) {
    parent.empty()
    orders.forEach((each) => {
      var menuDots = $('<div>').addClass('menu-dots')
      var table = $('<table>').attr('width', '100%').addClass('table-orders')
      var mainOrderHolder = $('<div>').addClass('main-order-holder')
      var holder = $('<div>').addClass('shadow order-item clickable-mini-item').data({ id: each.id, status: each.status })

      each.status === 0 ? holder.addClass('awaiting') : holder.addClass('in-progress')

      // infos
      var number = $('<span>').text(each.number).addClass('info-value green-title copiable')
      var season = $('<span>').text(each.season).addClass('mini-red-circle right').css('background', Util.strToColor(each.season + each.season.length))
      var brand = $('<span>').text(each.brand).addClass('info-value brand-value')
      var manufacturer = $('<span>').text(Str.short(each.manufacturer, 10)).addClass('info-value')
      var date = $('<span>').text(Dat.format(new Date(each.date))).addClass('info-value date-value')
      var userImg = $('<img>').attr('src', each.user.avatar).addClass('mini-avatar shadow circle')
      var delivery = $('<span>').text(calculateDelivery(each.date)).addClass('info-value right')

      var trOne = $('<tr>').append($('<td>').append(number), $('<td>').append(brand), $('<td>').append($('<div>').addClass('menu-dots hiddable-menu'), season))

      if (showAvatar) {
        var tdAvatar = $('<td>').css('max-width', '33px')
        tdAvatar.attr('rowspan', '2').append(userImg)
        trOne.prepend(tdAvatar)
      }

      var trTwo = $('<tr>').append($('<td>').append(manufacturer), $('<td>').append(date), $('<td>').append(delivery))

      mainOrderHolder.append(holder.append(table.append(trOne, trTwo), menuDots))
      parent.append(mainOrderHolder)
      bindOrdersDropdown(menuDots, each)
    })
  }
}

function bindOrdersDropdown(el, orderData) {
  if (!$(el).find('img').length) {
    var drop = Dropdown.on(el)

    drop.item('/img/delete.png', 'Excluir', (helper) => {
      _post('/stock/delete-order', { orderId: orderData.id }, (_err, res) => {
        window.location.reload()
      })
    })
    if (orderData.status === 0) {
      drop.item('/img/checked.png', 'Assumir', (helper) => {
        _post('/stock/update-order-status', { orderId: orderData.id }, (_err, res) => {
          window.location.reload()
        })
      })
    }

    if (orderData.status === 1) {
      drop.item('/img/checked.png', 'Finalizar', (helper) => {
        _post('/stock/update-order-status', { orderId: orderData.id }, (_err, res) => {
          window.location.reload()
        })
      })
    }
  }
}

function bindFinishedDropdown(el) {
  var drop = Dropdown.on(el)

  drop.item('/img/delete.png', 'Excluir', (helper) => {
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

    buildOrdersColumns(data)
  })
}

function emptyList() {
  $('.list-content').empty()
}

function buildOrdersColumns(data) {
  createOrdersList($('.awaiting-col .list-content'), filterOrders(data, 0))
  createOrdersList($('.in-progress-col .list-content'), filterOrders(data, 1), true)

  bindCopyable()
}

function filterOrders(data, status) {
  return data.filter((e) => { return e.status === status })
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
      showAll = data.length === 0
      loading = false
      createFinishedTable(filterOrders(data, 2))
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
    var menuHolder = $('<div>').addClass('menu-dots').data('id', each.id)
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

function orderItemClick(el) {
  var id = $(el).data('id')
  var order = window.orders.filter((e) => { return e.id === id })

  bindInfoOrderModal(order[0])
}

function bindInfoOrderModal(order) {
  clearModal()
  $('#new-stock-order').find('input').each((index, input) => {
    Object.keys(order).forEach((each) => {
      if ($(input).attr('id') === each) $(input).val(order[each])
    })
  })

  $('#date-picker').val(Dat.format(new Date(order.date)))
  $('#date-hidden').val(order.date)
  uploadsLinks = order.attachs
  $('#save').text('Salvar Pedido')
  $('.register-title').text('Editar Pedido')
  bindAttachsInfo(order.attachs)
  showNewOrderModal()
}
