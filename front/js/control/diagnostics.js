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
  rows.forEach((row)=>{

    var $img = $('<img>').addClass('row-img').attr('src', '/sku-image?def=img/product-placeholder.png&sku=' + row.sku);


    var $name = $('<label>').addClass('row-name').text(row.brand);
    var $sku = $('<label>').addClass('row-sku copiable').text(' ' + row.sku).dblclick(()=>{
      window.open('/product?sku=' + row.sku,'_blank');
    });

    var $subsHolder = $('<div>').addClass('subs-holder').append($name, $sku);

    var $div =  $('<div>').addClass('row-item shadow').append($img, $subsHolder);
    $div.click(()=>{
      showSkuFixesDialog(row.sku);
    });

    $('.ind-rows-holder').append($div);
    $div.hide().fadeIn();
  });



  buindCopiable();
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

  $('.sku-fixes-modal').click(function (e){
    e.stopPropagation();
    $('.sku-fixes-holder').empty();
    $('.sku-fixes-modal').hide();
  });

  $('.sku-fixes-holder').click(function (e){
    e.stopPropagation();
  });

  $('.sku-fixes-holder').load('/fixes-dialog?sku=' + sku,()=>{
    bindCopiable();
  });
}
