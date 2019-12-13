var hideIds = ['email-pass', 'magento-pass', 'eccosys-secret', 'imgur-pass', 'mundipagg-secret'];

$(document).ready(() => {


  //Set the Values
  $('input:text').each((each, el) => {
    loadTextVal(el);
  });

  $(':input[type="number"]').each((each, el) => {
    loadTextVal(el);
  });

  $('input:checkbox').each((each, el) => {
    loadCheckboxVal(el);
  });

  if (loggedUser.full){
    $('input:text').change(onPutString);
    $(':input[type="number"]').change(onPutNumber);
    $('input:checkbox').change(onPutBoolean);
  }else{
    hideIds.forEach((id) => {
      $('#' + id).attr('type', 'password');
    });
  }

});

function loadTextVal(el){
  $(el).val(_params[$(el).attr('id')]);
}

function loadCheckboxVal(el){
  $(el).prop('checked', _params[$(el).attr('id')]);
}


function onPutString(){
    putParam($(this).attr('id') , $(this).val());
}

function onPutNumber(){
  putParam($(this).attr('id') , Num.def($(this).val()));
}

function onPutBoolean(el){
  putParam($(this).attr('id') , $(this).is(":checked"));
}

function putParam(id, value){
  _post('/put-main-param', {name: (id ? id : 'none'), val: value}, ()=>{
    console.log('[Put]: ' + id + ' - ' + value);
  });
}
