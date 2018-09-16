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
      callback();
    });

    var div = $('<div>').addClass('ms-buttons-holder').append(button);

    this.holder.append(div);
  }

  onSelect(callback){
    this.selectListener = callback;
  }

  addItem(icon, label, tag){
    var $icon = $('<img>').attr('src', icon);
    var $label = $('<label>').text(label);
    var $span = $('<span>').append($icon, $label);

    var $li = $('<li>').append($span).click((e)=>{
      this.selectListener(tag);
      this.modal.remove();
    });

    this.items.append($li);
  }


  show(){
    $('body').append(this.modal);
    this.modal.fadeIn(400);
  }

}
