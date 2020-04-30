$(document).ready(() => {

  $('.users-table tr').click(function(e) {
    e.stopPropagation();
    window.open('/user-registering?userId=' + $(this).data('userid') ,'_blank');
  });

  $('.icon-dots').click(function (e) {
    e.stopPropagation();
    var id = $(this).data('userid');
    var active = $(this).data('active');
    var lineTr = $(this).parents().get(1);
    var drop = new MaterialDropdown($(this), e);
    var tdS = $(lineTr).children().get(6);

    $(this).data('active', !active);

    drop.addItem('/img/'+(active ?  'block' : 'checked')+'.png', active? 'Inativar':'Ativar', function(e){
      e.stopPropagation();
      _post('/user-active',{userId: id, active: !active}, () => {
        $(lineTr).toggleClass('active-row').toggleClass('inactive-row');
        active? $(tdS).text('Inativo') : $(tdS).text('Ativo'), $(lineTr).fadeOut('slow');
      })
    });

    drop.addItem('/img/delete.png', 'Excluir', function(e){
      e.stopPropagation();
      _post('/user-delete',{id: id}, () => {
        $(lineTr).fadeOut('slow');
      })
    });


    drop.show();
  });


});


function listar(){
  var running = 0;
  var stopped = 0;
  Object.values(users).forEach((item) => {
    item.active ? running++ : stopped++;
  });
console.log('Ativo', running);
console.log('inativo', stopped);


}
