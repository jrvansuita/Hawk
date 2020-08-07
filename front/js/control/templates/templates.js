var editor
var usagesSelector
var tooltips

$(document).ready(() => {
  new Tooltip('.active-circle', 'Template em uso')
    .autoHide(10000).load().then((data) => {
      tooltips = data
    })

  if (templateType == 'email' && Object.keys(usages).length) {
    new ComboBox($('#template-usage'), usages)
      .setAutoShowOptions()
      .setDisabledCaption('Nenhum disponível')
      .setOnItemBuild((o, index) => {
        return { text: o.val.name, img: '/img/' + o.val.icon + '.png' }
      })
      .load().then((binder) => {
        usagesSelector = binder

        if (selected) {
          usagesSelector.selectByFilter((each) => {
            return each.data.key == selected.usage
          })
        }
      })
  }

  new TemplateEditor()
    .useImageUploader()
    .useQuickInsert(true)
    .load('#editor').then((_editor) => {
      window.editor = _editor

      if (selected) {
        editor.html.set(selected.content)
      }
    })

  $('.save').click(() => {
    saveClick()
  })

  $('.each-line').click(function () {
    goTo($(this).data('id'))
  })

  openOptionsMenu()

  $('.add-new').click(() => {
    goTo(null)
  })
  codeHtmlArea()
})

function saveClick () {
  if (checkFields()) {
    save()
  }
}

function checkFields () {
  return checkMaterialInput($('#name'))
}

function getUsage () {
  return (usagesSelector && usagesSelector.getSelectedItem() && $('#template-usage').val()) ? usagesSelector.getSelectedItem().data.key : ''
}

function save () {
  var data = {
    id: selected.id,
    name: $('#name').val(),
    subject: $('#subject').val(),
    content: $('#temp-text').val() ? $('#temp-text').val() : editor.html.get(),
    usage: getUsage(),
    type: templateType
  }

  _post('/templates', data, (id) => {
    goTo(id)
  }, (error, message) => {
    console.log(error)
  })
}

function openOptionsMenu (line, e) {
  $('.icon-dots').each((index, each) => {
    Dropdown.on(each)
      .item('../img/not-visible.png', 'Visualizar', (helper) => {
        window.open('viewer?id=' + helper.data.id, '_blank')
      })
      .item('../img/duplicate.png', 'Duplicar', (helper) => {
        duplicateItem(helper.data.id)
      })
      .item('../img/delete.png', 'Excluir', (helper) => {
        if (checkCanDelete(helper.data.id)) {
          deleteItem(helper.data.id)
        }
      })
  })
}

function codeHtmlArea() {
  var textArea = $('<textarea>').attr('id', 'temp-text').addClass('text-insert shadow closed')
  $('.main-bottom').append(textArea)

  // var coder = $('<label>').attr('id', 'coding').addClass('flickers')
  // var closed = textArea.hasClass('closed')
  textArea.val(window.selected.content)

  menuEditor()
}

function menuEditor() {
  Dropdown.on('.code-mode', true, true)
  .item('https://i.imgur.com/5PjyYg6.png', 'Editor HTML', (helper) => {
      // $('.main-bottom').append(coder.text('Codifing...'), textArea.toggleClass('closed'))
      $('#editor').hide()
      $('#temp-text').show()
  }).setOnDynamicShow(() => {
    return { 1: $('#texp-text').css('display') === 'none' }
  })
  .item('https://i.imgur.com/w4PtW3K.jpg', 'Froala Editor', (helper) => {
    $('#editor').show()
    $('#temp-text').hide()
  }).setOnDynamicShow(() => {
    return { 1: $('#editor').css('display') === 'none' }
  })
}

function checkCanDelete (id) {
  var el = $(".each-line[data-id='" + id + "']").find('.active-circle')

  if (el.length) {
    var tooltip = tooltips.find((e) => {
      return e.reference == el[0]
    })

    tooltip.show()

    return false
  }

  return true
}

function deleteItem (id) {
  _post('/templates/delete', { id: id }, () => {
    var line = $(".each-line[data-id='" + id + "']")
    line.fadeOut(200, () => {
      line.remove()
    })
  })
}

function duplicateItem (id) {
  _post('/templates/duplicate', { id: id }, (data) => {
    goTo(data.id)
  })
}

function goTo (id) {
  window.location = location.pathname + (id ? '?id=' + id : '')
}
