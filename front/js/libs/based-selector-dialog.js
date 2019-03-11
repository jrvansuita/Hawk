class BasedSelectorDialog{

  constructor(title, list, paramName, selecteds){
    this.list = list;
    this.selecteds = selecteds;

    this.dialog = new MuiltSelectorDialog(title);
    this._createOptions();
    this.dialog.onNegativeButton('Cancelar')
    .onPositiveButton('Selecionar',(data)=>{
        window.location.href = window.location.origin + window.location.pathname + '?'+paramName+'=' + data.join('|');
    });
  }



  _createOptions(){
    var arr = Object.keys(this.list);
    this.dialog.addItem('Todos', 'all');

    for (var i = 0; i < arr.length; i++) {
      this.dialog.addItem(arr[i],arr[i], this.selecteds.includes(arr[i]));
    }
  }

  show(){
    this.dialog.show();
  }

}
