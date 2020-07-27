$(document).ready(() => {
  $('.f-icon').click(function (e) {
    $(this).attr('src', 'img/loader/circle.svg')
    var sku = $(this).data('sku')

    _post('/diagnostics/check', { sku: sku }, (data) => {
      var type = $(this).data('type')
      var obj = data.find((item) => { return item.sku === sku })

      var fixed = !obj || !obj.fixes.map((fix) => { return fix.name.includes(type) })

      if (fixed) {
        $(this).attr('src', 'img/checked.png')
        $(this).unbind('click')
        $(this).removeClass('fix').addClass('fixed')
      } else {
        $(this).attr('src', 'img/restart-error.png')
      }

      // $('.menu-dots .dots-glyph').attr('src', 'img/dots.png');

      if ($('.f-icon.fix').length === 0) {
        $('.sku-fixes-modal').delay(500).fadeOut(400, () => {
          $('.sku-fixes-modal').trigger('click')
          $(".row-item[data-sku='" + sku.split('-')[0] + "']").fadeOut(600)
        })
      }
    })

    e.stopPropagation()
  })

  $('.fixes-sku-list.copiable').dblclick(function (e) {
    e.stopPropagation()
    window.open('/product/page?sku=' + $(this).text(), '_blank')
  })

  Dropdown.on($('.no-problem-menu'))
    .item('/img/restart.png', 'Verificar Agora', (helper) => {
      $('.loading-circle').show()
      helper.loading()
      _post('/diagnostics/check', { sku: helper?.data?.sku, forceFather: true }, (data) => {
        $('.sku-fixes-modal').trigger('click')
        showSkuFixesDialog(helper.data.sku)
      })
    })

  var done = (sku) => {
    $('.sku-fixes-modal').trigger('click')
    $(".row-item[data-sku='" + sku.split('-')[0] + "']").fadeOut(600)
  }

  Dropdown.on($('.menu-dots'))
    .item('/img/restart-plus.png', 'Checar Todos', () => {
      $('.f-icon').trigger('click')
    })
    .item('/img/delete.png', 'Remover', (helper) => {
      helper.loading()
      _post('/diagnostics/remove', { sku: helper.data.sku }, (data) => {
        done(helper.data.sku)
      })
    })
    .item('/img/block.png', 'Inativar', (helper) => {
      helper.loading()

      _post('/diagnostics/remove', { sku: helper.data.sku }, (data) => {
        done(helper.data.sku)
      })

      _post('/product/active', {
        sku: helper.data.sku,
        active: false,
        user: loggedUser
      }, (data) => {

      })
    })
})
