$(document).ready(() => {
  $('.job-item-menu').each((index, each) => {
    var active = $(this).data('active')
    var drop = Dropdown.on(each)

    if (active || loggedUser.full) {
      drop.item('/img/play.png', 'Executar', (helper) => {
        _post('  /job-run-force', { id: helper.data.id })
      })
    }
    drop.item('/img/gear.png', 'Editar', (helper) => {
      window.location = '/job-registering?id=' + helper.data.id
    })
      .item('/img/registering.png', 'Log', (helper) => {
        window.location = '/history?tag=' + helper.data.tag
      })
  })
})
