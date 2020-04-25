var dateBeginPicker = null;
var dateEndPicker = null;
var tagsHandler;

$(document).ready(()=>{
  var queryId = new URLSearchParams(location.search).get('id');
  tagsHandler = new TagsHandler();


  dateBeginPicker = new DatePicker();

  dateBeginPicker.holder('.date-begin-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-begin').val(formatedDate);
  })
  .load();


  dateEndPicker = new DatePicker();

  dateEndPicker.holder('.date-end-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-end').val(formatedDate);
  })
  .load().then(()=>{
    if (!queryId){
      onSearchData();
    }
  });

  $('#search-input').on("keyup", function(e) {
    if (e.which == 13){
      $('#search-button').trigger('click');
    }
  });

  $('#search-button').click(()=>{
    onSearchData();
  });

  $('.button').on("keyup", function(e) {
    if (e.which == 13){
      $(this).click();
    }
  });

  $('.icon-open').click(()=>{
    tagsHandler.toggleTagBox();
  });


  if (queryId){
    onSearchData(queryId);
  }
});

function coloringData(){
  $('.coloring-data').each((i , each) => {
    var perc = $(each).data('cur') / $(each).data('max');
    perc = perc < .1 ? .1 : perc;
    $(each).css('background-color', "rgba(211, 211, 211, x)".replace('x', perc));
  });
}


function loadingPattern(isLoading){
  if (isLoading){
    $('.icon-open').attr('src','/img/loader/circle.svg');
  }else{
    $('.no-data').hide();
    $('.content-grid').empty();

    setTimeout(() => {
      $('.icon-open').attr('src','/img/open-down.png');
    },400);
  }
}


function setDates(begin, end){
  begin = new Date(parseInt(begin));
  end = new Date(parseInt(end));

  $('#date-begin').val(Dat.format(begin));
  $('#date-end').val(Dat.format(end));

  setTimeout(() => {
    dateBeginPicker.setSelected(begin);
    dateEndPicker.setSelected(end);
  }, 1000)
}

function setUrlId(id){
  if (window.history.replaceState) {
    window.history.replaceState("Data", null, location.pathname + '?id=' + id);
  }
}

function setAttrsAndValue(value, attrs){
  tagsHandler.placeAll(attrs);
  $('#search-input').val(value);
}

function getDateVal(id, dateEl){
  return dateEl.getSelected() && $('#' + id).val() ? dateEl.getSelected().getTime() : undefined;
}
