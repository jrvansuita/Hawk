class MultiSelectorDialog{

  constructor(title, list, paramName, selecteds, canEdit){
    this.list = list;
    this.selecteds = selecteds;


    this.dialog = new BaseSelectorDialog(title, canEdit);
    this._createOptions();


    this.dialog.onNegativeButton('Cancelar');
    
    if (canEdit){
      this.dialog.onPositiveButton('Selecionar',(data)=>{
        window.location.href = window.location.origin + window.location.pathname + '?'+paramName+'=' + data.join('|');
      });
    }
  }



  _createOptions(){
    var arr = Object.keys(this.list);
    this.dialog.addItem('Todos', 'all', this.selecteds == "" || this.selecteds.includes('all') , this.checkToggleAll);

    for (var i = 0; i < arr.length; i++) {
      this.dialog.addItem(arr[i],arr[i], this.selecteds.includes(arr[i]), this.checkToggleAll);
    }
  }

  checkToggleAll(el, checked){

    if ($(el).attr('name') == 'all'){
      if (checked){
        $('input:not([name="all"])').removeAttr('checked');
      }
    }else{
      $('input[name="all"]').removeAttr('checked');
    }

  }

  show(){
    this.dialog.show();
  }

}
