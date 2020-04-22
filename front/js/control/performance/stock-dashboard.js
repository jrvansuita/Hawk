
function onSearchData(id){
  loadingPattern(true);

  if (id){
    _get('/stock-dashboard-data', {id: id}, onHandleResult);
  }else{

    _get('/stock-dashboard-data',{
      begin: getDateVal('date-begin', dateBeginPicker),
      end: getDateVal('date-end', dateEndPicker),
      value: $('#search-input').val(),
      attrs: tagsHandler.get()
    }, onHandleResult);
  }
}


function onHandleResult(result){
  loadingPattern(false);
  setAttrsAndValue(result.query.value, result.query.attrs)
  setDates(result.query.begin, result.query.end)
  setUrlId(result.id);

  if (result.data.count){
    console.log(result);
    buildBoxes(result);
  }else{
    $('.no-data').show();
  }
}


function buildBoxes(){
  
}
