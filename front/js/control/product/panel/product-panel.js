
var datePicker = null
var page = 0
var loading = false
var showAll = false

$(document).ready(() => {
  console.log(orders)

  $('#new-button').click(() => {
    showNewOrderModal()
  })

  $('#search-input').on('keyup', function (e) {
    if (e.which === 13) {
      searchOrder()
    }
  })

  placeOrders(window.orders)

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

function showNewOrderModal() {
  $('.new-order-modal').show()
  bindHideModal()
}

function bindHideModal(miniModal) {
  var modal = document.querySelector('.modal-holder')
  window.onclick = e => {
    if (e.target === modal) {
      if (miniModal) {
        hideOrderModal()
      } else {
        $(modal).hide()
      }
    }
  }
}

function hideOrderModal() {
  var el = $('.order-modal-content')
  Util.changeFontSize(el, -2)
  $('.clickable-mini-item').removeClass('order-modal-content')
  $('.hiddable-menu').hide()
  $('.clickable-mini-item').addClass('order-item')
  $('.main-order-holder').removeClass('modal-holder')
  $('.date-value').unbind('click').removeClass('datepicker')
  removeItemsModal()
}

function removeItemsModal() {
  $('.removable').remove()
}

function createOrdersList(parent, orders, showAvatar) {
  if (orders?.length) {
    parent.empty()
    orders.forEach((each) => {
      var table = $('<table>').attr('width', '100%').addClass('table-orders')
      var mainOrderHolder = $('<div>').addClass('main-order-holder')
      var holder = $('<div>').addClass('shadow order-item clickable-mini-item').data({ id: each.id, status: each.status })

      if (each.status === 0) holder.addClass('awaiting')
      else holder.addClass('in-progress')

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

      mainOrderHolder.append(holder.append(table.append(trOne, trTwo)))
      parent.append(mainOrderHolder)
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

    placeOrders(data)
  })
}

function emptyList() {
  $('.list-content').empty()
}

function placeOrders(data) {
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
  if (!$(el).hasClass('order-modal-content')) {
    var id = $(el).data('id')
    var orderItem = $(el)
    orderItem.addClass('order-modal-content')
    $(el).parent().addClass('modal-holder')

    var order = window.orders.filter((e) => { return e.id === id })

    bindHideModal(true)

    buildOrderItemModal(orderItem.find('.table-orders'), order[0])
    Util.changeFontSize(orderItem, 2)
  }
}

function buildOrderItemModal(table, orderData) {
  table.find('.date-value').addClass('datepicker')
  bindEditOrder(orderData)

  var menu = table.find('.menu-dots')
  menu.show()

  bindOrdersDropdown(menu, orderData)

  var tr = $('<tr>').addClass('removable dotted-line')

  if (orderData?.attachs.length) {
    var span = $('<span>').addClass('info-value').text('Anexos')
    tr.append($('<td>').append(span))
    var row = $('<tr>').addClass('removable')
    var attachs = $('<td>')
    orderData.attachs.forEach((each) => {
      var $img = $('<img>').attr({ src: '/img/attach.png', attachid: each }).addClass('view-attach').click(viewAttach)
      row.append(attachs.append($img))
    })
  }

  table.append(tr, row)
}

function viewAttach() {
  window.open('https://drive.google.com/file/d/' + $(this).attr('attachid'), '_blank')
}

function bindEditOrder(data) {
  new DatePicker()
    .holder('.datepicker', true)
    .setOnChange((parsed, date) => {
      data.date = date
      editOrder(data)
    })
    .load()
}

function editOrder(data) {
  _post('/stock/new-order', { data: data }, (_err, res) => {
    window.location.reload()
  })
}
