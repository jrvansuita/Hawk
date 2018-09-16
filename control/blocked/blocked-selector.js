class BlockedSelector{

  constructor(){
    this.dialog = new SelectorDialog('Selecione o Motivo do Bloqueio');
    this._createOptions();
    this.dialog.onButton('Cancelar');
  }

  onSelect(callback){
    this.dialog.onSelect((tag)=>{
       callback(this.getReason(tag));
    });

    return this;
  }

  _createOptions(){
    this.options = [];
    this.options.push(new BlockedReason('Cliente Solicitou Estorno', '/img/money-back.png'));
    this.options.push(new BlockedReason('Aguardando Atualização de Cadastro', '/img/user-update.png'));
    this.options.push(new BlockedReason('Outro Motivo', '/img/three-dots.png'));
  }

  getReason(index){
    return this.options[index];
  }

  show(){
    this.options.forEach((item, index)=>{
      this.dialog.addItem(item.icon, item.label, index);
    });

    this.dialog.show();
  }

}


class BlockedReason{
  constructor(label, icon){
    this.label = label;
    this.icon = icon;
  }
}
