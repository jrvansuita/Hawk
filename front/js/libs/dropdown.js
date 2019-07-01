class MaterialDropdown {
  constructor(parent, event, bindMousePosition, fixed) {
    this.remove();

    var $div = $('<div>').addClass('md-dropdown');
    $(parent).append($div);

    if (bindMousePosition){
      this.items = $('<ul>').css('left', event.pageX).css('top', event.pageY - 110);
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

  addItem(icon, label, onClick, redirect, blank){
    var $icon = $('<img>').attr('src', icon);
    var $li = $('<li>').append($('<a>').attr('href',redirect ? redirect : '#').attr('target', blank ? '_blank' : '_self').append($icon, label));

    if (onClick){
      $li.click(onClick);
    }

    this.items.append($li);
  }


  show(){
    this.items.fadeIn(400);

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
