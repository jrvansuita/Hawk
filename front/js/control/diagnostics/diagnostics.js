

$(document).ready(()=>{

  $('#sync').click(()=>{

    if($('#search').val()){
      showSkuFixesDialog($('#search').val());
    }
    else{
      showLoading();
      _post('/run-product-diagnostics', {}, ()=>{
        console.log('rodou');
      });
    }


  });

  Dropdown.on($('.main-menu-dots'))
  .item('/img/search.png', 'Pesquisar Produto', (helper) => {
    if ($('#search').is(':visible')){
      $('#search').hide();
    }else{
      $('#search').fadeIn();
      $('#search').focus()
    }
  })
  .item('/img/restart.png', 'Atualizar Problemas', (helper) => {
    showLoading();

    _post('/run-product-diagnostics', {refresh:true}, ()=>{
      console.log('rodou');
    });
  });

  new Broadcast('product-diagnostics').onReceive((result)=>{
    var msg = 'Foram avaliados ' + result.productsAnalyzed + ' skus e foram encontrados ' + result.fixesFound + ' problemas.';
    console.log(msg);

    $('.errors-msg').text(msg);
    startIntervalTimer(result.startTime);
    showLoading();
    attachFinisherController();
  });


  $('.ind-item').click(function(){
    $('.active').removeClass('active');
    $(this).addClass('active');

    $('.ind-rows-holder').empty();
    $('.description').text(types[$(this).data('type')].description);
    _get('/product-fixes', {type : $(this).data('type')}  , (all)=> {
      buildIndRows(all);
    });
  });



  const urlParams = new URLSearchParams(window.location.search);
  var skuSelected = urlParams.get('sku');

  if (skuSelected){
    showSkuFixesDialog(skuSelected);
  }

  $('#search').on("keyup", function(e) {
    if (e.which == 13){
      showSkuFixesDialog($(this).val());
    }
  });

  $('#search').focusin(()=>{
    $('#search').select();
  });

});

var timerIntervalId = 0;

function startIntervalTimer(startTime){
  if (startTime){
    if (timerIntervalId == 0){
      timerIntervalId = setInterval(()=> {
        var diftime = new Date().getTime() - new Date(startTime).getTime();
        $(".start-time").text((diftime/1000).toString().toMMSS());
      }, 1000);
    }
  }else{
    clearInterval(timerIntervalId);
    timerIntervalId = 0;
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

    var $brandMenu = $('<div>').addClass('main-menu-dots');


    Dropdown.on($brandMenu)
    .item('/img/copy.png', 'Copiar Skus', (helper) => {
      var val = '';
      $brandMenu.closest('.brand-group').find(".row-sku.copiable").each(function() {
        val += '\n' + $(this).text();
      });
      Util.copySeleted(val);
    })
    .item('/img/restart.png', 'Atualizar Marca', (helper) => {
      showLoading("Carregando produtos...");
      var type = $('.ind-item.active').data('type');
      _post('/run-product-diagnostics', {refresh:true, brand: brand, type: type}, ()=>{
        console.log('rodou');
      });
    });


    var $brandTitle = $('<span>').addClass('brand-title').append($brandLabel, $brandMenu, $brandTotal);
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
  var $img = $('<img>').addClass('row-img').attr('src', '/product-image-redirect?sku=' + row.sku).attr('onerror',"this.src='img/product-placeholder.png'");


  var $name = $('<label>').addClass('row-name').text(row.brand);
  var $sku = $('<label>').addClass('row-sku copiable').text(' ' + row.sku)

  var $subsHolder = $('<div>').addClass('subs-holder').append($name, $sku);

  $subsHolder.dblclick((e)=>{
    e.stopPropagation();
    window.open('/product?sku=' + row.sku,'_blank');
  });

  var $div =  $('<div>').addClass('row-item shadow').attr('data-sku' , row.sku).append($img, $subsHolder);
  $div.click(()=>{
    showSkuFixesDialog(row.sku);
  });

  holder.append($div);
}





function showLoading(showLabel){
  if (showLabel){
    $('.errors-msg').text(showLabel);
  }


  $('#sync').hide();
  $('.main-menu-dots').hide();
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



function attachFinisherController(){
  clearTimeout(loadingId);
  loadingId = setTimeout(finishedLoading, 5000);
}

var loadingId = 0;


function finishedLoading(){
  $('.errors-msg').text("Processo de atualização finalizado.");

  $('#sync').show();
  $('.main-menu-dots').show();
  $('.loading-circle').hide();
  $(".start-time").text("");
  startIntervalTimer(null);
}
