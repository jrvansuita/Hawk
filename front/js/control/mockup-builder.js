var fontColorPicker;
var fontShadowColorPicker;
var discountFontColorPicker;
var discountFontShadowColorPicker;
var discountBackgroundColorPicker;
var discountBackgroundShadowColorPicker;


$(document).ready(()=>{
  fontColorPicker = createColorPicker('font-color', selected.fontColor);
  fontShadowColorPicker = createColorPicker('font-shadow-color', selected.fontShadowColor);
  discountFontColorPicker = createColorPicker('discount-font-color', selected.discountFontColor);
  discountFontShadowColorPicker = createColorPicker('discount-font-shadow-color', selected.discountShadowColor);
  discountBackgroundColorPicker = createColorPicker('discount-background-color', selected.discountBackground);
  discountBackgroundShadowColorPicker = createColorPicker('discount-background-shadow-color', selected.discountBackground);



  $('.save-button').click(saveClick);

  setTimeout(()=>{
    new ComboBox($('#font'), fontsArr)
    .setAutoShowOptions().load();

    new ComboBox($('#font-discount'), fontsArr)
    .setAutoShowOptions().load();

  },500);

  loadPreview();
  updateSizeHint();

  $('.img-edit').click(()=>{
    $('#mock-input-file').trigger('click');
  });

  $('#width').change((event)=>{
    updateSizeHint();
  });

  $('#mock-input-file').change((event)=>{
    var selectedFile = event.target.files[0];
    var reader = new FileReader();

    $('.img-edit').attr('src', 'img/loader/circle.svg');
    reader.onload = function(event) {

      _post('/upload-img', {img: event.target.result.split(',')[1]},(data)=>{
        selected.imgUrl = data.link;
        $('.mock-img-select').attr('src', event.target.result);
        $('.img-edit').attr('src', 'img/img-edit.png');
      });
    };

    reader.readAsDataURL(selectedFile);
  });

  $('#search-sku').on("keyup", function(e) {
    var key = e.which;
    if (key == 13){
      loadPreview();
    }
  });

});


function saveClick(){
  if (checkFields()){
    saveMockupSettings();
  }
}


function checkFields(){
  var c = checkMaterialInput($('#font'));
  c = checkMaterialInput($('#width')) & c;
  c = checkMaterialInput($('#height')) & c;

  return c;
}

var preventCache = 0;


function loadPreview(){
  preventCache++;
  var skuQuery = $('#search-sku').val() ? '&sku=' + $('#search-sku').val() : '';

  $('.mock-preview').animate({ opacity: 0 });
  new ProductImageLoader($('.mock-preview'))
  .setOnLoaded(()=>{
    $('.mock-preview').animate({ opacity: 1 });
  })
  .src('/product-mockup?_v' + preventCache + skuQuery).put();
}

function saveMockupSettings() {
  var data = {
    fontName: $('#font').val(),
    fontNameDiscount: $('#font-discount').val(),
    mockurl: selected.imgUrl,
    msg: $('#msg').val(),
    fontColor : fontColorPicker.getSelectedColor().toHEXA().toString(),
    fontShadowColor : fontShadowColorPicker.getSelectedColor().toHEXA().toString(),
    showDiscount: $('#discount-active').is(":checked"),
    discountFontColor : discountFontColorPicker.getSelectedColor().toHEXA().toString(),
    discountShadowColor : discountFontShadowColorPicker.getSelectedColor().toHEXA().toString(),
    discountBackground: discountBackgroundColorPicker.getSelectedColor().toHEXA().toString(),
    discountBackgroundShadow: discountBackgroundShadowColorPicker.getSelectedColor().toHEXA().toString(),
    width: Num.def($('#width').val()),
    height: Num.def($('#height').val()),
  };

  _post('mockup-builder', data , (resultMock)=>{
    selected = resultMock;
    loadPreview();
  },(error, message)=>{
    console.log(error);
  });
}

function createColorPicker(el, defColor){
  // Simple example, see optional options for more configuration.
  return Pickr.create({
    el: '.' + el,
    theme: 'nano',
    strings: {
      save: 'Salvar',
    },
    default: defColor,
    swatches: [
      'rgba(244, 67, 54, 1)',
      'rgba(233, 30, 99, 0.95)',
      'rgba(156, 39, 176, 0.9)',
      'rgba(103, 58, 183, 0.85)',
      'rgba(63, 81, 181, 0.8)',
      'rgba(33, 150, 243, 0.75)',
      'rgba(3, 169, 244, 0.7)',
      'rgba(0, 188, 212, 0.7)',
      'rgba(0, 150, 136, 0.75)',
      'rgba(76, 175, 80, 0.8)',
      'rgba(139, 195, 74, 0.85)',
      'rgba(205, 220, 57, 0.9)',
      'rgba(255, 235, 59, 0.95)',
      'rgba(255, 193, 7, 1)'
    ],

    components: {
      preview: true,
      opacity: true,

      interaction: {
        input: true,
        save: true
      }
    }
  });
}



var fontsArr = ["Varela Round", "Verdana", "Roboto", "Lato", "Fira Sans", "Mansalva", "Turret Road"];

function updateSizeHint(){
  $('.size-hint').text('Imagem: ' + Num.def($('#width').val()) + 'x230px');
}
