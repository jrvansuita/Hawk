
var fontColorPicker
var fontShadowColorPicker
var discountFontColorPicker
var discountFontShadowColorPicker
var discountBackgroundColorPicker
var discountBackgroundShadowColorPicker

var disableColor = '#e4e4e4'

var refreshBroadcast

$(document).ready(() => {
  fontColorPicker = createColorPicker('font-color', selected.fontColor)
  fontShadowColorPicker = createColorPicker('font-shadow-color', selected.fontShadowColor)
  discountFontColorPicker = createColorPicker('discount-font-color', selected.discountFontColor)
  discountFontShadowColorPicker = createColorPicker('discount-font-shadow-color', selected.discountShadowColor)
  discountBackgroundColorPicker = createColorPicker('discount-background-color', selected.discountBackground)
  discountBackgroundShadowColorPicker = createColorPicker('discount-background-shadow-color', selected.discountBackgroundShadow)

  refreshBroadcast = new Broadcast('refresh-mockup').onReceive(onRefreshPreview)

  $('.save-button').click(saveClick)

  new ComboBox($('#font'), fontsArr)
    .setAutoShowOptions().load()

  new ComboBox($('#font-discount'), fontsArr)
    .setAutoShowOptions().load()

  updateSizeHint()

  $('.mock-img-edit').click(() => {
    $('#mock-input-file').trigger('click')
  })

  $('.back-img-edit').click(() => {
    $('#back-input-file').trigger('click')
  })

  $('#width').change((event) => {
    updateSizeHint()
  })

  $('#keep-creative-color').click(function (event) {
    if ($(this).is(':checked')) {
      discountBackgroundColorPicker.setColor(disableColor)
      discountBackgroundColorPicker.disable()
    } else {
      discountBackgroundColorPicker.enable()
    }
  })

  $('#mock-input-file').change(function (event) {
    loadImageResource(this, event)
  })

  $('#back-input-file').change(function (event) {
    loadImageResource(this, event)
  })

  $('#search-sku').on('keyup', function (e) {
    var key = e.which
    if (key === 13) {
      callRefreshBroadcast()
    }
  })

  $('.each-all').click(function () {
    window.location = '/mockup/builder?_id=' + $(this).data('id')
  })

  $('.add-new').click(() => {
    selected = {}
    selected._id = ''
    $('.settings-box').find('input').val('')
    $('.settings-box').find('input').prop('checked', false)

    $('.mock-img-select').hide()
    $('.back-img-select').hide()
  })

  setTimeout(() => {
    callRefreshBroadcast()
  }, 100)
})

function callRefreshBroadcast () {
  $('.refresh-product').attr('src', '/img/loader/circle.svg')
  $('.search-sku-holder > label').text('Carregando...')
  refreshBroadcast.emit(getRefreshData())
}

function loadImageResource (el, event) {
  var selectedFile = event.target.files[0]
  var reader = new FileReader()
  var icon = $('.' + $(el).data('icon'))
  var target = $('.' + $(el).data('target'))
  var attr = $(el).data('attr')

  icon.attr('src', 'img/loader/circle.svg')
  reader.onload = function (event) {
    _postImg('/image/upload-base64', { base64: event.target.result.split(',')[1] }, (data) => {
      selected[attr] = data.link
      target.attr('src', event.target.result)
      icon.attr('src', 'img/img-edit.png')
    })
  }

  reader.readAsDataURL(selectedFile)
}

function saveClick () {
  if (checkFields()) {
    save()
  }
}

function checkFields () {
  var c = checkMaterialInput($('#font'))
  c = checkMaterialInput($('#widthMock')) & c
  c = checkMaterialInput($('#heightMock')) & c
  c = checkMaterialInput($('#name')) & c
  c = checkMaterialInput($('#widthProduct')) & c
  c = checkMaterialInput($('#heightProduct')) & c

  return c
}

function onRefreshPreview (imageData) {
  $('.refresh-product').attr('src', '/img/refresh.png')
  $('.search-sku-holder > label').text('Testar Produto')
  $('.refresh-product').click(() => {
    callRefreshBroadcast()
  })

  $('.mock-preview').attr('src', imageData)
  $('.mock-preview').show()
}

function save () {
  _post('mockup-builder', getData(), (mockId) => {
    window.location = 'mockup-builder?_id=' + mockId
  }, (error, message) => {
    console.log(error)
  })
}

function getData () {
  return {
    _id: selected._id,
    name: $('#name').val(),
    fontName: $('#font').val(),
    fontNameDiscount: $('#font-discount').val(),
    mockurl: selected.imgUrl,
    backurl: selected.backUrl,
    msg: $('#msg').val(),
    fontColor: fontColorPicker.getSelectedColor().toHEXA().toString(),
    fontShadowColor: fontShadowColorPicker.getSelectedColor().toHEXA().toString(),
    priceBottomMargin: $('#price-bottom-margin').val() || 0,
    showDiscount: $('#discount-active').is(':checked'),
    discountFontColor: discountFontColorPicker.getSelectedColor().toHEXA().toString(),
    discountShadowColor: discountFontShadowColorPicker.getSelectedColor().toHEXA().toString(),
    discountBackground: $('#keep-creative-color').is(':checked') ? 'none' : discountBackgroundColorPicker.getSelectedColor().toHEXA().toString(),
    discountBackgroundShadow: discountBackgroundShadowColorPicker.getSelectedColor().toHEXA().toString(),
    width: Num.def($('#widthMock').val()),
    height: Num.def($('#heightMock').val()),
    widthProduct: Num.def($('#widthProduct').val()),
    heightProduct: Num.def($('#heightProduct').val()),
    productImgMargins: $('#product-img-margins').val() || null
  }
}

function getRefreshData () {
  return { sku: $('#search-sku').val(), params: getData() }
}

function createColorPicker (el, defColor) {
  // Simple example, see optional options for more configuration.
  return Pickr.create({
    el: '.' + el,
    theme: 'nano',
    strings: {
      save: 'Salvar'
    },
    disabled: defColor === 'none',
    default: defColor === 'none' ? disableColor : defColor,
    swatches: [
      'rgba(244, 67, 54, 1)',
      'rgba(233, 30, 99, 0.95)',
      'rgba(156, 39, 176, 0.9)',
      'rgba(103, 58, 183, 0.85)',
      'rgba(63, 81, 181, 0.8)',
      'rgba(33, 150, 243, 0.75)',
      'rgba(3, 169, 244, 0.7)',
      'rgba(0, 188, 212, 0.7)',
      'rgba(0, 150, 136, 0.75)',
      'rgba(76, 175, 80, 0.8)',
      'rgba(139, 195, 74, 0.85)',
      'rgba(205, 220, 57, 0.9)',
      'rgba(255, 235, 59, 0.95)',
      'rgba(255, 193, 7, 1)'
    ],

    components: {
      preview: true,
      opacity: true,

      interaction: {
        input: true,
        save: true
      }
    }
  })
}

var fontsArr = ['Varela Round', 'Verdana', 'Roboto', 'Lato', 'Fira Sans', 'Mansalva', 'Turret Road']

function updateSizeHint () {
  $('.size-hint').text('Imagem: ' + Num.def($('#width').val()) + 'x20%')
}
