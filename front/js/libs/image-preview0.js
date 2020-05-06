class ImagePreview{
  constructor(element){
    this.element = element;
  }

  delay(num){
    this.delay = num;
    return this;
  }

  hover(over, leave){

    this.element.mouseenter(()=> {
      cancel = false;
      if (over){
        over(this);
      }
    }).mouseleave(
      ()=>{
        cancel = true;

        if (leave){
          leave(this);
        }else{
          this.remove();
        }
      });


      return this;
    }

    show(src){
      if (src && this.element){
        var _self = this;

        setTimeout(()=>{
          if (!cancel){
            runnable(_self.element, src);
          }
        }, this.delay || 500);
      }
    }

    remove(){
      if ($(this).is(":visible")){
        $('.image-preview').fadeOut(200, function() {
          $(this).remove();
        });
      }else{
        $('.image-preview').remove();
      }

    }
  }


  var cancel = false;


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

    $('.image-preview').remove();
    $('body').append($img);

    /*if ($('.image-preview').is(":visible")){
      setTimeout(()=>{
        $('.image-preview').remove();
      },
      2000);
    }*/
  }
