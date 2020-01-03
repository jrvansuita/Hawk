class MultiSelectorDialog{

  constructor(title, list, paramName, selecteds, canEdit, addAllOption, isRadio){
    this.list = list;
    this.selecteds = selecteds;
    this.addAllOption = addAllOption;



    this.dialog = new BaseSelectorDialog(title, canEdit);
    this.dialog.isRadioButton(isRadio);
    this._createOptions();



    this.dialog.onNegativeButton('Cancelar');

    if (canEdit){
      this.dialog.onPositiveButton('Selecionar',(data)=>{
        window.location.href = window.location.origin + window.location.pathname + '?'+paramName+'=' + data.join('|');
      });
    }
  }


  setVerticalDispay(isVertical){
    this.dialog.setVerticalDispay(isVertical);
    return this;
  }

  _createOptions(){
    var arr = Object.keys(this.list);

    var isArray = this.list instanceof Array;


    if (this.addAllOption){
      this.dialog.addItem('Todos', 'all', this.selecteds == "" || this.selecteds.includes('all') , this.checkToggleAll);
    }

    for (var i = 0; i < arr.length; i++) {
      this.dialog.addItem(isArray ? arr[i] : this.list[arr[i]], arr[i], this.selecteds.includes(arr[i]), this.checkToggleAll);
    }
  }

  checkToggleAll(el, checked){

    if ($(el).attr('name') == 'all'){
      if (checked){
        $('.ms-choices input:not([name="all"])').removeAttr('checked');
      }
    }else{
      $('.ms-choices input[name="all"]').removeAttr('checked');
    }

  }

  show(){
    this.dialog.show();
  }

}
