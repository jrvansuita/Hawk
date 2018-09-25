class ImagePreview{
  constructor(element){
    this.element = element;
  }


  show(src){

    if (src && this.element){
      this.removeNow();

      var _self = this;
      this.runLatter = setTimeout(function(){
        runnable(_self.element, src);
      }, 100);

    }
  }

  remove(){
    clearTimeout(this.runLatter);
    $('.image-preview').fadeOut(200, function() {
      $(this).remove();
    });
  }

  removeNow(){
    $('.image-preview').remove();
  }
}


function runnable(element, src) {
  var offset = $(element).offset();

  offset.left += 150;
  var minTop = 60;
  var maxTop = 340;
  offset.top = (offset.top - minTop) < minTop ? minTop : offset.top - minTop;
  offset.top = offset.top > maxTop ? maxTop : offset.top;

  var $img = $('<img>')
  .addClass('image-preview')
  .offset(offset)
  .hide()
  .attr('src', src)
  .fadeIn();

  $('body').append($img);
}
