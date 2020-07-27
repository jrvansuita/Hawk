$(document).ready(() => {
  $('.save').click(() => {
    saveClick()
  })

  $('.each-line').click(function () {
    goTo($(this).data('id'))
  })

  $('.add-new').click(() => {
    goTo(null)
  })

  openOptionsMenu()
  initializeEnumItems()
})

function openOptionsMenu (line, e) {
  $('.icon-dots').each((index, each) => {
    Dropdown.on(each)
      .item('../img/duplicate.png', 'Duplicar', (helper) => {
        duplicateItem(helper.data.id)
      })
      .item('../img/delete.png', 'Excluir', (helper) => {
        deleteItem(helper.data.id)
      })
  })
}

function deleteItem (id) {
  _post('/enum/delete', { id: id }, () => {
    var line = $(".each-line[data-id='" + id + "']")
    line.fadeOut(200, () => {
      line.remove()
      $('.add-new').trigger('click')
    })
  })
}

function duplicateItem (id) {
  _post('/enum/duplicate', { id: id }, (data) => {
    goTo(data.id)
  })
}

function saveClick () {
  if (checkFields()) {
    save()
  }
}

function checkFields () {
  return checkMaterialInput($('#name')) && checkMaterialInput($('#tag'))
}

function save () {
  var data = {
    id: selected.id,
    name: $('#name').val(),
    explanation: $('#explanation').val(),
    tag: $('#tag').val(),
    items: getCurrentItems()
  }

  _post('/enum/enumerators', data, (id) => {
    goTo(id)
  }, (error, message) => {
    console.log(error)
  })
}

function initializeEnumItems () {
  addItem(null, -1, true)

  if (selected?.items?.length) {
    selected.items.reverse().forEach((item, index) => {
      addItem(item, index, false)
    })
  }
}

function addItem (item, index, isIncludingLine) {
  var tds = []
  tds.push(buildDef(item, 'default'))
  tds.push(buildCol(item, 'icon'))
  tds.push(buildCol(item, 'description'))
  tds.push(buildCol(item, 'name'))
  tds.push(buildCol(item, 'value', buildButton(index, isIncludingLine)))
  var line = $('<tr>').append(tds).addClass(isIncludingLine ? 'including' : '')

  if (isIncludingLine) {
    $('.enum-items').append(line)
  } else {
    $('.enum-items tr:nth-child(2)').after(line)
  }
}

function buildCol (item, key, button) {
  var el = $('<input>').attr('value', item?.[key]).attr('data-key', key)
    .addClass('simple-material-input')

  return $('<td>').append($('<span>').addClass('item-span').append(el, button))
}

function buildDef (item, key) {
  var el = item ? $('<img>').attr('src', '/img/cloud-check.png').addClass('default-item').attr('data-key', key).css('display', item[key] ? 'block' : '') : null
  return $('<td>').append(el)
}

function buildButton (index, isIncludingLine) {
  var result

  if (isIncludingLine) {
    result = $('<img>').attr('src', '/img/checked.png')
      .attr('data-index', index)
      .addClass('line-button')
      .click(() => {
        var line = result.closest('tr')
        addItem(getLineItem(line))
        clearValues(line)
      })
  } else {
    result = $('<div>').addClass('line-options')
    Dropdown.on(result).item('/img/delete.png', 'Excluir', function () {
      result.closest('tr').fadeOut(200, function () {
        $(this).remove()
      })
    }).item('/img/cloud-check.png', 'Padrão', function (helper) {
      $('[data-key="default"]').hide()
      getElement(result.closest('tr'), 'default').show()
    })
  }

  return result
}

var itemKeys = ['default', 'icon', 'description', 'name', 'value']

function getCurrentItems () {
  return $('.enum-items tr').not('.title, .including').toArray().reduce((arr, line) => {
    arr.push(getLineItem(line))
    return arr
  }, [])
}

function getLineItem (line) {
  return itemKeys.reduce((object, key) => {
    var e = getElement(line, key)
    object[key] = e.is('input') ? e.val() : e.is(':visible')
    return object
  }, {})
}

function getElement (line, key) {
  return $(line).find('[data-key="' + key + '"]')
}

function clearValues (line) {
  itemKeys.forEach((key) => {
    getElement(line, key).val('')
  })
}

function goTo (id) {
  window.location = location.pathname + (id ? '?id=' + id : '')
}
