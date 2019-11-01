class MockupSelector{

  constructor(){
    this.dependencies = new FileLoader()
    .css('material-selector-dialog').js('selector-dialog').js('request-helper');
  }

  onSelect(callback){
    this.onSelectListener = callback;
    return this;
  }

  _createOptions(callback){
    _get('/get-all-mockups', null, (all) => {
      this.options = all;
      all.forEach((each, index) => {
        this.dialog.addItem('img/mockup.png', each.name + ' ' + each.width + 'x' + each.height, each._id);
      });

      callback();
    });
  }

  async show(){
    await this.dependencies.load();

    this.dialog = new SelectorDialog('Selecione o Modelo');

    this._createOptions(() => {
      this.dialog.onButton('Cancelar');
      this.dialog.onSelect(this.onSelectListener);

      this.dialog.show();
    });
  }

}


class Item{
  constructor(label,  _id){
    this.label = label;
    this._id = _id;
  }
}
