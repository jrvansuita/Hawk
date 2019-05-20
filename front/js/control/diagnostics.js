

$(document).ready(()=>{

  $('#run').click(()=>{
    showLoading();

    _post('/run-product-diagnostics', {}, ()=>{
      console.log('rodou');
    });
  });


  new Broadcast('product-diagnostics').onReceive((result)=>{
    var msg = 'Foram avaliados ' + result.productsAnalyzed + ' skus e foram encontrados ' + result.fixesFound + ' problemas.';

    $('.erros-msg').text(msg);
    startIntervalTimer(result.startTime);
    showLoading();
  });


  $('.ind-item').click(function(){
    $('.active').removeClass('active');
    $(this).addClass('active');

    $('.ind-rows-holder').empty();
    _get('/product-fixes', {type : $(this).data('type')}  , (all)=> {
      buildIndRows(all);
    });
  });

});

function startIntervalTimer(startTime){
  if (startTime){
    window.setInterval(()=> {
      var diftime = new Date().getTime() - new Date(startTime).getTime();
      $(".start-time").text((diftime/1000).toString().toMMSS());
    }, 1000);
  }
}


function buildIndRows(rows){

  var brands = rows.map((row)=>{
    return row.brand;
  }).filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
  });

  brands.forEach(brand=>{
    var $brandGroup = $('<div>').addClass('brand-group');

   var $brandLabel = $('<label>').append(brand);
   var $brandTotal = $('<label>').addClass('brand-total');

    var $brandTitle = $('<span>').addClass('brand-title').append($brandLabel, $brandTotal);
    var $itemsHolder = $('<div>').addClass('items-brand-holder');

    $brandGroup.append($brandTitle, $itemsHolder);

    var count = 0;
    rows.forEach((row)=>{
      if (row.brand == brand){
        count++;
        buildSingleRow($itemsHolder, row);
      }
    });

    $brandTotal.append(count);

    $('.ind-rows-holder').append($brandGroup);
  });


  bindCopiable();
}

function buildSingleRow(holder, row){
  var $img = $('<img>').addClass('row-img').attr('src', '/sku-image?sku=' + row.sku).attr('onerror',"this.src='img/product-placeholder.png'");


  var $name = $('<label>').addClass('row-name').text(row.brand);
  var $sku = $('<label>').addClass('row-sku copiable').text(' ' + row.sku)

  var $subsHolder = $('<div>').addClass('subs-holder').append($name, $sku);

  $subsHolder.dblclick((e)=>{
    e.stopPropagation();
    window.open('/product?sku=' + row.sku,'_blank');
  });

  var $div =  $('<div>').addClass('row-item shadow').append($img, $subsHolder);
  $div.click(()=>{
    showSkuFixesDialog(row.sku);
  });

  holder.append($div);
}


function bindCopiable(){
  $('.copiable').click(function(e){
    Util.selectContent(this);
    Util.copySeleted();
    $(this).select();
    e.stopPropagation();
  });
}



function showLoading(){
  $('#run').hide();
  $('.loading-circle').show();
}

function showSkuFixesDialog(sku){
  $('.sku-fixes-modal').show();

  $('.sku-fixes-modal').one('click', function (e){
    $('.sku-fixes-holder').empty();
    $('.sku-fixes-modal').hide();
    e.stopPropagation();
  });

  $('.sku-fixes-holder').one('click', function (e){
    e.stopPropagation();
  });

  $('.sku-fixes-holder').load('/fixes-dialog?sku=' + sku,()=>{
    bindCopiable();
  });
}
