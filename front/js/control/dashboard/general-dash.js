
var tagsHandler
var queryId = null

$(document).ready(() => {
  queryId = new URLSearchParams(location.search).get('id')
  tagsHandler = new TagsHandler()

  $('#search-input').on('keyup', function (e) {
    if (e.which == 13) {
      $('#search-button').trigger('click')
    }
  })

  $('#search-button').click(() => {
    onSearchData()
  })

  $('.button').on('keyup', function (e) {
    if (e.which === 13) {
      $(this).click()
    }
  })

  //   $('.icon-open').click(() => {
  //     tagsHandler.toggleTagBox()
  //   })

  if (queryId) {
    onSearchData(queryId)
  }
})

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
