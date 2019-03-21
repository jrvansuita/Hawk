class MaterialDropdown {
  constructor(parent, event, pLeft) {
    this.remove();

    var $div = $('<div>').addClass('md-dropdown');
    $(parent).append($div);

    var left = pLeft ? pLeft : -10;

    this.items = $('<ul>').css('left', event.pageX + left).css('top', event.pageY - 110);
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
