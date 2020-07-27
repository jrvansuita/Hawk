$(document).ready(() => {
  $('.users-table tr').click(function (e) {
    e.stopPropagation()
    window.open('/user/registering?userId=' + $(this).data('userid'), '_blank')
  })

  $('.icon-dots').each((index, each) => {
    var id = $(each).data('userid')
    var active = $(each).data('active')
    var lineTr = $(each).parents().get(1)
    var tdS = $(lineTr).children().get(6)

    Dropdown.on(each).item('/img/' + (active ? 'block' : 'checked') + '.png', active ? 'Inativar' : 'Ativar', (helper) => {
      _post('/user/active', { userId: id, active: !active }, () => {
        $(lineTr).toggleClass('active-row').toggleClass('inactive-row')
        active ? $(tdS).text('Inativo') : $(tdS).text('Ativo'), $(lineTr).fadeOut('slow')
      })
    }).item('/img/delete.png', 'Excluir', function (e) {
      _post('/user/delete', { id: id }, () => {
        $(lineTr).fadeOut('slow')
      })
    })
  })
})
