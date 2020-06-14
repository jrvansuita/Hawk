$(document).ready(() => {
  $('.line-item.clickable, .box-item.clickable').click(function () {
    var attrValue = {}
    attrValue[$(this).data('attr')] = $(this).data('value').toString().replace(/\,/g, '|')

    _post('/product-list', {
      query:
      {
        attrs:
        attrValue
      }
    }, () => {
      window.location.href = '/product-list'
    })
  })

  new Broadcast('product-board-reset').onReceive((data) => {
    window.location.reload()
  })

  Dropdown.on($('.menu-dots')).item('/img/refresh.png', 'Atualizar', function (helper) {
    helper.loading()
    _post('/product-board-reset', {}, () => { })
  })
})
