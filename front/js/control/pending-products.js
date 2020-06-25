$(document).ready(() => {
  $('.sku.copiable').dblclick(function () {
    window.open(
      '/stock/product?sku=' + $(this).text(),
      '_blank' // <- This is what makes it open in a new window.
    )
  })

  $('.grid-flow').each(function () {
    var childHeight = $(this).children().first().outerHeight()
    var totalHeight = $(this).innerHeight() * 0.95
    var visibleRows = Math.trunc(totalHeight / childHeight)

    var childWidth = $(this).children().first().outerWidth()
    var totalWidth = $(this).closest('.divider').innerWidth()
    var possibleCols = Math.trunc(totalWidth / childWidth)

    var itemsCount = $(this).children().length

    var cols = Math.trunc(itemsCount / visibleRows)
    cols = cols > possibleCols ? possibleCols : cols

    $(this).css('grid-template-columns', 'repeat(' + cols + ', minmax(340px, 1fr))')
  })

  // Block de controle de desenho de layout
  $('.main').width('fit-content')
  // Sem essas linhas, o layout fica desentralizado na tela

  $('.icon-dots').each((index, each) => {
    var drop = Dropdown.on(each)

    if (!$(each).data('father')) {
      drop.item('/img/print.png', 'Localizações', (helper) => {
        console.log(helper)
        window.open('/stock/product-print-locals?sku=' + helper.data.sku, '_blank')
      })
    }

    if ($(each).data('type') == 'block') {
      drop.item('/img/delete.png', 'Desbloquear', (helper) => {
        console.log(helper)
        new BlockedPost(helper.data.sku).call()
      })
    }
  })

  $('.prod-img').each(function (e) {
    new ImagePreview($(this)).hover((self) => {
      _get('/product-image', { sku: $(this).data('sku') }, (product) => {
        self.show(product.image)
      })
    })
  })
})
