var dateBeginPicker = null
var dateEndPicker = null
var tagsHandler

$(document).ready(() => {
  var queryId = new URLSearchParams(location.search).get('id')
  tagsHandler = new TagsHandler()

  dateBeginPicker = new DatePicker()

  dateBeginPicker.holder('.date-begin-holder', true)
    .setOnChange((formatedDate, date) => {
      $('#date-begin').val(formatedDate)
      dateEquilizer(true, date, dateEndPicker.getSelected())
    })
    .load()

  dateEndPicker = new DatePicker()

  dateEndPicker.holder('.date-end-holder', true)
    .setOnChange((formatedDate, date) => {
      $('#date-end').val(formatedDate)
      dateEquilizer(false, dateBeginPicker.getSelected(), date)
    })
    .load().then(() => {
      if (!queryId) {
        onSearchData()
      }
    })

  bindDateUtils()

  $('#search-input').on('keyup', function (e) {
    if (e.which == 13) {
      $('#search-button').trigger('click')
    }
  })

  $('#search-button').click(() => {
    onSearchData()
  })

  $('.button').on('keyup', function (e) {
    if (e.which == 13) {
      $(this).click()
    }
  })

  $('.icon-open').click(() => {
    tagsHandler.toggleTagBox()
  })

  if (queryId) {
    onSearchData(queryId)
  }
})

function coloringData () {
  $('.coloring-data').each((i, each) => {
    var perc = $(each).data('cur') / $(each).data('max')
    perc = perc < 0.1 ? 0.1 : perc
    $(each).css('background-color', 'rgba(211, 211, 211, x)'.replace('x', perc))
  })
}

function loadingPattern (isLoading) {
  if (isLoading) {
    $('.icon-open').attr('src', '/img/loader/circle.svg')
  } else {
    $('.no-data').hide()
    $('.content-grid').empty()

    setTimeout(() => {
      $('.icon-open').attr('src', '/img/arrow-down.png')
    }, 400)
  }
}

function setDates (begin, end, delay) {
  begin = typeof begin === 'number' ? new Date(parseInt(begin)) : begin
  end = typeof end === 'number' ? new Date(parseInt(end)) : end

  $('#date-begin').val(Dat.format(begin))
  $('#date-end').val(Dat.format(end))

  var changePicker = () => {
    dateBeginPicker.setSelected(begin)
    dateEndPicker.setSelected(end)
  }

  if (delay <= 0) {
    changePicker()
  } else {
    setTimeout(changePicker, delay || 500)
  }
}

function setUrlId (id) {
  if (window.history.replaceState) {
    window.history.replaceState('Data', null, location.pathname + '?id=' + id)
  }
}

function setAttrsAndValue (value, attrs) {
  tagsHandler.placeAll(attrs)
  $('#search-input').val(value)
}

function getDateVal (id, dateEl) {
  return dateEl.getSelected() && $('#' + id).val() ? dateEl.getSelected().getTime() : undefined
}

function dateEquilizer (tog, begin, end) {
  if (begin && end) {
    if (tog && begin.getTime() > end.getTime()) {
      setDates(begin, begin, 0)
    } else if (!tog && end.getTime() < begin.getTime()) {
      setDates(end, end, 0)
    }
  }
}

function bindDateUtils () {
  $('.left-arrow').click(() => {
    setDates(Dat.rollDay(dateBeginPicker.getSelected(), -1), Dat.rollDay(dateEndPicker.getSelected(), -1), 0)
  })

  $('.right-arrow').click(() => {
    setDates(Dat.rollDay(dateBeginPicker.getSelected(), 1), Dat.rollDay(dateEndPicker.getSelected(), 1), 0)
  })

  Dropdown.on($('.date-menu-dots'))
    .item(null, 'Hoje', () => {
      setDates(Dat.today(), Dat.today(), 0)
    })
    .item(null, 'Ontem', () => {
      setDates(Dat.yesterday(), Dat.yesterday(), 0)
    })
    .item(null, 'Essa Semana', () => {
      setDates(Dat.firstDayCurrentWeek(), Dat.lastDayCurrentWeek(), 0)
    })
    .item(null, 'Última Semana', () => {
      setDates(Dat.firstDayLastWeek(), Dat.lastDayLastWeek(), 0)
    })
    .item(null, 'Este Mês', () => {
      setDates(Dat.firstDayOfMonth(), Dat.lastDayOfMonth(), 0)
    })
    .item(null, 'Último Mês', () => {
      setDates(Dat.firstDayOfLastMonth(), Dat.lastDayOfLastMonth(), 0)
    })
}
