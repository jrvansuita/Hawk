class SaleStatusDialog{

  constructor(status){
    this.status = status;

    this.dialog = new SelectorDialog('Alterar Status do Pedido');
    this.dialog.onButton('Cancelar');
    this._addOptions();
  }

  onItemSelect(callback){
    this.dialog.onSelect((item) => {
      callback(item);
    });
    return this;
  }

  show(){
    this.dialog.show();
  }

  _addOptions(){
    if(this.status == 'pending_payment'){
      this.dialog.addItem('/img/checked.png','Pagamento Confirmado', 'processing');
      this.dialog.addItem('/img/blocked.png','Segurar/Bloquear', 'holded');
    }
    else if(this.status == 'processing'){
      this.dialog.addItem('/img/checked.png','Pagamento Confirmado', 'processing');
      this.dialog.addItem('/img/wait.png','Aguardando Pagamento', 'pending_payment');
      this.dialog.addItem('/img/blocked.png','Segurar/Bloquear', 'holded');
      this.dialog.addItem('/img/block.png','Reprovado/Expirado', 'canceled');
    }
    else if(this.status == 'complete' || this.status == 'separation'){
      this.dialog.addItem('/img/transport/default.png','Em Trânsito', 'ip_in_transit');
      this.dialog.addItem('/img/hold-box.png','Entregue', 'ip_delivered');
      this.dialog.addItem('/img/blocked.png','Segurar/Bloquear', 'holded');
      this.dialog.addItem('/img/block.png','Cancelado', 'canceled');
    }
    else if(this.status == 'ip_in_transit'){
      this.dialog.addItem('/img/hold-box.png','Entregue', 'ip_delivered');
      this.dialog.addItem('/img/block.png','Cancelado', 'canceled');
    }
    else if(this.status == 'waiting_antifraud_analisys'){
      this.dialog.addItem('/img/checked.png','Pagamento Confirmado', 'processing');
      this.dialog.addItem('/img/block.png','Cancelado', 'canceled');
    }
    else if(this.status == 'holded'){
      this.dialog.addItem('/img/checked.png','Pagamento Confirmado', 'processing');
      this.dialog.addItem('/img/block.png','Cancelado', 'canceled');
    }
  }
}

class SaleStatusObsDialog extends InputDialog{
  make(callback){
    this.checkEmptyInputSubmit(true)
    .onNegativeButton('Cancelar', () => {})
    .onPositiveButton('Alterar', (text) => {
      callback(text);
    }).show();

  }
}
