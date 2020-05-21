$(document).ready(() => {
  new FileLoader().css('dropdown').load();
});

class Dropdown {

  static on(holder, ...params){

    var drop = new Dropdown($(holder), ...params);
    $(el).click((e)=>{
      e.stopPropagation();
      drop.show()
    });

    return drop;
  }

  constructor(holder, createDots=true) {
    this.holder = holder;

    if (createDots){
      this.createMenuButton();
    }

    this.createMenuList();
    this.onBindMouseOver();
    this.hide();
  }

  createMenuButton(){
    this.defMenuIcon = '/img/dots.png';
    this.menuIcon = $('<img>').attr('src', this.defMenuIcon).addClass('md-dots-icon');
    $(this.holder).append(this.menuIcon);
  }

  createMenuList(){
    this.dropdown = $('<div>').addClass('md-dropdown');
    this.list = $('<ul>');
    this.dropdown.append(this.list);
    $(this.holder).append(this.dropdown);
  }

  onBindMouseOver(){
    this.dropdown.mouseleave(()=>{
      if (this.onMouseLeave) this.onMouseLeave();
      this.hide();
    });
  }

  hasOptions(){
    return this._hasOptions;
  }

  bindMousePos(){
    this.setMenuPos($(parent).offset().top, $(parent).offset().left);
    this.dropdown.css('position', 'inherit');

    return this;
  }

  setMenuPos(addX, addY){
    this.top = this.top + addY;
    this.left = this.left + addX;
    return this;
  }

  setOnAnyOptionsClick(callback){
    this.onAnyOptionClick = callback;
    return this;
  }

  getHelper(event){
    var helper = {
      event: event,
      holder: this.holder,
      parent: this.holder.parent(),
      dropDown: this.dropdown,
      data : this.holder.data(),
      setMenuIcon: (path, delay, greaterIcon) => {
        if (this.menuIcon){
          this.menuIcon.attr('src', path).toggleClass('greater-icon', greaterIcon);
          if (delay){
            this.holder.children().delay(delay).queue(() => {
              helper.loading(false);
            });
          }
        }
      },
      loading : (is = true) => {
        this.isLoading = is;
        helper.setMenuIcon(is ? '/img/loader/circle.svg' : '/img/dots.png', 0, is);
      },

      finished : (success) => {
        if (success) {helper.success()} else{helper.error()}
      },

      success: () => {
        helper.setMenuIcon('/img/checked.png', 3000, true);
      },
      error: () => {
        helper.setMenuIcon('/img/error.png', 3000, true);
      }
    };

    return helper;
  }

  item(icon, label, onClick, redirect, blank){
    var $icon = icon ? $('<img>').attr('src', icon) : null;
    var $li = $('<li>').append($('<a>').attr('href',redirect ? redirect : '#').attr('target', blank ? '_blank' : '_self').append($icon, label));

    $li.click((e)=>{
      if (onClick){
        onClick(this.getHelper(e));
      }

      if (this.onAnyOptionClick){
        this.onAnyOptionClick(e);
      }
    });

    this.list.append($li);
    this._hasOptions = true;

    return this;
  }


  show(callback){
    if (this.hasOptions() && !this.isLoading){
      $('.md-dropdown').hide();

      this.dropdown.show();

      if (this.top + this.left > 0){
        this.list.css('left', this.left).css('top', this.top);
      }

      $('.md-dropdown li').click((e) =>{
        this.hide();
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

  hide(){
    if (this.dropdown){
      this.dropdown.hide();
    }
  }
}
