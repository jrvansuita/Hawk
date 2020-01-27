$(document).ready(()=>{


  $('#insta-post').keypress(function(e){
    if(e.which == 13){
      _post('/sku-picture-from-insta', {instaPost : $('#insta-post').val(), sku: $('#sku').val()}, (data)=>{
        console.log('veio' + data);
      });
    }
  });

  $('.save').click(saveClick);

$('#sku').on("keyup", function(e) {
  if (e.which == 13){
    if ($(this).val()){
      $('.add-product').trigger('click');
    }
  }
});

$('.add-product').click(()=>{
  handleProduct($('#sku').val());
});
});
function getSelectedSkus(){
  return $('.skus-box .toast-item')
  .map(function() {
    return $(this).data('val');
  })
  .get();
}

function handleProduct(sku){
  if (Util.notIn(getSelectedSkus(), sku)){
    _get('/product-child', {sku: sku}, (p)=>{
      if (!p){
        showSkuError('Produto não encontrado!');
      }else{
        $('#sku').val('');
        addProduct(p.codigo);
      }
    });
  }else{
    showSkuError('Produto já adicionado!');
  }
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

function addProduct(sku){
  $('.skus-box').append(getToastItem(sku, sku));
}

function getToastItem(label, data, clazz){
  var toast = $('<span>').addClass('toast-item').data('val', data).addClass(clazz).text(label);

  if (!clazz){
    toast.click(()=>{
      toast.remove();
    });
  }

  return toast;
}


function getInstaId(){
  var value = $('#insta-post').val();

  if (isLink(value)) {
    value = Str.between(value, '/p/', '/');
  }

  return value.trim();
}

function isLink(value){
  return value.includes('/p/');
}

function checkInputs(){
  if(checkMaterialInput($('#insta-post')) && getSelectedSkus().length > 0 ) {
      return true;
    }
    else{
      checkMaterialInput($('#sku'));
      showSkuError('Adicione uma sku');
    }
  }

function saveClick(){
  if(checkInputs()){
    savePic();
  }
}

function savePic(){
  if($('#insta-post').val()){
    _post('/sku-picture-from-insta', {
      instaPost : getInstaId(), skus: getSelectedSkus().join(',')
    }, (data)=>{
      console.log('veio' + data);
    });
  }else if($('#face-post').val()){
    console.log($('#face-post').val());
  }
}
