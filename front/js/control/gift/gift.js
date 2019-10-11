var expiresDatePicker = null;

$(document).ready(()=>{

  new DatePicker()
  .holder('.expires-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#expires').val(formatedDate);
    $('#expires').data('date', date);
  })
  .load()
  .then(binder => expiresDatePicker = binder);





});
