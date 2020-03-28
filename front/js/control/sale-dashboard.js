var dateBeginPicker = null;
var dateEndPicker = null;

$(document).ready(()=>{
  dateBeginPicker = new DatePicker();

  dateBeginPicker.holder('.date-begin-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-begin').val(formatedDate);
    $('#date-begin').data('date', date);
  })
  .load().then(()=>{
    if (memoryQuery.begin){
      var date = new Date(parseInt(memoryQuery.begin));
    }else{
      var date = Dat.firstDayOfMonth();
    }

    dateBeginPicker.setSelected(date);
    $('#date-begin').val(Dat.format(date));
  });


  dateEndPicker = new DatePicker();

  dateEndPicker.holder('.date-end-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-end').val(formatedDate);
    $('#date-end').data('date', date);
  })
  .load().then(()=>{
    if (memoryQuery.end){
      var date = new Date(parseInt(memoryQuery.end));
    }else{
      var date = new Date();
    }

    dateEndPicker.setSelected(date);
    $('#date-end').val(Dat.format(date));
  });

  $('#search-input').on("keyup", function(e) {
    if (e.which == 13){
      $('#search-button').trigger('click');
    }
  });

  $('#search-button').click(()=>{
    redirect();
  });

  $('.button').on("keyup", function(e) {
    if (e.which == 13){
      $(this).click();
    }
  });

  $('.icon-open').click(()=>{
    toggleTagBox();
  });

  coloringData();
});

function redirect(){
  var begin = dateBeginPicker.getSelected();
  var end = dateEndPicker.getSelected();
  begin = begin && $('#date-begin').val() ? begin.getTime() : undefined;
  end = end && $('#date-end').val() ? end.getTime() : undefined


  var params = '';

  if ($('#search-input').val()){
    params += 'value=' + $('#search-input').val() + '&'
  }

  if (false){
    'attrs=' + undefined + '&'
  }

  params +=   'begin=' + begin + '&end=' + end;

  window.location.href= '/sales-dashboard?' + params;
}

function toggleTagBox(forceOpen){
  if ($('.icon-open').hasClass('is-closed') || forceOpen ){
    $('.icon-open').addClass('is-open').removeClass('is-closed');
    $('.tag-box').show();
  }else{
    $('.icon-open').removeClass('is-open').addClass('is-closed');
    $('.tag-box').hide();
  }
}

function coloringData(){
  $('.coloring-data').each((i , each) => {
    var perc = $(each).data('cur') / $(each).data('max');
    $(each).css('background-color', $(each).data('color').replace('x', perc));
  });
}
