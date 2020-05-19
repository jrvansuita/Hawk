var jobTypeSelector = null;

$(document).ready(()=>{

  new ComboBox($('#job-name'), '/jobs-all')
  .setAutoShowOptions(true)
  .setOnItemBuild((item, index)=>{
    return {text : item.description};
  })
  .setOnItemSelect((data, item)=>{
    window.location='/job-registering?id='+ item.id;
  }).load();


  jobTypeSelector = new ComboBox($('#job-type'), jobTypes);
  jobTypeSelector
  .setAutoShowOptions(true)
  .load().then(()=>{
    if (job){
      jobTypeSelector.selectByFilter((each)=>{
        return each.data.key == job.type;
      });
    }
  });


  $('#new').click(()=>{
    $('input').val('');
    $('input').prop("checked", false);
  });

  $('#delete').click(()=>{
    if ($('#editing-id').val().length > 0){
      _post('/job-remove', {id: $('#editing-id').val()},()=>{
        window.location='/job-registering';
      });
    }
  });

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

  $('#save').click(()=>{
    if (checkform()){
      $('#jobform').submit();
    }
  });
});



function checkform(){
  var c = checkMaterialInput($('#description'));
  c = checkMaterialInput($('#tag')) & c;
  c = checkMaterialInput($('#job-type')) & c;
  c = checkMaterialInput($('#time')) & c;

  return c;
}




function onDoSubmit(){
  document.jobform.jobType.value = jobTypeSelector.getSelectedItem().data.key;
  return true;
}
