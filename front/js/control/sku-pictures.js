$(document).ready(()=>{

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

  loadImagesFromUrl('/get-sku-pictures-page');
  loadImagesFromUrl('/get-sku-pictures-page-approve');

});

function loadImagesFromUrl(url){
  _get(url, {page: 1}, onResultSucess());
}

function onResultSucess(){
  return (data) => {
    console.log(data);
    data.forEach((each) => {
      loadImagesHolder(each);
    });
  };
}

function menuDotsClick(holder, each){

  holder.click(function(e){
    var drop = new MaterialDropdown($(this), e, false, true);

    if(each.approved){
      drop.addItem('/img/block.png', 'Reprovar', function(){
        onApproveImageClick(holder.parent('.approve-item'), each._id, false);
      });
    }else{
      drop.addItem('/img/checked.png', 'Aprovar', function(){
        onApproveImageClick(holder.parent('.approve-item'), each._id, true);
      });
    }
    drop.addItem('/img/website.png', 'Acessar Link', function(){
      window.open(each.url, '_blank');
    });

    drop.addItem('/img/delete.png', 'Excluir', function(){
      window.open(each.url, '_blank');
    });
    drop.show();
  });
}

function onApproveImageClick(holder, _id, approved){
  _post('/sku-pictures-approve', {_id: _id, approved: approved},(data) => {
    holder.fadeOut(200, () => {
      holder.remove();
    });
  });
}

function loadImagesHolder(each){
  var $itemHolder = $('<div>').addClass('approve-item');
  var $clientImg = $('<img>').addClass('client-image').attr('src', each.img);
  var $skusHolder = $('<p>').text(each.sku);

  var $previewImg = $('<div>');

  each.sku.split(',').forEach((sku) => {
    if(sku != ""){
      $previewImg.append($('<img>').addClass('preview-image').attr('src', Params.productionUrl() + "/sku-image?sku="+ sku));
    }
  });

  $itemHolder.append($clientImg, $previewImg, $skusHolder, builMenuItem(each));
  $(each.approved  ? '.approved-images-holder' : '.to-be-approved-holder').append($itemHolder)
}


function builMenuItem(each){
  $menu = $('<div>').addClass('menu-dots');
  $menuImg = $('<img>').addClass('dots-glyph').attr('src', '../../img/dots.png');
  $menu.append($menuImg);

  menuDotsClick($menu, each);

  return $menu;
}

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
    $('#insta-post').val('');
    $('.toast-item').remove();
  }else if($('#face-post').val()){
    console.log($('#face-post').val());
  }
}
