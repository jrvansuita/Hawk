$(document).ready(() => {
  if ($('#packing-chart-current-month').length > 0) {
    _post('/packing/days', { from: Dat.firstDayOfMonth().getTime(), to: Dat.lastDayOfMonth().getTime() }, (data) => {
      new PackingChart('packing-chart-current-month', data, loggedUser.full).load()
    })
  }

  if ($('#packing-chart-last-month').length > 0) {
    _post('/packing/days', { from: Dat.firstDayOfLastMonth().getTime(), to: Dat.lastDayOfLastMonth().getTime(), cache: true }, (data) => {
      new PackingChart('packing-chart-last-month', data, loggedUser.full).load()
    })
  }

  if ($('#packing-chart-year').length > 0) {
    _post('/packing/days', { from: Dat.firstDayOfYear().getTime(), to: Dat.today().getTime(), cache: true }, (data) => {
      new PackingChart('packing-chart-year', data, loggedUser.full, true).load()
    })
  }

  if ($('#packing-chart-last-year').length > 0) {
    _post('/packing/days', { from: Dat.firstDayOfLastYear().getTime(), to: Dat.lastDayOfLastYear().getTime(), cache: true }, (data) => {
      new PackingChart('packing-chart-last-year', data, loggedUser.full, true).load()
    })
  }
})
