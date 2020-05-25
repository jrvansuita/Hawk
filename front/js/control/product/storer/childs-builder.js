class ChildsBuilder{

  constructor(holder){
    this.holder = holder;
    this.skus = {};
  }

  loadChilds(items){
    this.holder.find("tr:gt(0)").empty();

    items.forEach((item) => {
      this.addChild(item);
    });
  }

  loadSizes(sku, sizes){
    this.holder.find("tr:gt(0)").empty();

    sizes.forEach((size) => {
      this.addChild({codigo: sku + '-' + size, active: true});
    });
  }

  setOnChange(listener){
    this.onChange = listener;
    return this;
  }

  isEmpty(){
    return this.currentSku == undefined;
  }

  getSkus(){
    return Object.keys(this.skus);
  }

  getSizes(){
    return this.getSkus().map((e) => {
      return e.split('-').pop();
    })
  }

  addChild(item){

    return this.line(item.codigo)
    .label(item.codigo)
    .int('Ean', 'gtin', item.gtin || '', '0000000000000')
    .float('Peso', 'peso', Floa.def(item.peso) || Floa.def(item.pesoLiq), '0,000')
    .int('Largura', 'largura', Num.def(item.largura), '0,000')
    .int('Altura', 'altura', Num.def(item.altura), '0,000')
    .int('Comprimento', 'comprimento', Num.def(item.comprimento), '0,000');
  }

  removeChild(sku){
    delete this.skus[sku];

    $('tr[data-sku="'+sku+'"]').fadeOut(200, function() {
      $(this).remove();
    });
  }

  line(sku){
    this.lastLine = $('<tr>').attr('data-sku', sku);
    this.currentSku = sku;
    this.skus[sku] = sku;
    this.holder.append(this.lastLine);
    return this;
  }

  label(label){
    return this.col($('<span>').addClass('static-label').append(label));
  }

  input(...params){
    return this.col(this._input(...params));
  }

  int(...params){
    this.applyValue = (input, value) => {
      input.val(Num.int(value)).attr('onkeypress',"return Num.isNumberKey(event);");
    }

    return this.input(...params);
  }

  float(...params){
    this.applyValue = (input, value) => {
      input.val(Floa.weight(value)).attr('onkeypress', "return Floa.isFloatKey(event);");
    }

    return this.input(...params);
  }

  col(content){
    this.lastLine.append($('<td>').append(content));
    return this;
  }

  _input(label, tag, value, placeholder){
    var $input = $('<input>')
    .addClass('editable-input')
    .data('tag', tag)
    .attr('data-sku', this.currentSku)
    .attr('size', placeholder.length + 3)
    .attr('placeholder', placeholder)
    .on("click", function () {
      $(this).select();
    });

    if(this.applyValue){
      this.applyValue($input, value);
    }else{
      $input.val(value);
    }

    if (this.onChange){
      $input.change(this.onChange).trigger('change');
    }

    return $input;
  }

}
