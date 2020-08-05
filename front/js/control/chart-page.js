$(document).ready(function () {
  $('.grow-bar').each(function () {
    $(this).animate(
      {
        height: $(this).attr('data-height'),
      },
      600
    );
  });

  // var rangeDatePicker

  // if (showCalendar) {
  //   new RangeDatePicker()
  //     .holder('.chart-date-holder', true)
  //     .showInputs(false)
  //     .menuOptions(false)
  //     .showArrows(false)
  //     .setPos(-315, -90)
  //     .setOnRangeChange((from, to) => {
  //       reloadPage(from, to)
  //     })
  //     .load()
  // }
});

function reloadPage(from, to) {
  console.log(from);
  console.log(to);

  from = from.getTime();
  to = to.getTime();

  var href = window.location.href;

  if (href.includes('from')) {
    href = href.replace(/from=\d{0,}/gm, 'from=' + from);
    href = href.replace(/to=\d{0,}/gm, 'to=' + to);
  } else {
    href = href + par(href) + 'from=' + from + '&to=' + to;
  }

  window.location = href;
}

function par(str) {
  return str.includes('?') ? '&' : '?';
}
