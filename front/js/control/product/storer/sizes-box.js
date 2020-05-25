
var cachedSizes;


class SizesBox{

  constructor(box){
    this.box = box;
    this.initialize();
  }

  initialize(){
    this.box.click((e) => {
      e.preventDefault();
      e.stopPropagation();
      this.input();
    });
  }

  refresh(sizes){
    if (sizes && sizes.length > 0){
      this.box.empty();
      sizes.forEach((size) => {
        this.input(size);
      });
    }
  }

  setOnSizeCreated(callback){
    this.onSizeCreatedListener = callback;
    return this;
  }

  setOnSizeDeleted(callback){
    this.onSizeDeletedListener = callback;
    return this;
  }

  input(initSize){
    var $input = $('<span>').addClass('size-input');
    this.box.append($input);

    $input.click((e) => {
      e.stopPropagation(); this._onInputClicked($input);
    }).keypress((e)=>{
      if(e.which == 13) {e.preventDefault(); this._onEnterKeyPressed($input);}
    }).focusout(() => {
      var size = $input.text();

      this._onBeforeFocusOut($input, (doSubmit) => {
        if (doSubmit) {
          this._onSubmit($input);
        }else{
          this._onRemove($input);
        }
      });
    });

    $input.text(initSize);
    this._onSubmit($input);
    this._handleSizeDropdown($input);
  }

  _onInputClicked(input){
    this._onRemove(input, input.text());
  }

  _onEnterKeyPressed(input){
    this.input();
  }

  _onBeforeFocusOut(input, callback){
    if (this._sizeIsInTheBox(input)) {
      this._innerRemove(input);
    }else{
      callback(input.text().length > 0);
    }
  }

  _onSubmit(input){
    this._innerSubmit(input);

    if (this.onSizeCreatedListener && input.text()){
      this.onSizeCreatedListener(input.text());
    }
  }

  _innerSubmit(input){
    input.attr('contenteditable', input.text().length == 0);

    if (!input.text()) {
      input.focus();
    }
  }

  _onRemove(input){
    if (this.onSizeDeletedListener && this._sizeIsInTheBox(input)){
      this.onSizeDeletedListener(input.text());
    }

    this._innerRemove(input);
  }

  _innerRemove(input){
    input.remove();
  }

  _sizeIsInTheBox(input){
    var sizes = this.getSizes();

    return sizes.length && input.text() && Arr.isIn(this.getSizes(), input.text());
  }

  getSizes(){
    return $('.size-input').map((i, each) => {
      return $(each).text()
    }).toArray().filter(Boolean).slice(0, -1);
  }
  _handleSizeDropdown(input){
    this._handleCachedSizes(() => {
      new ComboBox(input, cachedSizes)
      .setAutoShowOptions(true)
      .callOnChangeEventBySelecting(true)
      .setLimit(5)
      .setOnItemBuild((item, index)=>{
        return {text : item.description, value: item.value};
      }).load();
    });
  }

  startCache(){
    this._handleCachedSizes();
    return this;
  }

  _handleCachedSizes(callback){
    if (cachedSizes){
      callback();
    }else{
      _get('/stock/storer-attr?attr=Tamanho',{}, (data) => {
        cachedSizes = data;
        if(callback) callback();
      });
    }
  }

}
