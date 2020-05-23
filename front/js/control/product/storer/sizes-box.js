
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

  input(size){
    var $input = $('<span>').addClass('size-input');
    this.box.append($input);

    $input.click((e) => {
      e.stopPropagation(); this._onInputClicked($input);
    }).keypress((e)=>{
      if(e.which == 13) {e.preventDefault(); this._onEnterKeyPressed($input);}
    }).focusout(() => {
      if ($input.text()) {
        this._onSubmit($input);
      }else{
        this._onRemove($input);
      }
    });

    if (size) { $input.text(size) } else{ $input.attr('contenteditable', true).focus() }

    this._handleSizeDropdown($input);
  }

  _onInputClicked(input){
    this._onRemove(input);
  }

  _onEnterKeyPressed(input){
    this.input();
  }

  _onSubmit(input){
    input.attr('contenteditable', false);

    if (this.onSizeCreatedListener){
      this.onSizeCreatedListener(input.text())
    }
  }

  _onRemove(input){
    if (this.onSizeDeletedListener && input.text()){
      this.onSizeDeletedListener(input.text())
    }

    input.remove();
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
