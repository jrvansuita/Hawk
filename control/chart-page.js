$(document).ready(function() {


  $('.grow-bar').each(function() {
    $(this).animate({
      height: $(this).attr('data-height')
    }, 600);
  });

  bindDateRangePickers(function(from, to) {
    window.location = window.location.pathname + '?from=' + from + "&to=" + to;
  });

});
