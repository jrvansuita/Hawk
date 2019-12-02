$(document).ready(()=>{





  $('.f-icon').click(function(e){
    $(this).attr('src', 'img/loader/circle.svg');
    var sku = $(this).data('sku');

    _post('/check-product-diagnostic', {sku: sku},(data)=>{
      var type = $(this).data('type');
      var obj = data.data.find((item)=>{return item.sku == sku});

      var fixed = !obj || !obj.fixes.includes(type);

      if (fixed){
        $(this).attr('src', 'img/checked.png');
        $(this).unbind('click');
        $(this).removeClass('fix').addClass('fixed');
      }else{
        $(this).attr('src', 'img/restart-error.png');
      }

      $('.menu-dots .dots-glyph').attr('src', 'img/dots.png');

      if ($('.f-icon.fix').length == 0){
        $('.sku-fixes-modal').delay(500).fadeOut(400, ()=>{
          $('.sku-fixes-modal').trigger('click');
          $(".row-item[data-sku='"+sku.split('-')[0]+"']").fadeOut(600);
        });
      }
    });

    e.stopPropagation();
  });


  $('.fixes-sku-list.copiable').dblclick(function(e){
    e.stopPropagation();
    window.open('/product?sku=' + $(this).text(),'_blank');
  });

  $('.no-problem-menu').click(function(e){
    var sku = $(this).data('sku');
    var drop = new MaterialDropdown($(this), e, false, true);

    drop.addItem('/img/restart.png', 'Verificar Agora', function(e){
      $('.loading-circle').show();
      $('.no-problem-menu .dots-glyph').attr('src', 'img/loader/circle.svg');

      _post('/check-product-diagnostic', {sku: sku, forceFather : true},(data)=>{
        showSkuFixesDialog(sku);
        $('.loading-circle').hide();
      });
    });

    drop.show();

    e.stopPropagation();
  });

  $('.menu-dots').click(function(e){
    var sku = $(this).data('sku');

    var done = (sku)=>{
      $('.sku-fixes-modal').trigger('click');
      $(".row-item[data-sku='"+sku.split('-')[0]+"']").fadeOut(600);
    }

    var drop = new MaterialDropdown($(this), e, false, true);

    drop.addItem('/img/restart-plus.png', 'Checar Todos', function(e){
      $('.f-icon').trigger('click');
      e.stopPropagation();
    });

    drop.addItem('/img/delete.png', 'Remover', function(e){
      $('.menu-dots .dots-glyph').attr('src', 'img/loader/circle.svg');

      _post('/product-diagnostic-remove', {sku: sku},(data)=>{
        done(sku);
      });
    });

    drop.addItem('/img/block.png', 'Inativar', function(e){
      $('.menu-dots .dots-glyph').attr('src', 'img/loader/circle.svg');

      _post('/product-diagnostic-remove', {sku: sku},(data)=>{
        done(sku);
      });

      _post('/product-active', {
        sku: sku,
        active: false,
        user: loggedUser
      },(data)=>{

      });
    });

    drop.show();

    e.stopPropagation();
  });
});
