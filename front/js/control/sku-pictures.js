var loading = false;
var _page = 0;
var showAll = false;

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

  $('#search').on("keyup", function(e) {
    if (e.which == 13){
      startApprovedSearch($(this).val());
    }
  });

  startApprovedSearch();
  startToBeApprovedList();
});



function startToBeApprovedList(sku){
  controlImagesList($('.to-be-approved-container-holder'), $('.to-be-approved-images-holder'), '/get-sku-pictures-page-to-approve');
}

function startApprovedSearch(sku){
  controlImagesList($('.approved-container-holder'), $('.approved-images-holder'), '/get-sku-pictures-page', sku ? {sku: sku} : {});
}

function controlImagesList(pane, list, path, query){
  var isLoading = false;
  var page = 0;
  var loadedAllResults = false;

  var loadNextPage = ()=>{
    if (!loadedAllResults && !isLoading){
      isLoading = true;
      page++;

      console.log('Load Next Page ' + page);

      if (page == 1){
        list.empty();
      }

      _post(path, {page: page, cache: false, ...query}, (data) => {

        loadedAllResults = data.length == 0;


        data.forEach((each) => {
          loadImagesHolder(list, each);
        });

        isLoading = false;
          console.log('DATA', data);
        bindCopiable();
      });
    }
  };

  bindScrollLoadImages(isLoading, pane, list, loadNextPage);
  loadNextPage();
}



function bindScrollLoadImages(isLoading, pane, list, onLoadNextPage){
  pane.unbind('scroll').bind('scroll', function() {


    var go = false;

    if (pane.css('overflow-x') == 'hidden'){
      go = (((pane.scrollTop() + pane.height()) + 500 >= list.height()));
    }else{
      go = (((pane.scrollLeft() + pane.width()) + 500 >= list.width()));
    }


    if (go){
      if (onLoadNextPage){
        onLoadNextPage();
      }
    }
  });
}


function onApproveImageClick(holder, _id, approved){

  _post('/sku-pictures-approve', {_id: _id, approved: approved},(data) => {
    holderRemove(holder);
  });
}

function holderRemove(holder){
  holder.fadeOut(200, () => {
    holder.remove();
  });
}

function deleteImage(holder, _id){
  _post('/sku-picture-delete', {_id: _id},(data) => {
    holderRemove(holder);
  });
}


function loadListApprovedClientImages(){
  if(!showAll){
    _page++;
    loading = true;
    loadImagesFromUrl('/get-sku-pictures-page', _page);
  }
}

function loadImagesHolder(listHolder, each){
  var skusArr = each.sku.split(',');
  var addrClassPreview = skusArr.length > 1 ? ' multiple-skus' : '';

  var $itemHolder = $('<div>').addClass('approve-item');
  var $clientImg = $('<img>').addClass('client-image').attr('src', each.img);
  var $skusHolder = $('<div>').addClass('skus-holder');
  var $previewImg = $('<div>').addClass('preview-image-holder' + addrClassPreview);

  skusArr.forEach((sku) => {
    if(sku != ""){
      $previewImg.append($('<img>').addClass('preview-image').attr('src', Params.skuImageUrl(sku)));
      $skusHolder.append(createSingleTag(sku));
      applyTagColor($skusHolder.children('span'));

    }
  });

  $itemHolder.append($clientImg, $previewImg, $skusHolder, buildMenuItem(each));
  listHolder.append($itemHolder)
}

function buildMenuItem(each){
  $menu = $('<div>').addClass('menu-dots');
  $menuImg = $('<img>').addClass('dots-glyph').attr('src', '../../img/dots.png');
  $menu.append($menuImg);

  menuDotsClick($menu, each);

  return $menu;
}

function menuDotsClick(holder, each){

  holder.click(function(e){
    var drop = new MaterialDropdown($(this), e);
    var $holder = holder.parent('.approve-item');

    if(each.approved){
      drop.addItem('/img/block.png', 'Reprovar', function(){
        onApproveImageClick($holder, each._id, false);
      });
    }else{
      drop.addItem('/img/checked.png', 'Aprovar', function(){
        onApproveImageClick($holder, each._id, true);
      });
    }
    drop.addItem('/img/website.png', 'Acessar Link', function(){
      window.open(each.url, '_blank');
    });

    drop.addItem('/img/delete.png', 'Excluir', function(){
      deleteImage($holder, each._id);
    });
    drop.show();
  });
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

function createSingleTag(sku){
  return $('<span>').addClass('tag copiable').append(sku)
  .attr('data-value', sku.toString().toLowerCase());
}

function applyTagColor(tag){
  var value = tag.data('value');

  if (value){
    tag
    .css('background', '#9c9a9a');
  }
}
