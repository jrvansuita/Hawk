$(document).ready(() => {
  imageClickOpen()
  $('#search').focusin(function () {
    $('#search').select()
  })

  $('#lock-icon').click(() => {
    onLockClick()
  })

  $('#lock-user-id').on('keyup', function (e) {
    if (e.which == 13) {
      loadUserLockAuth()
    }
  })

  requestProductChilds()
  prepareAutoComplete()

  $('#search').on('keyup', function (e) {
    if (e.which == 13) {
      findCurrentProduct()
    }
  })

  $('.print-local').click(() => {
    if (lastSelected) {
      window.open('/product-print-locals?sku=' + lastSelected, '_blank')
    }
  })
})

function makeMenu () {
  var active = product.situacao == 'A'

  Dropdown.on($('.main-menu-dots'))
    .item('/img/' + (active ? 'block' : 'checked') + '.png', active ? 'Inativar' : 'Ativar', () => {
      showLoadingStatus()
      _post('/product-active', {
        sku: product.codigo,
        active: !active,
        user: currentUser
      }, () => {
        window.location.reload()
      })
    }).setOnDynamicShow(() => {
      return { 1: isUnlocked() }
    })
}

function findCurrentProduct () {
  var skuOrEan = $('#search').val()
  if (skuOrEan) {
    var url = window.location.origin + window.location.pathname
    var query

    if (Num.isEan(skuOrEan)) {
      query = '?ean=' + skuOrEan
    } else {
      query = '?sku=' + skuOrEan
    }

    window.location.href = url + query
  }
}

function requestProdutosFixes (callback) {
  _get('/product-fixes', { sku: product.codigo }, (all) => {
    window.fixes = all
    callback(this)
  })
}

function imageClickOpen () {
  $('#image').click(function () {
    $('.expanding-image-modal').show()
  })
  $('.expanding-image-modal').click(function () {
    $('.expanding-image-modal').hide()
  })
}

function requestProductChilds () {
  requestProdutosFixes(() => {
    if (product._Skus) {
      if (product._Skus.length == 0) {
        product._Skus = [{ codigo: product.codigo }]
      }

      var skus = product._Skus.map((e) => {
        return e.codigo
      })

      _get('/product-skus', { skus: skus, order: true }, (childs) => {
        childs.forEach((child) => {
          buildChildSku(product, child)
        })

        onFinishedLoading()
      })
    }
  })
}

function onFinishedLoading () {
  addFooter()
  showOkStatus()
  checkPermissionUser()
}

function showOkStatus () {
  showStatus('/img/checked.png', 3000)
}

function showErrorStatus () {
  showStatus('/img/alert.png', 5000)
}

function showLoadingStatus () {
  showStatus('/img/loader/circle.svg', false)
}

function showStatus (path, delay) {
  var $el = $('.status-icon')

  $el.clearQueue().hide().fadeIn().attr('src', path)

  if (delay > 0) {
    $el.delay(delay).fadeOut()
  } else if (delay == undefined) {
    $el.delay(3000).fadeOut()
  }
}

function buildChildSku (product, child) {
  var estoque = child._Estoque

  var cols = []
  cols.push(buildSkuCol(child))
  cols.push(buildLocalCol(child))
  cols.push(buildStockCol(child))
  cols.push(buildTextCol(estoque.estoqueDisponivel).addClass('available-stock'))
  cols.push(buildTextCol(estoque.estoqueReal - estoque.estoqueDisponivel).addClass('reserved-stock'))
  cols.push(buildWeightCol(child))

  var $options = buildMenuOpt()

  cols.push($options)

  estoqueRealTotal += estoque.estoqueReal
  estoqueDisponivelTotal += estoque.estoqueDisponivel
  estoqueReservadoTotal += estoque.estoqueReal - estoque.estoqueDisponivel

  var $tr = $('<tr>').addClass('tr-child')
  cols.forEach((col) => {
    $tr.append(col)
  })

  paintLineStock($tr, child)

  $('.label-val-title').hide()

  $tr.click(() => {
    $('.selected').removeClass('selected')
    $tr.addClass('selected')
    onChildSelected(child)
  })

  var sel = product.selected.toLowerCase()

  if (sel == child.codigo.toLowerCase() || sel == child.gtin) {
    $tr.addClass('selected')
    $tr.trigger('click')
  }

  var active = child.situacao == 'A'

  Dropdown.on($options)
    .item('/img/barcode.png', 'Imprimir Etiqueta', () => {
      window.open('/barcode?sku=' + child.codigo, '_blank')
    })
    .item('/img/' + (active ? 'block' : 'checked') + '.png', active ? 'Inativar' : 'Ativar', () => {
      showLoadingStatus()
      _post('/product-active', {
        sku: child.codigo,
        active: !active,
        user: currentUser,
        forceSingle: true
      }, () => {
        window.location.reload()
      })
    })
    .setOnDynamicShow(() => {
      return { 1: isUnlocked() }
    }).bindMousePos()

  $('#child-skus-holder').append($tr)
}

function buildLocalCol (product) {
  var $valElement = buildInput(product.localizacao, 14)

  bindEvents($valElement, true)

  $valElement.focusout(function () {
    if (currentUser) {
      if ($(this).val() && $(this).val().trim() !== $(this).data('value').toString().trim()) {
        showLoadingStatus()

        var requestBody = {
          sku: product.codigo,
          local: $(this).val(),
          user: currentUser
        }

        _post('/product-local', requestBody, (res) => {
          handleInputUpdate($(this), res, $(this).val())
        })
      }
    }
  })

  return buildCol($valElement)
}

function buildStockCol (product) {
  var $valElement = buildInput(product._Estoque.estoqueReal, 7)

  $valElement.attr('onkeypress', 'return Num.isNumberKey(event);').attr('maxlenght', '5')

  bindEvents($valElement, true, true)

  $valElement.change(function () {
    if (currentUser) {
      if ($(this).val()) {
        showLoadingStatus()
        var val = parseInt($(this).val())

        var requestBody = {
          sku: product.codigo,
          stock: val,
          user: currentUser
        }

        _post('/product-stock', requestBody, (res) => {
          handleInputUpdate($(this), res, parseInt($(this).data('value')) + val)

          var $disp = $(this).closest('tr').find('.available-stock .child-value')

          $disp.text(parseInt($disp.text()) + val)
        })
      }
    }
  })

  return buildCol($valElement)
}

function buildWeightCol (product) {
  var $valElement = buildInput(Floa.weight(product.pesoLiq), 15)

  $valElement.attr('onkeypress', 'return Floa.isFloatKey(event);').attr('maxlenght', '6')

  bindEvents($valElement, true, true)

  $valElement.change(function () {
    if (currentUser) {
      if ($(this).val()) {
        showLoadingStatus()
        var val = Floa.weight(Floa.floa($(this).val()))

        var requestBody = {
          sku: product.codigo,
          weight: val,
          user: currentUser
        }

        _post('/product-weight', requestBody, (res) => {
          handleInputUpdate($(this), res, val)
        })
      }
    }
  })

  return buildCol($valElement)
}

function buildInput (val, canEditPermission) {
  var el = $('<input>').attr('value', val)
    .addClass('child-value editable-input')
    .attr('placeholder', val)
    .data('value', val)
  // Ao abrir a tela os campos de edição são desabilitados
    .attr('disabled', true)

  if ((canEditPermission > 0) && Sett.get(loggedUser, canEditPermission)) {
    el.addClass('can-edit')
  }

  return el
}

function buildTextCol (val) {
  return buildCol($('<label>').addClass('child-value').text(val))
}

function buildImgCol (path, title) {
  var $img = $('<img>').addClass('icon').attr('src', path).attr('title', title)

  return buildCol($img).css('text-align', 'center')
}

function buildMenuOpt () {
  var $menuD = $('<div>').addClass('menu-dots')

  return buildCol($menuD).css('text-align', 'center')
}

function buildCol ($el) {
  return $('<td>').addClass('td-child').append($el)
}

function buildSkuCol (product) {
  var $div = $('<div>').css('display', 'flex')
  var $sku = $('<label>').addClass('child-value child-sku copiable').text(product.codigo)
  var $ean = $('<label>').addClass('child-title child-ean copiable').text(product.gtin)

  $div.append($sku)

  if (fixes) {
    fixes.forEach((item) => {
      if (product.codigo == item.sku && !$div.find('img').length) {
        var $err = $('<img>').addClass('diag-alert').attr('src', 'img/alert.png').show()
        $err.click(() => {
          window.open('/diagnostics?sku=' + product.codigo, '_blank')
        })
        var alertTooltip = new Tooltip($err[0], item.data.name).load()
        $div.append($err)
      }
    })
  }

  var f = function (e) {
    Util.selectContent(this)
    Util.copySeleted()
    e.stopPropagation()
  }

  $sku.click(f)
  $ean.click(f)

  return buildCol([$div, $ean])
}

var estoqueRealTotal = 0
var estoqueDisponivelTotal = 0
var estoqueReservadoTotal = 0

function addFooter () {
  var $tr = $('<tr>').addClass('footer')

  $tr.append(buildCol(''))
  $tr.append(buildCol('Total'))
  $tr.append(buildCol(estoqueRealTotal))
  $tr.append(buildCol(estoqueDisponivelTotal))
  $tr.append(buildCol(estoqueReservadoTotal))
  $tr.append(buildCol('')) // Weight
  $tr.append(buildCol('')) // Options
  $('#child-skus-holder').append($tr)
}

var lastSelected

function onChildSelected (child) {
  if (lastSelected != child.codigo) {
    $('.label-val-title').hide()

    loadObsHistory(child)
    loadStockHistory(child.codigo)
  }

  lastSelected = child.codigo
}

function loadObsHistory (child) {
  $('#local-history').find('tr:gt(0)').remove()
  $('#local-history').hide()

  child.obs.split('\n').forEach((line) => {
    if (line.includes('|')) {
      var lineData = line.split('|')

      var user = lineData[0]
      var platf = lineData[1]
      var data = lineData[2]
      var date = lineData[3]
      var type = lineData[4]

      var $tr = $('<tr>').append(buildTextCol(date),
        buildTextCol(user),
        buildImgCol(platf.includes('Mobile') ? 'img/smartphone.png' : 'img/pc.png', platf),
        buildTextCol(type || 'Localização'),
        buildTextCol(data))

      $('#local-history tr:first').after($tr)
      // $('#local-history').append($tr);
    }
  })

  if ($('#local-history tr').length > 1) {
    $('#local-history').hide().fadeIn()
  }
}

var stockRowsHistoryMemory = {}

function getStockRowsGrouped (childSku, callback) {
  if (!stockRowsHistoryMemory[childSku]) {
    _get('/product-stock-history', { sku: childSku }, (rows) => {
      stockRowsHistoryMemory[childSku] = groupStockRows(rows)
      callback(stockRowsHistoryMemory[childSku])
    })
  } else {
    callback(stockRowsHistoryMemory[childSku])
  }
}

function loadStockHistory (childSku) {
  $('#stock-history').find('tr:gt(0)').remove()
  $('#stock-history').hide()

  getStockRowsGrouped(childSku, (groupped) => {
    loadLayoutHistory(groupped)

    if (Sett.get(loggedUser, 16)) {
      new StockChart('stock-chart', stockRowsHistoryMemory).load()
      $('.chart-label').css('display', 'block').fadeIn()
    }

    $('#stock-history').hide().fadeIn()
    loadSumsStocks()
  })
}

function groupStockRows (rows) {
  var groupArr = {}

  rows.forEach((i) => {
    var user = i.obs.split('-')
    var id = Dat.id(new Date(i.data)) + (i.es == 'S' ? i.es : '') + (user.length > 1 ? user[1].trim() : '') + (i.obs.includes('Desktop') ? '1' : '0')

    if (groupArr[id]) {
      groupArr[id].quantidade += parseInt(i.quantidade)
    } else {
      i.quantidade = parseInt(i.quantidade)
      groupArr[id] = i
    }
  })

  return Object.values(groupArr).sort((a, b) => { return new Date(a.data) - new Date(b.data) })
}

function loadLayoutHistory (rows) {
  rows.forEach((i) => {
    var obs = ''
    var user = i.obs.split('-')
    user = user.length > 1 ? user[1] : '--'

    if (i.idOrigem != '' && i.es == 'S' && i.obs == '') {
      obs = 'Faturamento'
    } else if (i.obs == '' && i.quantidade > 0 && i.tipoEntrada == '') {
      obs = 'Estoque Inicial'
    } else if (i.obs.includes('Lanç') || i.obs.includes('manual')) {
      obs = 'Lançamento'
    } else if (i.es == 'E' && i.tipoEntrada == 'N' && i.idOrigem != '') {
      obs = 'Nf Devolução'
    } else {
      obs = i.obs.split('-')[0]
    }

    var isMobile = i.obs.includes('Mobile')

    var $tr = $('<tr>').append(
      buildTextCol(Dat.format(new Date(i.data))),
      buildTextCol(user),
      buildImgCol(isMobile ? 'img/smartphone.png' : 'img/pc.png', isMobile ? 'Mobile' : 'Desktop'),
      buildTextCol(parseInt(i.quantidade)).addClass('stock-val'),
      buildTextCol(obs))

    if (parseInt(i.quantidade) > 0) {
      $tr.addClass('positive-row')
    } else {
      $tr.addClass('negative-row')
    }

    $('#stock-history tr:first').after($tr)
  })
}

function loadSumsStocks () {
  var totals = ['.positive-row', '.negative-row']

  totals.forEach((item) => {
    var total = $('#stock-history ' + item + ' .stock-val .child-value').map(function () {
      return parseInt($(this).text())
    })
      .get().reduce(function (i, e) {
        return i + e
      }, 0)

    $('.label-val-title' + (item == '.positive-row' ? '.green-wick' : '.red-wick')).text(Math.abs(total))
  })

  $('.label-val-title').show()
}

function isStored (res) {
  try {
    return res && res.result.success.length > 0
  } catch (e) {
    return res && res.success.length > 0
  }
}

function controlStatus ($el, res) {
  if (isStored(res)) {
    showOkStatus()
  } else {
    showErrorStatus()
  }
}

function handleInputUpdate ($el, res, newValue) {
  controlStatus($el, res)

  $el.val(newValue)

  if (isStored(res)) {
    $el.data('value', newValue)
    $el.attr('placeholder', newValue)
  }
}

function bindEvents ($el, blurOnEnter, clearOnFocus) {
  $el.click(function (e) {
    e.stopPropagation()
  })

  if (clearOnFocus) {
    var lastVal = $el.val()

    $el.focusin(function () {
      $(this).val('')
    })

    $el.focusout(function () {
      if ($(this).val() == '') {
        $(this).val(lastVal)
      }
    })
  }

  if (blurOnEnter) {
    $el.keypress(function (e) {
      if (e.which == 13) {
        $el.blur()
      }
    })
  }
}

function paintLineStock (el, child) {
  var stock = child._Estoque
  var hasLocal = child.localizacao.length > 0

  if (child.situacao == 'I') {
    $(el).css('background-color', '#94949463')
  } else {
    if (!hasLocal || (stock.estoqueDisponivel < 0) || parseFloat(child.pesoLiq) == 0) {
      // Red
      $(el).css('background-color', '#ff000026')
      return
    }

    if (stock.estoqueReal < 1) {
      // Yellow
      $(el).css('background-color', '#ffe20038')
    }
  }
}

var currentUser

function isUnlocked () {
  return currentUser != undefined
}

function onLockClick () {
  if (isUnlocked()) {
    initialLockState()
  } else {
    waittingToLock()
  }
}

function loadUserLockAuth () {
  var userAcess = $('#lock-user-id').val()
  if (userAcess) {
    _get('/user?userId=' + userAcess, {}, (user) => {
      unlock(user)
    }, () => {
      errorLock()
    })
  }
}

function initialLockState () {
  $('#lock-icon').hide().attr('src', '/img/lock.png').fadeIn()
  currentUser = undefined
  $('#lock-user-id').val('')
  $('.editable-input').attr('disabled', true)
}

function waittingToLock () {
  $('#lock-icon').hide().attr('src', '/img/lock-loupe.png').fadeIn()
  $('#lock-user-id').select().focus()

  $('#lock-user-id').one('focusout', () => {
    if (!isUnlocked()) {
      initialLockState()
    }
  })
}

function unlock (user) {
  $('#lock-icon').hide().attr('src', '/img/unlocked.png').fadeIn()
  currentUser = user
  $('.editable-input.can-edit').attr('disabled', false)
}

function errorLock () {
  $('#lock-icon').hide().attr('src', '/img/lock-error.png').fadeIn()
  $('#lock-user-id').select().focus()
}

function prepareAutoComplete () {
  var options = {

    url: function (phrase) {
      return '/product-search-autocomplete?typing=' + phrase
    },

    getValue: function (element) {
      return element.sku
    },

    template: {
      type: 'description',
      fields: {
        description: 'name'
      }
    },

    ajaxSettings: {
      dataType: 'json',
      method: 'GET',
      data: {
        dataType: 'json'
      }
    },
    requestDelay: 400,
    list: {
      maxNumberOfElements: 150,
      match: {
        enabled: false
      },
      sort: {
        enabled: true
      },
      onClickEvent: function () {
        findCurrentProduct()
      }
    }
  }

  $('#search').easyAutocomplete(options)
}

function checkPermissionUser () {
  if (Sett.every(loggedUser, [4])) {
    unlock(loggedUser)
    makeMenu()
  }
}
