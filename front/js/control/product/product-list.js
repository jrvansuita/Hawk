var page = 0;
var loading = false;
var productsListCount = 0;
var selectedSkus = {};
var showAll = false;

function loadFromMemory(){
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
    emptyList();
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

  Dropdown.on($('.menu-dots'))
  .item('/img/copy.png', 'Copiar Skus', (helper) => {
    var val = '';
    $(".sku.copiable").each(function() {
      val += '\n' + $(this).text();
    });

    Util.copySeleted(val);
  })
  .item('/img/mockup.png', 'Gerar Mockups', (helper) => {
    new MockupSelector().onSelect((id)=>{
      window.open('/build-multiple-mockups?skus=' + Object.keys(selectedSkus) + '&mockId=' + id, '_blank');
    }).show();
  })
  .item('/img/photo.png', 'Baixar Imagens', (helper) => {
    window.open('/product-multiple-imgs?skus=' + Object.keys(selectedSkus), '_blank');
  })
  .item('/img/print.png', 'Imprimir Relatório', (helper) => {
    window.open('/product-list-export');
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

function emptyList(){
  page = 0;
  showAll = false;
  productsListCount = 0;
  $('.content').empty();
}


function loadList(){
  if (!showAll){
    page++;
    loading = true;

    _get('/product-list-page',{page : page,
      query: {
        value: $('#search-input').val(),
        attrs: getAttrsTags(),
        noQuantity: $('#show-no-quantity').is(":checked")
      }
    },(result)=>{
      showAll = result.data.length == 0;
      loading = false;
      result.data.forEach((each, index)=>{
        productsListCount++;
        addProductLayout(each, index);
      });

      console.log(result);

      showMessageTotals(result.info);

      bindCopiable();
    });
  }
}

function showMessageTotals(info){
  var msg = 'Nenhum produto encontrado.';

  if(info){
    msg = Num.points(info.sum_quantity) + ' items e ' + Num.points(info.count) + ' skus';
  }


  if (loggedUser.full){
    msg += ' ' + Num.format(info.sum_cost, false, true) + '/' + Num.format(info.sum_sell, false, true);
  }

  $('#totals').text(msg);
}


function addProductLayout(product, index){
  var img = createImgProduct(product, index);
  var main = createMainProduct(product);

  var $holder = $('<div>').addClass('item-holder').append(img, main);

  $('.content').append($holder);
}


function createImgProduct(product, index){


  var checkBoxId = 'check-' + index;

  var checked = $('<input>', {
    type: 'checkbox',
  }).attr('id', checkBoxId).css('display', 'none');


  var img = $('<img>')
  .attr('src', product.image)
  .addClass('thumb')
  .attr('onerror',"this.src='img/product-placeholder.png'")


  var counter = $('<label>').addClass('counter-circle').append(productsListCount);

  new ImagePreview(img).hover((self)=>{
    _get('/product-image', {sku: product.sku },(product)=>{
      self.show(product.image);
    });
  });

  var imgHolder = $('<div>').addClass('item-img-holder');
  imgHolder.append(counter, img)


  var label = $('<label>')
  .addClass('check-label')
  .attr('for', checkBoxId)
  .append(imgHolder);


  return $('<div>').append(checked, label)
  .click({
    index: index,
    sku: product.sku
  }, function(event) {
    toggleChecked(event.data.index, event.data.sku);
    return false;
  });
}

function toggleChecked(index, sku, check) {
  var checkBox = $('#check-' + index);
  checkBox.prop('checked', check === undefined ? !checkBox.is(':checked') : check);

  if (selectedSkus[sku]){
    delete selectedSkus[sku];
  }else{
    selectedSkus[sku] = true;
  }
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

  var diagIcon = $('<img>').addClass('diag-alert').attr('src','img/alert.png');

  _get('/product-fixes', {sku : product.sku}  , (all)=> {
    if (all.length > 0){
      diagIcon.fadeIn();
      diagIcon.click(()=>{
        window.open('/diagnostics?sku=' + product.sku,'_blank');
      });
      all.forEach((item) => {
        var alertTooltip = new Tooltip(diagIcon[0], item.data.name).load();
      });
    }
  });
  var div = $('<div>').addClass('title-holder').append(sku, name, diagIcon);

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
  var $manufacturer = createClickableTag(product.manufacturer, 'manufacturer');


  var $age = [];
  if (product.age){
    product.age.split(',').forEach((each)=>{
      $age.push(createClickableTag(each.trim(), 'age'));
    });
  }


  var $year = createClickableTag(product.year, 'year');

  var $price = createSingleTag(Num.money(product.price));
  var $quantity = createSingleTag(Num.points(product.quantity)).addClass('quantity-label');


  var rightCols = [];

  if (loggedUser.full){
    $totalCost = createSingleTag(Num.format(product.quantity * product.cost));
    $totalSell = createSingleTag(Num.format(product.quantity * product.price));
    $cost = createSingleTag(Num.money(product.cost));

    rightCols.push($('<div>').addClass('item-right-holder').append($totalSell, $totalCost));
    rightCols.push($('<div>').addClass('item-right-holder').append($price, $cost));
  }

  rightCols.push($('<div>').addClass('item-right-holder').append($quantity));

  var $tagsHolder = $('<div>').addClass('tags-holder');
  $tagsHolder.append($brand, $manufacturer, $cat, $gender, $color, $season, $age, $year, ...rightCols);

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
