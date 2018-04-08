function bindDateRangePickers(onRangeSelected) {
  loadCssFile('/css/libs/material-date-picker.min.css');
  loadCssFile('/css/date-picker.css');
  loadJsFile('/js/libs/material-date-picker.min.js', function() {

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


function buildRangeDate(inputFrom, inputTo, onRangeSelected) {
  buildDatePicker(inputTo, function(e) {
    $('#select-date-from').datepicker().close();

    var from = retriveUnselectedDate('#select-date-from');
    var to = retriveUnselectedDate('#select-date-to');
    onRangeSelected(from, to);
  }, null, function functionName() {
    $('#select-date-from').datepicker().close();
  });

  buildDatePicker(inputFrom);
}

function buildDatePicker(input, onChange, onSelect, onClose) {
  input.datepicker({
    modal: false,
    header: true,
    footer: true,
    format: 'yyyy-mm-dd',
    change: function(e) {
      if (onChange)
        onChange(e);
    },
    select: function(e, type) {
      if (onSelect)
        onSelect(e);
    },
    close: function(e) {
      if (onClose)
        onClose();
    }
  });
}

function retriveSelectedDate(selector) {
  return convertDate($(selector).datepicker().value());
}

function retriveUnselectedDate(selector) {
  var guid = $(selector).attr('data-guid');
  return convertDate($("[guid='" + guid + "']").attr('selectedday'));
}

function convertDate(str) {
  var val = str.split('-');
  return Date.UTC(val[0], val[1], val[2]);
}