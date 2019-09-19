$(document).ready(()=>{

  $('.sku.copiable').dblclick(function(){
    window.open(
      '/product?sku=' + $(this).text(),
      '_blank' // <- This is what makes it open in a new window.
    );
  });



  $('.grid-flow').each(function(){
    var childHeight = $(this).children().first().outerHeight();
    var totalHeight = $(this).innerHeight() * 0.95;
    var visibleRows = Math.trunc(totalHeight/childHeight);

    var childWidth = $(this).children().first().outerWidth();
    var totalWidth = $(this).closest('.divider').innerWidth();
    var possibleCols = Math.trunc(totalWidth/childWidth);

    var itemsCount = $(this).children().length;

    var cols = Math.trunc(itemsCount/visibleRows);
    cols = cols > possibleCols ? possibleCols : cols;

    $(this).css('grid-template-columns', 'repeat('+cols+', minmax(340px, 1fr))');
  });



  //Block de controle de desenho de layout
  $('.main').width('fit-content');
  //Sem essas linhas, o layout fica desentralizado na tela




  $('.icon-dots').click(function(e){
    var sku = $(this).data('sku');
    var type = $(this).data('type');

    var drop = new MaterialDropdown($(this), e, true, true);

    if (!$(this).data('father')){
      drop.addItem('/img/print.png', 'Localizações', function(){
        window.open('/product-print-locals?sku=' + sku , '_blank');
      });
    }

    if (type == 'block'){
      drop.addItem('/img/delete.png', 'Desbloquear', function(){
        new BlockedPost(sku).call();
      });
    }

    drop.show();
  });


  $('.prod-img').each(function(e){
    new ImagePreview($(this)).hover((self)=>{
      _get('/product-image', {sku: $(this).data('sku') },(product)=>{
        self.show(product.image);
      });
    });
  });



});
