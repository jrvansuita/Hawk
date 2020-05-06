$(document).ready(() => {
  new FileLoader().css('material-dropdown').load();
});

class MaterialDropdown {
  constructor(parent, event, bindMousePosition, fixed) {

    this.remove();

    this.holder = $('<div>').addClass('md-dropdown');
    $(parent).append(this.holder);

    this.items = $('<ul>');


    if (bindMousePosition){
      //this.top = event.pageY -10
      //this.left = event.pageX -10;

      this.top = $(parent).offset().top;
      this.left = $(parent).offset().left;

      this.holder.css('position', 'inherit');
    }else{
      if (fixed){
        this.holder.css('position', 'fixed');
      }else{
        this.holder.css('position', 'static');
      }
      this.items = $('<ul>');
    }


    this.holder.append(this.items);

    this.holder.hide();

    this.holder.mouseleave(()=>{
      //this.holder.hide();
      if (this.onMouseLeave){
        this.onMouseLeave();
      }

      this.remove();
    });
  }

  hasOptions(){
    return this._hasOptions;
  }

  setMenuPosAdjust(addX, addY){
    this.top = this.top + addY;
    this.left = this.left + addX;
    return this;
  }

  setOnAnyOptionsClick(callback){
    this.onAnyOptionClick = callback;
    return this;
  }


  addItem(icon, label, onClick, redirect, blank){
    var $icon = icon ? $('<img>').attr('src', icon) : null;
    var $li = $('<li>').append($('<a>').attr('href',redirect ? redirect : '#').attr('target', blank ? '_blank' : '_self').append($icon, label));

    $li.click((e)=>{
      if (onClick){
        onClick(e);
      }

      if (this.onAnyOptionClick){
        this.onAnyOptionClick(e);
      }
    });

    this.items.append($li);
    this._hasOptions = true;

    return this;
  }


  show(callback){

    if (this.hasOptions()){
      this.holder.fadeIn(400);

      if (this.top + this.left > 0){
        this.items.css('left', this.left).css('top', this.top);
      }


      $('.md-dropdown li').click((e) =>{
        this.holder.remove();
        e.stopPropagation();
      });

      if (callback){
        this.callback(false);
      }
    }else{
      if (callback){
        this.callback(false);
      }
    }

  }

  onMouseLeave(onMouseLeave){
    this.onMouseLeave = onMouseLeave;
  }

  remove(){
    if (this.holder){
      this.holder.remove();
    }

    $('.md-dropdown').remove();
  }
}
