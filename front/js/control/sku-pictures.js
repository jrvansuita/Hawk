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

  loadToBeApprovedImages();

  loadApprovedImages();
});

  function loadApprovedImages(){
    _get('/get-sku-pictures-page', {page: 1}, (data)=>{
      console.log(data);

      data.forEach((each) =>{
        loadImagesApproved(each);
      })
    })
  }




function loadToBeApprovedImages(){
  _get('/get-sku-pictures-page-approve', {page: 1}, (data) => {
    console.log(data);

    data.forEach((each) => {
      loadImagesToBeApproved(each);
    });
  });
}

function menuClick(holder, each){
  holder.click(function(e){

    var drop = new MaterialDropdown($(this), e, false, true);

    drop.addItem('/img/checked.png', 'Aprovar', function(){
      onApproveImageClick(holder.parent('.approve-item'), each._id);
    });
    drop.addItem('/img/website.png', 'Acessar Link', function(){
      window.open(each.url, '_blank');
    });
    drop.addItem('/img/block.png', 'Excluir', function(){

    });

    drop.show();
  });
}

function onApproveImageClick(holder, _id){
    _post('/sku-pictures-approve', {_id: _id, approved: true},(data) => {
      holder.fadeOut(200, () => {
        holder.remove();
      });
    });
}

function loadImagesToBeApproved(each){
  var $div = $('<div>').addClass('approve-item');
  var $img = $('<img>').attr('src', each.img);
  var $sku = $('<label>').text(each.sku);
  var $previewImg = $('<img>').addClass('preview-image').attr('src', Params.productionUrl() + "/sku-image?sku="+ each.sku);
  var $menu = $('<div>').addClass('menu-dots');
  var $menuImg = $('<img>').addClass('dots-glyph').attr('src', '../../img/dots.png');

  $menu.append($menuImg);
  $div.append($img, $sku, $previewImg, $menu);

  $('.to-be-approved-holder').append($div);
  menuClick($menu, each);
}

function loadImagesApproved(each){
  var $div = $('<div>').addClass('approve-item');
  var $img = $('<img>').attr('src', each.img);
  var $sku = $('<label>').text(each.sku);
  var $previewImg = $('<img>').addClass('preview-image').attr('src', Params.productionUrl() + "/sku-image?sku="+ each.sku);
  var $menu = $('<div>').addClass('menu-dots');
  var $menuImg = $('<img>').addClass('dots-glyph').attr('src', '../../img/dots.png');

  $menu.append($menuImg);
  $div.append($img, $sku, $previewImg, $menu);

  $('.approved-images-holder').append($div);
  menuClick($menu, each);
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
  }else if($('#face-post').val()){
    console.log($('#face-post').val());
  }
}
