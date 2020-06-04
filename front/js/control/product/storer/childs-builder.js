class ChildsBuilder{

  constructor(holder){
    this.holder = holder;
  }

  setDefaultOnChange(){
    return this.setOnChange(function () {
      product._Skus.forEach((each) => {
        if (each.codigo == $(this).data('sku')){
          each[$(this).data('tag')] = $(this).val();
          console.log();
          each.active = true;
        }
      });
    });
  }

  clear(){
    this.holder.find("tr:gt(0)").empty();
  }

  load(childs, force){
    if (force || this.getSkus().join('') != childs.map(e => {return e.codigo}).join('')){
      this.clear();

      childs.forEach((child) => {
        this.addChild(child);
      });
    }
  }

  setOnChange(listener){
    this.onChange = listener;
    return this;
  }

  isEmpty(){
    return this.currentSku == undefined;
  }

  getSkus(){
    return $('.child-sku-line').map((i, each) => {
      return $(each).text()
    }).toArray().filter(Boolean);
  }

  addChild(item){

    return this.line(item.codigo)
    .label(item.codigo, 'child-sku-line')
    .int('Ean', 'gtin', item.gtin || '', '0000000000000')
    .float('Peso', 'peso', Floa.def(item.peso) || Floa.def(item.pesoLiq), '0,000')
    .int('Largura', 'larguraReal', Num.def(item.larguraReal), '0,000')
    .int('Altura', 'alturaReal', Num.def(item.alturaReal), '0,000')
    .int('Comprimento', 'comprimentoReal', Num.def(item.comprimentoReal), '0,000');
  }

  removeChild(sku){
    $('tr[data-sku="'+sku+'"]').fadeOut(200, function() {
      $(this).remove();
    });
  }

  line(sku){
    this.lastLine = $('<tr>').attr('data-sku', sku);
    this.currentSku = sku;
    this.holder.append(this.lastLine);
    return this;
  }

  label(label, addClass=''){
    return this.col($('<span>').addClass('static-label ' + addClass).append(label));
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
