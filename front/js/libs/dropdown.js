class MaterialDropdown {
  constructor(parent, event, bindMousePosition, fixed) {
    this.remove();

    var $div = $('<div>').addClass('md-dropdown');
    $(parent).append($div);

    this.items = $('<ul>');


    if (bindMousePosition){
      this.top = event.pageY -10
      this.left = event.pageX -10;

      $div.css('position', 'inherit');
    }else{
      if (fixed){
        $div.css('position', 'fixed');
      }else{
        $div.css('position', 'static');
      }
      this.items = $('<ul>');
    }


    $div.append(this.items);

    this.items.hide();

    $div.mouseleave(function(){
      $div.remove();
      if (this.onMouseLeave){
        this.onMouseLeave();
      }
    });
  }



  setMenuPosAdjust(addX, addY){
    this.top = this.top + addY;
    this.left = this.left + addX;
    return this;
  }


  addItem(icon, label, onClick, redirect, blank){
    var $icon = $('<img>').attr('src', icon);
    var $li = $('<li>').append($('<a>').attr('href',redirect ? redirect : '#').attr('target', blank ? '_blank' : '_self').append($icon, label));

    if (onClick){
      $li.click(onClick);
    }

    this.items.append($li);

    return this;
  }


  show(){
    this.items.fadeIn(400);

    if (this.top + this.left > 0){
      this.items.css('left', this.left).css('top', this.top);
    }


    $('.md-dropdown li ').click((e) =>{
      this.remove();
      e.stopPropagation();
    });
  }

  onMouseLeave(onMouseLeave){
    this.onMouseLeave = onMouseLeave;
  }

  remove(){
    $('.md-dropdown').remove();
  }
}
