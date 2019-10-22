$(document).ready(()=>{


  new ComboBox($('#job-name'), '/jobs-all')
  .setAutoShowOptions(true)
  .setOnItemBuild((item, index)=>{
    return {text : item.description};
  })
  .setOnItemSelect((data, item)=>{
    window.location='/job-registering?id='+ item.id;
  }).load();


  new ComboBox($('#job-type'), jobTypes)
  .setAutoShowOptions(true)
  .load();


  $('#time').mask("99:99");
  $('#time').change(function() {

    if ($(this).val().substring(0, 2) > 23) {
      $(this).val('');
      return false;
    }

    if ($(this).val().substring(3, 5) > 59) {
      $(this).val('');
      return false;
    }
  });

});
