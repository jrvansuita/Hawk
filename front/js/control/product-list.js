var page = 0;
var loading = false;
var productsListCount = 0;

function loadFromMemory(){
  console.log(memoryQuery);
  if (memoryQuery.value){
    $('#search-input').val(memoryQuery.value);
  }

  if (memoryQuery.attrs){
    Object.keys(memoryQuery.attrs).forEach((key)=>{
      var value = memoryQuery.attrs[key];
      var attr = key;

      value.split('|').forEach((each)=>{
        selectAndPlaceTag(Str.capitalize(each), attr);
      });
    });
  }else{
    toggleTagBox(true);
  }
}


$(document).ready(()=>{

  loadFromMemory();

  loadList();
  bindScrollLoad();

  $('#search-input').on("keyup", function(e) {
    if (e.which == 13){
      $('#search-button').trigger('click');
    }
  });

  $('#show-no-quantity').click(()=>{
    $('#search-button').focus();
  });

  $('#search-button').click(()=>{
    page = 0;
    productsListCount = 0;
    $('.content').empty();
    loadList();
  });

  $('.button').on("keyup", function(e) {
    if (e.which == 13){
      $(this).click();
    }
  });

  $('.icon-open').click(()=>{
    toggleTagBox();
  });

  $('.menu-dots').click(function(e){
    var drop = new MaterialDropdown($(this), e, false, true);
    drop.addItem('/img/copy.png', 'Copiar Skus', function(){
      var val = '';
      $(".sku.copiable").each(function() {
        val += '\n' + $(this).text();
      });

      Util.copySeleted(val);
    });
    drop.show();
  });
});

function bindScrollLoad(){
  var $pane = $('.content-scroll');
  var $list = $('.content');

  $pane.unbind('scroll').bind('scroll', function() {
    if ((($pane.scrollTop() + $pane.height()) + 1000 >= $list.height()) && !loading) {
      loadList();
    }
  });
}


function loadList(){
  page++;
  loading = true;

  _get('/product-list-page',{page : page,
    query: {
      value: $('#search-input').val(),
      attrs: getAttrsTags(),
      noQuantity: $('#show-no-quantity').is(":checked")
    }
  },(result)=>{
    loading = false;
    showMessageTotals(result.info);

    result.data.forEach((each)=>{
      productsListCount++;
      addProductLayout(each);
    });

    bindCopiable();
  });
}

function showMessageTotals(info){
  var msg = 'Nenhum produto encontrado.';

  if(info){
    msg = Num.points(info.sum_quantity) + ' items e ' + Num.points(info.count) + ' skus';
  }

  $('#totals').text(msg);
}


function addProductLayout(product){
  var img = createImgProduct(product);
  var main = createMainProduct(product);

  var $holder = $('<div>').addClass('item-holder').append(img, main);

  $('.content').append($holder);
}


function createImgProduct(product){
  var imgHolder = $('<div>').addClass('item-img-holder');

  var img = $('<img>')
  .attr('src', product.image)
  .addClass('thumb')
  .attr('onerror',"this.src='img/product-placeholder.png'");

  var counter = $('<label>').addClass('counter-circle').append(productsListCount);

  new ImagePreview(img).hover((self)=>{
    _get('/product-image', {sku: product.sku },(product)=>{
      self.show(product.image);
    });
  });

  return imgHolder.append(counter, img);
}


function createMainProduct(product) {

  var title = createTitle(product);
  var tags = createTags(product);

  return $('<div>').addClass('item-content-holder').append(title, tags);
}


function createTitle(product) {

  var name = $('<span>').addClass('name').append(product.name).click(()=>{
    if (product.url){
      window.open(product.url, '_blank');
    }
  });

  var sku = $('<span>').text(product.sku).addClass('sku copiable').dblclick(function(){
    window.open(
      '/product?sku=' + $(this).text(),
      '_blank' // <- This is what makes it open in a new window.
    );
  });


  var div = $('<div>').addClass('title-holder').append(sku, name);

  return div;
}

function createTags(product){
  var $brand = createClickableTag(product.brand, 'brand');

  var $cat = [];
  if (product.category){
    product.category.split(',').forEach((each)=>{
      $cat.push(createClickableTag(each.trim(), 'category'));
    });
  }

  var $gender = createClickableTag(product.gender, 'gender');
  var $color = createClickableTag(product.color, 'color');
  var $season = createClickableTag(product.season, 'season');


  var $age = [];
  if (product.age){
    product.age.split(',').forEach((each)=>{
      $age.push(createClickableTag(each.trim(), 'age'));
    });
  }


  var $year = createClickableTag(product.year, 'year');

  var $price = createSingleTag(Num.money(product.sellPrice));
  var $quantity = createSingleTag(Num.points(product.quantity));
  var $divRight = $('<div>').addClass('item-right-holder').append($quantity, $price);


  var $tagsHolder = $('<div>').addClass('tags-holder');
  $tagsHolder.append($brand, $cat, $gender, $color, $season, $age, $year, $divRight);

  return $tagsHolder;
}


function createClickableTag(value, attr){
  if (value){
    var tag =  createSingleTag(value, attr);
    applyTagColor(tag);
    tag.click(function(){
      var value = $(this).data('value');

      if ($(this).hasClass('selected-tag')){
        $(this).remove();
      }else{
        selectAndPlaceTag(value, attr);
      }

      $('#search-button').focus();
    });

    return tag;
  }
}

function selectAndPlaceTag(value, attr){
  var find = $('.tag-box').find("[data-attr='" + attr + "'][data-value='" + value + "']");

  if (find.length == 0){
    var tag = createClickableTag(value, attr);
    tag.addClass('selected-tag');

    applyTagColor(tag);

    $('.tag-box').append(tag);

    if (!$('.tag-box').is(':visible')){
      toggleTagBox(true);
    }
  }
}

function createSingleTag(value, attr){
  return $('<span>').addClass('tag').append(value)
  .attr('data-value', value.toString().toLowerCase())
  .attr('data-attr', attr ? attr.toLowerCase() : '');
}

function applyTagColor(tag){
  var attr = tag.data('attr');
  var value = tag.data('value');

  if (attr){
    var color;

    if (attr == 'color'){
      color = Util.colorVal(value);

      if (!color || Util.colorBrightness(color) > 230){
        return tag;
      }
    }

    if (color){
      weakColor = color + '07';
    }else{
      color = Util.strToColor(value);
      weakColor = Util.strToColor(value, '0.07');
    }

    if (tag.hasClass('selected-tag')){
      tag.css('color', 'white');
      weakColor = color;
    }

    tag
    .css('border', '1.4px solid ' + color)
    .css('background', weakColor)
    .css('border-bottom-width', '3px');
  }
}





function getAttrsTags(){
  var attrs = {};

  $('.tag-box').children('.tag').each(function(){
    var attr = $(this).data('attr');
    var value = $(this).data('value');

    attrs[attr] = attrs[attr] ? attrs[attr] +  '|' + value : value;
  });

  return attrs;
}


function toggleTagBox(forceOpen){
  if ($('.icon-open').hasClass('is-closed') || forceOpen ){
    $('.icon-open').addClass('is-open').removeClass('is-closed');
    $('.tag-box').show();
  }else{
    $('.icon-open').removeClass('is-open').addClass('is-closed');
    $('.tag-box').hide();
  }
}
