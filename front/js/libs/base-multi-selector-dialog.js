class BaseSelectorDialog {
  constructor(title) {
    this.modal = $('<div>').addClass('ms-modal');
    this.holder = $('<div>').addClass('ms-holder');
    this.items = $('<div>').addClass('ms-choices');

    var $title = $('<label>').addClass('ms-title').text(title);

    this.holder.append($title, this.items);
    this.modal.append(this.holder);

    this.buttons = $('<div>').addClass('ms-buttons-holder');
    this.holder.append(this.buttons);
  }

  onNegativeButton(label, callback){
    var button = $('<label>').addClass('ms-button material-ripple').text(label).click(()=>{
      this.modal.remove();
      if (callback){
        callback();
      }
    });

    this.buttons.append(button);

    return this;
  }

  onPositiveButton(label, callback){
    var button = $('<label>').addClass('ms-button material-ripple').text(label).click(()=>{

      if (callback){

        var selecteds = $('.pure-material-checkbox input:checkbox:checked').map(function() {
          return this.name;
        });

        var arr = selecteds.get();

        if (arr.length > 0){
          callback(arr);
        }
      }

      this.modal.remove();
    });

    this.buttons.append(button);

    return this;
  }

  addItem(label, tag, checked, onCheck){
    var $checkbox = $('<label>').addClass('pure-material-checkbox').attr('title',label);
    var input = $('<input>').attr('type', 'checkbox').attr('name', tag);
    var title = $('<span>').text(label);

    $checkbox.append(input, title);

    this.items.append($checkbox);

    if (checked){
      input.attr('checked', 'checked');
    }

    input.change(function() {
      if (onCheck){
        onCheck(this, this.checked);
      }
    });

    return this;
  }


  show(){
    $('body').append(this.modal);
    this.modal.fadeIn(400);
  }

}
