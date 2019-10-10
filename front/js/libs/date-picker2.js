
class DatePicker{

  constructor(){
    this.binders = [];

    this.dependencies = new FileLoader().css('material-date-picker.min')
    .css('date-picker').js('material-date-picker.min');
  }

  onClickOpen(el){
    $(el).click(()=>{
      this.picker.open();
    });

    return this;
  }

  setOnChange(callback){
    this.onChange = callback;
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
    var splitted = $(selector).datepicker().value().split('-');
    return Date.UTC(splitted[0], splitted[1], splitted[2]);
  }

  async bind(input, defDate){
    await this.dependencies.load();

    this.picker = $(input).datepicker({
      modal: false,
      header: true,
      footer: true,
      format: 'dd/mm/yyyy',
      change: (e) =>{
        if (this.onChange)
        this.onChange(e);
      },
      select: (e, type)=> {
        if (this.onSelect)
        this.onSelect(e);
      },
      close: (e) =>{
        if (this.onClose)
        this.onClose(e);
      }
    });

    return this.picker;
  }



}
