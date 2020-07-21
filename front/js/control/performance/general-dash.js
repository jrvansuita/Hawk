var rangeDatePicker = null
var tagsHandler

$(document).ready(() => {
  var queryId = new URLSearchParams(location.search).get('id')
  tagsHandler = new TagsHandler()

  rangeDatePicker = new RangeDatePicker()
  rangeDatePicker.holder('.date-filter-holder')
    .setTitles('Data de Início', 'Data de Fim')
    .setPos()
    .load()
    .then(() => {
      if (!queryId) {
        onSearchData()
      }
    })

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

  $('.arrow-order').click(function () {
    $(this).toggleClass('arrow-asc')
    $('.skus-grid').remove()
    buildSkusBox(window.data)
    bindTooltipManufacturer()
  })
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

function setUrlId (id) {
  if (window.history.replaceState) {
    window.history.replaceState('Data', null, location.pathname + '?id=' + id)
  }
}

function setAttrsAndValue (value, attrs) {
  tagsHandler.placeAll(attrs)
  $('#search-input').val(value)
}
