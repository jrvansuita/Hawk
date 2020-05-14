$(document).ready(()=>{
  $('.line-item.clickable, .box-item.clickable').click(function(){
    var attrValue = {};
    attrValue[$(this).data('attr')] = $(this).data('value').toString().replace(/\,/g, '|');

    _post('/product-list',{
      query:
      {attrs:
        attrValue
      }
    },()=>{
      window.location.href = '/product-list';
    });

  });


  new Broadcast('product-board-reset').onReceive((data)=>{
    window.location.reload();
    console.log('Reload recebeu');
  });


  $('.menu-dots').click(function(e){
    var drop = new MaterialDropdown($(this), e, false, true);

    drop.addItem('/img/refresh.png', 'Atualizar', function(e){
      var $menu = $(this).closest('.menu-dots');
      $menu.unbind('click');
      $menu.find('.dots-glyph').attr('src','img/loader/circle.svg');

      _post('/product-board-reset', {}, ()=>{
        console.log('Rodou o reset');
      });
    });

    drop.show();

    e.stopPropagation();
  });

});
