/*jshint esversion: 8 */

class RangeDatePicker{

  constructor(){
    this.dependencies = new FileLoader().js('date-picker');
  }

  holder(holder, bindOnClick){
    this.holderEl = $(holder);
    return this;
  }

  setOnRangeChange(callback){
    this.onRangeChange = callback;
    return this;
  }

  async load(){
    await this.dependencies.load();


    new DatePicker()
    .left(-225)
    .showButtons(false)
    .holder(this.holderEl, true)
    .setOnSelect((s, date)=>{
      this.from = date;
    })
    .load()
    .then(binder => this.fromPicker = binder);


    new DatePicker()
    .holder(this.holderEl, true)
    .setOnChange((s, date)=>{
      this.to = date;
      if (this.onRangeChange){
        this.onRangeChange(this.from, this.to);
      }
    })
    .setOnClose(()=>{
      this.fromPicker.close();
    })
    .load()
    .then(binder => this.toPicker = binder);



    return this;
  }


}
