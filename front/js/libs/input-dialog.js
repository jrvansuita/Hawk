class InputDialog {
  constructor(title, placeholder) {
    this.modal = $('<div>').addClass('ms-modal');
    this.holder = $('<div>').addClass('ms-holder');

    var $title = $('<label>').addClass('ms-title').text(title);

    var $inputHolder = $('<div>').addClass('material-input-holder');
    var $input = $('<input>').attr('type', 'text').attr('required', '').addClass('ms-input');
    this.input = $input;

    var $bar = $('<span>').addClass('bar');
    var $label = $('<label>').text(placeholder);

    $inputHolder.append($input, $bar, $label);

    this.holder.append($title, $inputHolder);
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
        callback(this.input.val());
      }

      this.modal.remove();
    });

    this.buttons.append(button);

    return this;
  }

  show(){
    $('body').append(this.modal);
    this.modal.fadeIn(400);
  }

}
