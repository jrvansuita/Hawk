$(document).ready(()=>{


    new ComboBox($('#pack-name'), '/package-types')
    .setAutoShowOptions(true)
    .setOnItemBuild((pack, index)=>{
      return {text : pack.name};
    })
    .setOnItemSelect((data, item)=>{
      window.location='/packages?_id='+ item._id;
    }).load();


    $('#new').click(()=>{
      $('input').val('');
    });

      $('#save').click(()=>{
        if (checkform()){
          $('#pack-form').submit();
        }
      });

      $('#delete').click(()=>{
        if ($('#editing-id').val().length > 0){
          _post('/packages-remove', {id: $('#editing-id').val()},()=>{
              window.location='/packages';
            });
        }
      });
});



function checkform(){
  var c = checkMaterialInput($('#name'));
  c = checkMaterialInput($('#width')) & c;
  c = checkMaterialInput($('#height')) & c;
  c = checkMaterialInput($('#length')) & c;

  return c;
}
