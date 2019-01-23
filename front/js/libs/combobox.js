class ComboBox{

  constructor(element, path, method){
    this.element = element;
    this.path = path;
    this.method = method;
  }

  setOnSelect(callback){
    this.callback = callback;
    return this;
  }

  select(el){
    this.options.onAutocomplete(el.name);
  }

  setAutoShowOptions(yes){
    this.autoShowOptions = yes;
    return this;
  }

  findItem(name){
    for (var i = 0; i < this.data.length; i++) {
      if (this.data[i].name == name){
        return this.data[i];
      }
    }
  }

  getOptions(){
    return this.data;
  }

  load(callback){
    $.ajax({
      url: this.path,
      type: this.method ? this.method : "get",
      success: (response) =>{
        this.handle(response);
        this.build();

        if (callback){
          callback();
        }
      },
      error: (error, message, errorThrown) =>{
        console.log(error);
      }
    });
  }

  hasSelected(){
    return this.element.val() ? true : false;
  }

  handle(data){
    this.data = data;

    this.selectorOptions = [];

    Object.keys(data).forEach((key)=>{
      this.selectorOptions[data[key].name] = null;
    });
  }

  build(){

    var options = {
      data: this.selectorOptions,
      limit: 5,
      onAutocomplete: (name)=>{
        this.element.val(name);
        this.callback(name, this.findItem(name));
      }
    };


    if (this.autoShowOptions){
      options.minLength = 0;
      options.limit = 10;
    }

    this.options = options;

    this.element.autocomplete(options);
  }
}
