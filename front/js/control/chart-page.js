$(document).ready(function() {


  $('.grow-bar').each(function() {
    $(this).animate({
      height: $(this).attr('data-height')
    }, 600);
  });

  bindDateRangePickers(function(from, to) {
    var href =  window.location.href;

    if (href.includes('from')){
      href = href.replace(/from=\d{0,}/mg,'from=' + from);
      href = href.replace(/to=\d{0,}/mg,'to=' + to);
    }else{
      href = href + par(href) + 'from=' + from + '&to=' + to;
    }

    window.location = href;
  });

});

function par(str){
  return str.includes('?') ? '&' : '?';
}
