var expiresDatePicker = null;

$(document).ready(()=>{

  new DatePicker()
  .holder('.expires-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#expires').val(formatedDate);
    $('#expires').data('date', date);
  })
  .load()
  .then(binder => expiresDatePicker = binder);


  $('#sku').on("keyup", function(e) {
    if (e.which == 13){
      if ($(this).val()){
        addProduct($(this).val(), (product)=>{
          $('#sku').val('');
          $('.skus-box').append(getToastItem(product.codigo));
        });
      }
    }
  });
});

function getSelectedSkus(){
  return $('.skus-box .toast-item')
  .map(function() {
    return $(this).data('val');
  })
  .get();
}


function addProduct(sku, callback){
  if (Util.notIn(getSelectedSkus(), sku)){
    _get('/product-child', {sku: sku}, (p)=>{
      console.log(p);
      if (p.error){
        showSkuError('Produto não encontrado!');
      }else if(p._Estoque.estoqueDisponivel == 0){
        showSkuError('Produto sem estoque disponível!');
      }else{
        callback(p);
      }

    });
  }else{
    showSkuError('Produto já adicionado!');
  }
}

function getToastItem(label){
  var toast = $('<span>').addClass('toast-item').data('val', label).text(label);

  toast.click(()=>{
    toast.remove();
  });

  return toast;
}


function showSkuError(msg){
  $('.msg-box-sku').show();
  $('.error-msg-sku').text(msg).delay(4000).queue(function(next){
    $('.msg-box-sku').hide();
    next();
  });

  $('#sku').val('');
  checkMaterialInput($('#sku'));
}
