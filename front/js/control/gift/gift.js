var expiresDatePicker = null;

$(document).ready(()=>{

  new DatePicker()
  .onClickOpen('.expires-holder')
  .bind($('#expires'))
  .then(binder => expiresDatePicker = binder);





});


function bindDateRangePickers(onRangeSelected) {
  loadCssFile('/front/css/libs/material-date-picker.min.css');
  loadCssFile('/front/css/libs/date-picker.css');
  loadJsFile('/front/js/libs/material-date-picker.min.js', function() {

    $('.datepicker').each(function() {
      var $inputTo = $('<input>').attr('id', 'select-date-to').addClass('select-date');
      var $inputFrom = $('<input>').attr('id', 'select-date-from').addClass('select-date');

      $(this).append($inputTo).append($inputFrom);

      $(this).click(function(e) {
        $inputTo.open();
        $inputFrom.open();
      });

      buildRangeDate($inputFrom, $inputTo, function(from, to) {
        onRangeSelected(from, to);
      });
    });
  });

}
