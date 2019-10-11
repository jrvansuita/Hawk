
class DatePicker{

  constructor(){
    this.binders = [];

    this.dependencies = new FileLoader().css('material-date-picker.min')
    .css('date-picker').js('material-date-picker.min');
  }

  holder(holder, bindOnClick){
    this.holderEl = $(holder);

    if (this.holderEl){
      this.input = $('<input>').css('display','none');

      this.holderEl.after(this.input);

      if (bindOnClick){
        this.holderEl.click(()=>{
          this.picker.open();
        });
      }
    }

    return this;
  }

  adjustPickerPosition(){
    var guid = this.picker.data('guid');

    var pickerBox = $("div[guid='"+guid+"']");

    var top = this.holderEl.offset().top + this.holderEl.outerHeight(true);
    var left = this.holderEl.offset().left + (this.holderEl.outerWidth(true));

    pickerBox.css('left', left)
    .css('top', top);
  }

  setOnChange(callback){
    this.onChange = callback;
    return this;
  }

  setOnSelect(callback){
    this.onSelect = callback;
    return this;
  }

  setOnClose(callback){
    this.onClose = callback;
    return this;
  }

  getSelected(){
    var val = this.picker.val().split('/');
    return new Date(Date.UTC(val[2], parseInt(val[1])-1, parseInt(val[0])+1));
  }

  async load(){
    await this.dependencies.load();

    this.picker = this.input.datepicker({
      modal: false,
      header: true,
      footer: true,
      format: 'dd/mm/yyyy',
      change: (e)=>{
        if (this.onChange){
          this.onChange(this.picker.val(), this.getSelected());
        }
      },
      select: (e, type)=> {
        if (this.onSelect){
          this.onSelect(this.picker.val(), this.getSelected());
        }
      },
      open: ()=>{
        this.adjustPickerPosition();
      },
      close: (e) =>{
        if (this.onClose){
          this.onClose(e);
        }
      }
    });

    return this.picker;
  }


}
