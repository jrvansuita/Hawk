

$(document).ready(()=>{

  $('#sync').click(()=>{
    showLoading();

    _post('/run-product-diagnostics', {}, ()=>{
      console.log('rodou');
    });
  });

  $('.main-menu-dots').click(function(e){
    var drop = new MaterialDropdown($(this), e);
    drop.addItem('/img/restart.png', 'Atualizar Problemas', function(){
      showLoading();

      _post('/run-product-diagnostics', {refresh:true}, ()=>{
        console.log('rodou');
      });
    });
    drop.show();
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
    _get('/product-fixes', {type : $(this).data('type')}  , (all)=> {
      buildIndRows(all);
    });
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

    var $brandMenu = $('<div>').addClass('main-menu-dots').append($('<img>').attr('src','img/dots.png').addClass('dots-glyph'));
    $brandMenu.click(function(e){
      var drop = new MaterialDropdown($(this), e);
      drop.addItem('/img/copy.png', 'Copiar Skus', function(){
        var val = '';
        $(this).closest('.brand-group').find(".row-sku.copiable").each(function() {
          val += '\n' + $(this).text();
        });

        Util.copySeleted(val);
      });

      drop.addItem('/img/restart.png', 'Atualizar Marca', function(){
        showLoading("Carregando produtos...");

        _post('/run-product-diagnostics', {refresh:true, brand: brand}, ()=>{
          console.log('rodou');
        });
      });


      drop.show();
    })


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
  var $img = $('<img>').addClass('row-img').attr('src', '/sku-image?sku=' + row.sku).attr('onerror',"this.src='img/product-placeholder.png'");


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
