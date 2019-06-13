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
    //window.location.reload();
    console.log('Reload recebeu');
    console.log(data);
  });


  $('.menu-dots').click(function(e){
    var drop = new MaterialDropdown($(this), e);

    drop.addItem('/img/refresh.png', 'Atualizar', function(e){
      $(this).find('.dots-glyph').attr('src','/loader/circle.svg');

      _post('/product-board-reset', {}, ()=>{
        console.log('Rodou o reset');
      });
    });

    drop.show();

    e.stopPropagation();
  });

});
