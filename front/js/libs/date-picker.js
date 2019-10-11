/*jshint esversion: 8 */

class DatePicker{

  constructor(){
    this.binders = [];

    this.dependencies = new FileLoader().css('material-date-picker.min')
    .css('date-picker').js('material-date-picker.min');

    this.showButtons(true)
    .left(0)
    .top(0);
  }

  holder(holder, bindOnClick){
    this.holderEl = $(holder);

    if (this.holderEl){
      this.input = $('<input>').css('display','none');

      this.holderEl.before(this.input);

      if (bindOnClick){
        this.holderEl.click(()=>{
          this.picker.open();
        });
      }
    }

    return this;
  }

  getPickerBox(){
    return  $("div[guid='"+this.picker.data('guid')+"']");
  }

  adjustPicker(){
    var pickerBox = this.getPickerBox();

    var top = this.holderEl.offset().top + this.holderEl.outerHeight(true) + this.addTop;
    var left = this.holderEl.offset().left + this.addLeft;

    pickerBox.css('left', left)
    .css('top', top);

    if (!this.displayButtons){
      pickerBox.find(".gj-button-md").hide();
    }
  }

  showButtons(show){
    this.displayButtons = show;
    return this;
  }

  left(left){
    this.addLeft = left;
    return this;
  }


  top(top){
    this.addTop = top;
    return this;
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
    return this._convertDate(this.getPickerBox().attr('selectedday'));
  }

  getDate(){
    return Dat.format(this.getSelected());
  }

  _convertDate(str){
    var val = str.split('-');
    return new Date(Date.UTC(val[0], val[1], val[2]));
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
          this.onChange(this.getDate(), this.getSelected());
        }
      },
      select: (e, type)=> {
        if (this.onSelect){
          this.onSelect(this.getDate(), this.getSelected());
        }
      },
      open: ()=>{
        this.adjustPicker();
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
