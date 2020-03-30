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
    if (query.begin){
      var date = new Date(parseInt(query.begin));
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
    if (query.end){
      var date = new Date(parseInt(query.end));
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
  bindTags();
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
    $(each).css('background-color', "rgba(200, 200, 200, x)".replace('x', perc));
  });
}

function bindTags(){
  $(".taggable").click(function (){
    selectAndPlaceTag($(this).text(), $(this).data('attr'));
  });
}


function selectAndPlaceTag(value, attr){
  var find = $('.tag-box').find("[data-attr='" + attr + "'][data-value='" + value + "']");

  if (find.length == 0){
    var tag = createClickableTag(value, attr);
    $('.tag-box').append(tag);

    if (!$('.tag-box').is(':visible')){
      toggleTagBox(true);
    }
  }
}

function createClickableTag(value, attr){
  if (value){
    var tag = createSingleTag(value, attr);

    applyTagColor(tag);
    tag.click(function(){
      $(this).remove();
    });

    return tag;
  }
}

function createSingleTag(value, attr){
  return $('<span>').addClass('tag').append(value)
  .attr('data-value', value)
  .attr('data-attr', attr ? attr : '');
}

function applyTagColor(tag){
  var attr = tag.data('attr');
  var value = tag.data('value');

  if (attr){
    color = Util.strToColor(value);
    weakColor = Util.strToColor(value, '0.07');

    tag
    .css('border', '1.4px solid ' + color)
    .css('background', weakColor)
    .css('border-bottom-width', '3px');
  }
}

function getAttrsTags(){
  var attrs = {};

  $('.tag-box').children('.tag').each(function(){
    var attr = $(this).data('attr');
    var value = $(this).data('value');

    attrs[attr] = attrs[attr] ? attrs[attr] +  '|' + value : value;
  });

  return attrs;
}
