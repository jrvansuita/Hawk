var expiresDatePicker = null;

$(document).ready(()=>{


  new ComboBox($('#gift-name'), '/gift-all')
  .setAutoShowOptions(true)
  .setOnItemBuild((item, index)=>{
    return {text : item.name};
  })
  .setOnItemSelect((data, item)=>{
    window.location='/gift-rules?id='+ item.id;
  }).load();


  expiresDatePicker = new DatePicker();

  expiresDatePicker.holder('.expires-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#expires').val(formatedDate);
    $('#expires').data('date', date);
  })
  .load().then(()=>{
    if (selectedGift){
      expiresDatePicker.setSelected(selectedGift.expiresDate);
      $('#expires').val(Dat.format(new Date(selectedGift.expiresDate)));
    }
  });


  $('#sku').on("keyup", function(e) {
    if (e.which == 13){
      if ($(this).val()){
        handleProduct($(this).val());
      }
    }
  });

  $('#value').on("keyup", function(e) {
    if (e.which == 13){
      if ($(this).val()){
        handleCondition();
      }
    }
  });


  new ComboBox($('#attr'), ["totalVenda", "totalProdutos", "desconto", "observacaoInterna", "transportador"])
  .setAutoShowOptions()
  .load();


  new ComboBox($('#sign'), ["Igual", "Maior", "Menor", "Contém"])
  .setAutoShowOptions()
  .load();


  $('.save').click(()=>{
    saveGiftRule();
  });

  $('.delete-button').click(()=>{
    deleteGiftRule();
  });



  if (selectedGift){
    selectedGift.skus.forEach((sku)=>{
      addProduct(sku);
    });

    selectedGift.rules.forEach((item)=>{
      addCondition(item.attr, item.sign, item.val);
    });

  }
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
      if (p.error){
        showSkuError('Produto não encontrado!');
      }else if(p._Estoque.estoqueDisponivel == 0){
        showSkuError('Produto sem estoque disponível!');
      }else{
        $('#sku').val('');
        addProduct(p.codigo);
      }
    });
  }else{
    showSkuError('Produto já adicionado!');
  }
}

function addProduct(sku){
  $('.skus-box').append(getToastItem(sku));
}

function getToastItem(label, clazz){
  var toast = $('<span>').addClass('toast-item').data('val', label).addClass(clazz).text(label);

  if (!clazz){
    toast.click(()=>{
      toast.remove();
    });
  }

  return toast;
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


function showAttrsErros(msg){
  $('.msg-box-cond').show();
  $('.error-msg-cond').text(msg).delay(4000).queue(function(next){
    $('.msg-box-cond').hide();
    next();
  });
}

function handleCondition(){
  var c = checkMaterialInput($('#attr'));
  c = checkMaterialInput($('#sign')) & c;
  c = checkMaterialInput($('#value')) & c;

  if (c){
    addCondition($('#attr').val(), $('#sign').val(), $('#value').val())

    $('#attr').val('');
    $('#sign').val('');
    $('#value').val('');

  }
}


function addCondition(attr, sign, value){
  var attr = getToastItem(attr, 'attr');
  var sign = getToastItem(sign, 'sign');
  var val = getToastItem(value, 'value');
  var group = $('<div>').addClass('cond-group').append(attr, sign, val);

  group.click(()=>{
    group.remove();
  })

  $('.attrs-box').append(group);
}

function getSelectedAttrs(){
  var arr = [];
  $('.cond-group').each(function (){

    arr.push({
      attr: $(this).find('.attr').text(),
      sign: $(this).find('.sign').text(),
      val: $(this).find('.value').text()
    });
  });

  return arr;
}

function saveGiftRule(){
  var c = checkMaterialInput($('#gift-name'));
  var c = checkMaterialInput($('#expires')) & c;

  if ($('.attrs-box .cond-group').length == 0){
    showAttrsErros('Nenhum condição foi selecionada!');
    c = false;
  }

  if (getSelectedSkus().length == 0){
    showSkuError('Nenhum produto foi selecionado!');
    c = false;
  }

  if (c){
    _post('/gift-rules', {
      id: $('#id').val(),
      name: $('#gift-name').val(),
      expires: expiresDatePicker.getSelected().getTime(),
      active: $('#active').is(":checked"),
      skus: getSelectedSkus(),
      rules: getSelectedAttrs(),
    },(e)=>{
      console.log(e);
    });
  }
}


function deleteGiftRule(){
  if ($('#id').val().length > 0){
    _post('/gift-delete', {id: $('#id').val()},()=>{
        window.location='/gift-rules';
      });
  }
}
