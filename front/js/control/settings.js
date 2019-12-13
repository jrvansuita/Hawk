$(document).ready(()=>{



  $('.job-item-menu').click(function(e) {
    var id = $(this).data('id');
    var tag = $(this).data('tag');
    var active = $(this).data('active');

    var drop = new MaterialDropdown($(this), e);

    if (active){
      drop.addItem('/img/play.png', 'Executar', function(){
        _post('  /job-run-force', {id: id});
      });
    }

    drop.addItem('/img/gear.png', 'Editar', function(){
      window.location = '/job-registering?id=' +id;
    });

    drop.addItem('/img/registering.png', 'Log', function(){
      window.location = '/history?tag=' + tag;
    });




    drop.show();
  });

});
