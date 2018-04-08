$(document).ready(function() {

  loadImgFiles('avatar-img', 'data-src');

  $('.grow-bar').each(function() {
    $(this).animate({
      height: $(this).attr('data-height')
    }, 600);
  });

  bindDateRangePickers(function(from, to) {
    window.location = '/invoice/by-date?from=' + from + "&to=" + to;
  });

});