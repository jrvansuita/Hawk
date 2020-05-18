$(document).ready(() => {
  new FileLoader().css('dropdown').load();
});

class Dropdown {

  static on(el){
    var drop = new Dropdown($(el));
    $(el).click((e)=>{
      e.stopPropagation();
      drop.show()
    });
    return drop;
  }

  constructor(parent) {
    this.parent = parent;
    this.createMenuButton();
    this.createMenuList();
    this.onBindMouseOver();
    this.hide();
  }

  createMenuButton(){
    this.defMenuIcon = '/img/dots.png';
    this.menuIcon = $('<img>').attr('src', this.defMenuIcon).addClass('md-dots-icon');
    $(this.parent).append(this.menuIcon);
  }

  createMenuList(){
    this.holder = $('<div>').addClass('md-dropdown');
    this.list = $('<ul>');
    this.holder.append(this.list);
    $(this.parent).append(this.holder);
  }

  onBindMouseOver(){
    this.holder.mouseleave(()=>{
      if (this.onMouseLeave) this.onMouseLeave();
      this.hide();
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

  getHelper(event){
    var helper = {
      event: event,
      menuButton: this.parent,
      menuList: this.holder,
      data : this.parent.data(),
      setMenuIcon: (path, delay, greaterIcon) => {
        this.menuIcon.attr('src', path).toggleClass('greater-icon', greaterIcon);
        if (delay){
          this.parent.children().delay(delay).queue(() => {
            helper.loading(false);
          });
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
      this.holder.show();

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
    if (this.holder){
      this.holder.hide();
    }

  }
}
