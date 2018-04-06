function bindDatePickers() {
  $('<link>')
    .appendTo('head')
    .attr({
      type: 'text/css',
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/gijgo@1.9.6/css/gijgo.min.css'
    });

  $('<link>')
    .appendTo('head')
    .attr({
      type: 'text/css',
      rel: 'stylesheet',
      href: '/css/date-picker.css'
    });


  $.getScript('https://cdn.jsdelivr.net/npm/gijgo@1.9.6/js/gijgo.min.js', function() {

    $('.datepicker').each(function() {
      var $input = $('<input>').addClass('select-date');

      $(this).append($input);

      $(this).click(function(e) {
        $input.open();
      });

      $input.datepicker({
        modal: false,
        header: true,
        footer: true,
        change: function(e) {
          console.log('Change is fired');
        },
        select: function(e, type) {
          console.log(e);
        }
      });
    });
  });

}