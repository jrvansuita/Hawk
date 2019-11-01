class SelectorDialog {
  constructor(title) {
    this.modal = $('<div>').addClass('ms-modal');
    this.holder = $('<div>').addClass('ms-holder');
    this.items = $('<ul>').addClass('ms-items');

    var $title = $('<label>').addClass('ms-title').text(title);

    this.holder.append($title, this.items);
    this.modal.append(this.holder);
  }

  onButton(label, callback){
    var button = $('<label>').addClass('ms-button material-ripple').text(label).click(()=>{
      this.modal.remove();
      if (callback){
        callback();
      }
    });

    var div = $('<div>').addClass('ms-buttons-holder').append(button);

    this.holder.append(div);
  }

  onSelect(callback){
    this.selectListener = callback;
  }

  addItem(icon, label, tag){
    var el = [];

    if (icon){
      el.push($('<img>').attr('src', icon));
    }

    el.push($('<label>').text(label));
    var $span = $('<span>').append(el);

    var $li = $('<li>').append($span).click((e)=>{
      this.modal.remove();
      if(this.selectListener){
        this.selectListener(tag);
      }
    });

    this.items.append($li);
  }


  show(){
    $('body').append(this.modal);
    this.modal.fadeIn(400);
  }

}
