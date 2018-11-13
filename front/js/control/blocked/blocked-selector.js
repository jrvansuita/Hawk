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
    this.options.push(new BlockedReason('Cliente Solicitou Estorno', 991, '/img/money-back.png'));
    this.options.push(new BlockedReason('Agaurdando Alteração no Pedido',992, '/img/update-sale.png'));
    this.options.push(new BlockedReason('Aguardando Atualização de Cadastro',  993, '/img/user-update.png'));
    this.options.push(new BlockedReason('Produto sem estoque', 994, '/img/box.png'));
    this.options.push(new BlockedReason('Pedido Duplicado', 995, '/img/duplicate.png'));
    this.options.push(new BlockedReason('Outro Motivo', 101, '/img/three-dots.png'));
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
  constructor(label,  tag, icon){
    this.label = label;
    this.icon = icon;
    this.tag = tag;
  }
}
