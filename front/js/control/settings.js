$(document).ready(()=>{

  /*$('.job').click(function() {
  var ref = $(this).data('ref');

  _post("/run-jobs", {ref: ref}, (data) => {
  $(this).find('.job-status').attr('src','img/wait.png');
});
});
*/


$('.job-item-menu').click(function(e) {
  var id = $(this).data('id');
  var tag = $(this).data('tag');

  var drop = new MaterialDropdown($(this), e);
  drop.addItem('/img/gear.png', 'Editar', function(){
    window.location = '/job-registering?id=' +id;
  });

  drop.addItem('/img/registering.png', 'Log', function(){
    window.location = '/history?tag=' + tag;
  });

  drop.show();
});

});
