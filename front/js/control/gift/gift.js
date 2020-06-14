var expiresDatePicker = null

$(document).ready(() => {
  $('#attr').focusin(() => {
    if ($('#attr').val().length > 0) {
      clearSelectors()
    }
  })

  new ComboBox($('#gift-name'), '/gift-all')
    .setAutoShowOptions(true)
    .setOnItemBuild((item, index) => {
      return { text: item.name }
    })
    .setOnItemSelect((data, item) => {
      window.location = '/gift-rules?id=' + item.id
    }).load()

  expiresDatePicker = new DatePicker()

  expiresDatePicker.holder('.expires-holder', true)
    .setOnChange((formatedDate, date) => {
      $('#expires').val(formatedDate)
      $('#expires').data('date', date)
    })
    .load().then(() => {
      if (selectedGift) {
        expiresDatePicker.setSelected(selectedGift.expiresDate)
        $('#expires').val(Dat.format(new Date(selectedGift.expiresDate)))
      }
    })

  $('#sku').on('keyup', function (e) {
    if (e.which == 13) {
      if ($(this).val()) {
        $('.add-product').trigger('click')
      }
    }
  })

  $('.add-product').click(() => {
    handleProduct($('#sku').val())
  })

  $('#value').on('keyup', function (e) {
    if (e.which == 13) {
      if ($(this).val()) {
        $('.add-cond').trigger('click')
      }
    }
  })

  $('.add-cond').click(() => {
    handleCondition()
  })

  bindRulesAttrsComboBox()

  $('.save').click(() => {
    saveGiftRule()
  })

  $('.delete-button').click(() => {
    deleteGiftRule()
  })

  $('.icon-dots').each((index, each) => {
    Dropdown.on(each)
      .item('../img/delete.png', 'Excluir', (helper) => {
        deleteGiftRule(helper.data.id)
      })
  })

  $('.new-button').click(() => {
    $('input').val('')
    $('input').prop('checked', false)
    $('.skus-box').empty()
    $('.attrs-box').empty()
  })

  $('.each-all').click(function () {
    window.location = '/gift-rules?id=' + $(this).data('id')
  })

  if (selectedGift) {
    selectedGift.skus.forEach((sku) => {
      addProduct(sku)
    })

    selectedGift.rules.forEach((item) => {
      addCondition(item.attr, item.sign, item.val)
    })
  }
})

function getSelectedSkus () {
  return $('.skus-box .toast-item')
    .map(function () {
      return $(this).data('val')
    })
    .get()
}

function handleProduct (sku) {
  if (Arr.notIn(getSelectedSkus(), sku)) {
    _get('/product-child', { sku: sku }, (p) => {
      if (!p) {
        showSkuError('Produto não encontrado!')
      } else if ((p._Estoque.estoqueDisponivel == 0) && $('#checkstock').is(':checked')) {
        showSkuError('Produto sem estoque disponível!')
      } else {
        $('#sku').val('')
        addProduct(p.codigo)
      }
    })
  } else {
    showSkuError('Produto já adicionado!')
  }
}

function addProduct (sku) {
  $('.skus-box').append(getToastItem(sku, sku))
}

function getToastItem (label, data, clazz) {
  var toast = $('<span>').addClass('toast-item').data('val', data).addClass(clazz).text(label)

  if (!clazz) {
    toast.click(() => {
      toast.remove()
    })
  }

  return toast
}

function showSkuError (msg) {
  $('.msg-box-sku').show()
  $('.error-msg-sku').text(msg).delay(4000).queue(function (next) {
    $('.msg-box-sku').hide()
    next()
  })

  $('#sku').val('')
  checkMaterialInput($('#sku'))
}

function showAttrsErros (msg) {
  $('.msg-box-cond').show()
  $('.error-msg-cond').text(msg).delay(4000).queue(function (next) {
    $('.msg-box-cond').hide()
    next()
  })
}

function handleCondition () {
  var c = checkMaterialInput($('#attr'))
  c = checkMaterialInput($('#sign')) & c
  c = checkMaterialInput($('#value')) & c

  if (c) {
    var selectedAttrItem = attrNameSelector.getSelectedItem()
    var selectedConditionItem = conditionsSelector.getSelectedItem()
    var selectedValueItem = valuesSelector ? valuesSelector.getSelectedItem() : null

    var attr = selectedAttrItem ? selectedAttrItem.data.key : $('#attr').val()
    var sign = selectedConditionItem.data.key
    var value = selectedValueItem && selectedValueItem.data ? selectedValueItem.data.key : $('#value').val()

    addCondition(attr, sign, value)
    clearSelectors()
  }
}

function addCondition (attr, sign, value) {
  var label = rulesAttrs[attr] ? rulesAttrs[attr].label : attr
  var signLabel = rulesConditions[sign].label
  var valueLabel = value

  if (rulesAttrs[attr] && rulesAttrs[attr].options) {
    var options = rulesAttrs[attr].options
    if (options.constructor === Object) {
      valueLabel = rulesAttrs[attr].options[value]
    }
  }

  var group = $('<div>').addClass('cond-group')
    .append(getToastItem(label, attr, 'attr'))
    .append(getToastItem(signLabel, sign, 'sign'))
    .append(getToastItem(valueLabel, value, 'value'))

  group.click(() => {
    group.remove()
  })

  $('.attrs-box').append(group)
}

function getSelectedAttrs () {
  var arr = []
  $('.cond-group').each(function () {
    arr.push({
      attr: $(this).find('.attr').data('val'),
      sign: $(this).find('.sign').data('val'),
      val: $(this).find('.value').data('val')
    })
  })

  return arr
}

function saveGiftRule () {
  var c = checkMaterialInput($('#gift-name'))
  c = checkMaterialInput($('#expires')) & c

  if ($('.attrs-box .cond-group').length == 0) {
    showAttrsErros('Nenhum condição foi selecionada!')
    c = false
  }

  if (getSelectedSkus().length == 0) {
    showSkuError('Nenhum produto foi selecionado!')
    c = false
  }

  if (c) {
    _post('/gift-rules', {
      id: $('#id').val(),
      name: $('#gift-name').val(),
      expires: expiresDatePicker.getSelected().getTime(),
      active: $('#active').is(':checked'),
      checkStock: $('#checkstock').is(':checked'),
      sendEmail: $('#send-email').is(':checked'),
      skus: getSelectedSkus(),
      rules: getSelectedAttrs()
    }, (doc) => {
      window.location = '/gift-rules?id=' + doc.id
    })
  }
}

function deleteGiftRule (id) {
  id = id || $('#id').val()

  if (id) {
    _post('/gift-delete', { id: id }, () => {
      window.location = '/gift-rules'
    })
  }
}

var attrNameSelector = null

function bindRulesAttrsComboBox () {
  new ComboBox($('#attr'), rulesAttrs)
    .setOnItemBuild((item, index) => {
      return { text: item.val.label }
    })
    .setAutoShowOptions(true)
    .setOnItemSelect((data, item) => {
      bindValuesComboBox(item.val.options)
      bindRulesConditionsComboBox(item.val.options)
    })
    .load().then(binder => { attrNameSelector = binder })
}

var conditionsSelector = null

function bindRulesConditionsComboBox (options) {
  var filtered = Object.assign({}, rulesConditions)

  Object.entries(rulesConditions).forEach(([key, value]) => {
    if (value.accepts) {
      if (!value.accepts.includes(options)) {
        delete filtered[key]
      }
    } else if (typeof options === 'string') {
      if (options != undefined && value.accepts == undefined) {
        delete filtered[key]
      }
    }
  })

  new ComboBox($('#sign'), filtered)
    .setOnItemBuild((item, index) => {
      return { text: item.val.label }
    })
    .setAutoShowOptions(true)
    .load().then(binder => { conditionsSelector = binder })
}

var valuesSelector = null

function bindValuesComboBox (options) {
  $('#value').removeAttr('onkeypress')

  if (options == 'float') {
    $('#value').attr('onkeypress', 'return Floa.isFloatKey(event);')
  } else if (options == 'integer') {
    $('#value').attr('onkeypress', 'return Num.isNumberKey(event);')
  } else if (options != undefined) {
    new ComboBox($('#value'), options)
      .setAutoShowOptions(true)
      .load().then(binder => { valuesSelector = binder })
  }
}

function clearSelectors () {
  if (attrNameSelector) {
    attrNameSelector.select(null)
  }

  if (conditionsSelector) {
    conditionsSelector.select(null)
    conditionsSelector.remove()
  }

  if (valuesSelector) {
    valuesSelector.select(null)
    valuesSelector.remove()
  }

  $('#attr').val('')
  $('#sign').val('')
  $('#value').val('')
}
