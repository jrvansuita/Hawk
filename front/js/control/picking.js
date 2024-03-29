
var cardTooltip

$(document).ready(() => {
  $('#user-id').focus()

  $('.rfid-card').click(() => {
    startListeningRFID()
  })

  $('#user-id').focusin(() => {
    startListeningRFID()
  }).focusout(() => {
    stopListeningRFID()
  })

  $('.print-progress').click(function (e) {
    // do something
    e.stopPropagation()
    $('#user-id').focus()
  })

  $('#user-id').on('keyup', function (e) {
    var key = e.which
    if (key == 13) {
      var code = $('#user-id').val().trim()

      if (code.length >= 9 && isNum(code)) {
        var onSucess = function (response) {
          if (typeof response === 'string' && response.includes('end-picking')) {
            var sale = response.split('-')
            sale = sale[sale.length - 1]
            $('div[data-sale="progress-' + sale + '"]').css('background-color', '#13bb7070').delay(1000).fadeOut()
            $('.inprogress-count').text(parseInt($('.inprogress-count').text()) - 1)
            $('#user-id').val('')

            cardTooltip.hideDelay(2000).showSuccess('Picking encerrado com sucesso.')
          } else {
            setTimeout(function () {
              openPrintPickingSale(response)
              window.location.reload()
            }, 1000)

            cardTooltip.hideDelay(2000).showInfo('Aguardando impressão do pedido')
          }
        }

        var onError = function (error) {
          var l = error.responseText.length * 20
          var showDelay = 1000 + l

          cardTooltip.showError(error.responseText)

          $('#user-id').select()
        }

        _get('/picking/sale', {
          userid: code
        },
        onSucess,
        onError)
      }
    }
  })

  $('.inprogress-item').click(function () {
    var saleNumber = $(this).data('sale').split('-')[1]
    var sale = getInProgressSale(saleNumber)
    loadSale(sale)
    $('#user-id').focus()
  })

  cardTooltip = new Tooltip('#card-tooltip', 'Vamos trabalhar?')
  cardTooltip.autoHide(10000).returnDefault(true).load()

  $('#select-uf').click(function () {
    new MultiSelectorDialog('Selecione os Estados', ufList, 'uf', selectedUfs, userSetts[9] != undefined, true)
      .show()
  })

  $('#select-transp').click(function () {
    new MultiSelectorDialog('Selecione as Transportadoras', transportList, 'transp', selectedTransps, userSetts[9] != undefined, true)
      .show()
  })

  $('#more-options').click(function () {
    new MultiSelectorDialog('Selecione outras opções', filters, 'filters', selectedFilters, userSetts[9] != undefined)
      .setVerticalDispay(true)
      .show()
  })

  $('#sort-options').click(function () {
    new MultiSelectorDialog('Selecione a Ordenação', sorterList, 'sort', sortSelected, userSetts[9] != undefined, false, true)
      .setVerticalDispay(true)
      .show()
  })

  $(".blocked-sale-label[data-reason='994']").dblclick(function () {
    window.open(
      '/product/page?sku=' + $(this).text(),
      '_blank' // <- This is what makes it open in a new window.
    )
  })

  Dropdown.on($('.upcoming-dots'))
    .item('/img/restart.png', 'Recarregar', (helper) => {
      helper.loading()
      _post('/picking/reload', { ref: 'picking' }, (data) => {
        window.location.reload()
      })
    })
    .item('/img/back.png', 'Separar Novamente', (helper) => {
      helper.loading()
      _post('/picking/reload', { ref: 'picking', ignoreDone: true }, (data) => {
        window.location.reload()
      })
    })

  Dropdown.on($('.blocked-dots'))
    .item('/img/recycle.png', 'Reciclar Todos', (helper) => {
      $('.table-sale-blocked-holder.not-blocking').each(function () {
        new BlockedPost($(this).data('blocknumber')).call()
      })
    })
    .item('/img/delete-all.png', 'Remover Todos', () => {
      $('.table-sale-blocked-holder').each(function () {
        new BlockedPost($(this).data('blocknumber')).call()
      })
    })

  window.setInterval(function () {
    $('.inprogress-begin').each(function (index, item) {
      var diftime = parseInt($(item).attr('diftime'))
      diftime += 1000

      if (diftime > 0) {
        $(item).text((diftime / 1000).toString().toMMSS())
      }

      $(item).attr('diftime', diftime)
    })
  }, 1000)

  $('#blocked-rule-input').on('keyup', function (e) {
    var key = e.which
    if (key == 13) {
      var blockNumber = $('#blocked-rule-input').val().trim()

      if (blockNumber.length > 3) {
        if ($('.blocked-rules-holder').find("[data-blocknumber='" + blockNumber + "']").length > 0) {
          $('#blocked-rule-input').val('')
          var placeHolder = $('#blocked-rule-input').attr('placeholder')

          $('#blocked-rule-input').attr('placeholder', 'O Código ' + blockNumber + ' já está bloqueado').delay(3000).queue(function (n) {
            $('#blocked-rule-input').attr('placeholder', placeHolder)
          })
        } else {
          new BlockedSelector().onSelect((reason) => {
            new BlockedPost(blockNumber, reason).call()
          }).show()
        }
      }
    }
  })

  $('.blocked-reason').each(function (index, item) {
    var reason = $(this).data('reason')
    reason = new BlockedSelector().get(reason)
    $(this).attr('src', reason.icon ? reason.icon : '/img/question-mark.png')
      .attr('title', reason.label ? reason.label : 'Indefinido')
  })

  $('.pending-button').click(function () {
    if (checkIsLocalFilled(true)) {
      _post('/pending/start', {
        pendingSale: selectedPendingSale,
        local: $('#pending-local').val()
      },
      null,
      (error) => {
        cardTooltip.showError(error.responseText)
      })
    }
  })

  if (userSetts[11] != undefined) {
    $('.table-sale-blocked-holder td').each((index, each) => {
      var blockNumber = $('.table-sale-blocked-holder').data('blocknumber')

      Dropdown.on(each, false)
        .item('/img/delete.png', 'Remover', () => {
          new BlockedPost(blockNumber).call()
        }).bindMousePos()
    })
  }

  $('.done-sale-item').each((index, each) => {
    var saleId = $(each).data('saleid').split('-')[1]
    var sale = $(each).data('sale').split('-')[1]

    var drop = Dropdown.on(each, false).bindMousePos()

    // drop.setMenuPosAdjust(0, -90);

    drop.item('/img/print.png', 'Imprimir', () => {
      openPrintPickingSale(sale, loggedUser.id)
    })
    if (userSetts[12] != undefined) {
      drop.item('/img/back.png', 'Reseparar', () => {
        doneSaleRestart(sale)
      })
    }

    drop.onMouseLeave(() => {
      $('#user-id').focus()
    })
  })
})

function getInProgressSale (number) {
  for (var key in inprogress) {
    if (inprogress.hasOwnProperty(key)) {
      if (inprogress[key].numeroPedido === number) {
        return inprogress[key]
      }
    }
  }
}

function doneSaleRestart (saleNumber) {
  _post('/picking/done-restart', {
    sale: saleNumber
  }, null, (error) => {
    cardTooltip.showError(error.responseText)
  })
}

var selectedPendingSale

function loadSale (sale) {
  if ((selectedPendingSale != sale) || !$('.opened-sale-box').is(':visible')) {
    $('.opened-sale-box').css('display', 'inline-block').fadeIn(200)

    selectedPendingSale = sale
    $('.sale-number').text(' ' + sale.numeroPedido + ' ')
    $('#sale-transport').text(sale.transport)
    $('#sale-date').text(Dat.format(new Date(sale.data)))
    $('#sale-itens').text(sale.itemsQuantity + ' Itens')
    $('#sale-value').text(Num.money(sale.totalProdutos))

    $('#opened-sale').find('.row-padding').remove()
    sale.items.forEach(item => {
      var row = $('<tr>').addClass('row-padding')

      item.quantidade = parseInt(item.quantidade)

      row.append($('<td>').append(buildProductFirstCol(item, true)))
      row.append($('<td>').append(buildProductSecondCol(item, true)))
      row.append($('<td>').append(buildProductThirdCol(item)))
      row.append($('<td>').append(buildProductFourthCol(item)))

      $('#opened-sale').append(row)
      row.hide().fadeIn()
    })

    $('.obs-sale').remove()
    $('#opened-sale').parent().append($('<span>').addClass('obs-sale').append(sale.observacaoInterna))
  } else {
    $('.opened-sale-box').fadeOut(200)
  }
}

function isNum (v) {
  return /^\d+$/.test(v)
}

function checkIsLocalFilled (shake) {
  var isFilled = $('#pending-local').val().length > 0

  if (shake && !isFilled) {
    $('#pending-local').shake({
      interval: 80,
      distance: 8,
      times: 4
    })

    onInputError($('#pending-local'))
  }

  return isFilled
}

function openPrintPickingSale (sale, userId) {
  var url = '/picking/print-sale?userId=[U]&saleNumber=[S]'

  if (userId) {
    url = url.replace('[U]', userId.toString().trim()).replace('[S]', sale)
  } else {
    url = url.replace('[U]', sale.pickUser.id).replace('[S]', sale.numeroPedido)
  }

  window.open(url, '_blank')
}

function startListeningRFID () {
  $('.rfid-card').attr('src', '/img/rfid-listening.gif')
  $('#user-id').select()

  if (!$('#user-id').is(':focus')) {
    $('#user-id').focus()
  }
}

function stopListeningRFID () {
  $('.rfid-card').attr('src', '/img/rfid-wait.png')
}
