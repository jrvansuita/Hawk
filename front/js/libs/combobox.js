class ComboBox{

  constructor(element, pathOrArr, method){
    this.dependencies = new FileLoader().css('jquery-ui')
    .css('combobox').js('jquery-ui.min');


    this.element = element;
    this.limit = 5;
    this.minLength = 1;

    if (pathOrArr instanceof Array){
      this.objects = pathOrArr;
    }else{
      this.path = pathOrArr;
    }

    this.method = method;
  }

  select(item){
    this.element.val(item.value);

    this.selectedItem = item;
    if (this.onItemSelect){
      this.onItemSelect(this.selectedItem, this.selectedItem.data);
    }
  }

  setOnItemSelect(onItemSelect){
    this.onItemSelect = onItemSelect;
    return this;
  }

  setOnItemBuild(onBuildItem){
    this.onBuildItem = onBuildItem;
    return this;
  }

  setAutoShowOptions(){
    this.limit = 10;
    this.minLength = 0;
    return this;
  }

  /* Focus element and set Enter key to show options */
  pressEnterToSelect(){
    this.element.focus();
    this.element.select();

    this.element.autocomplete('close');

    this.element.one("keyup", (e)=> {
      if (e.which == 13){
        this.element.val("");
        this.element.focus();
        $('li').attr('tabindex','0');
      }
    });
  }


  getSelectedItem(){
    return this.selectedItem;
  }

  getSelectedObject(){
    return  this.selectedItem && this.selectedItem.data ? this.selectedItem.data : this.selectedItem;
  }



  getData(){
    return this.data;
  }

  async load(callback){
    await this.dependencies.load();

    if (this.path){
      $.ajax({
        url: this.path,
        type: this.method ? this.method : "get",
        success: (response) =>{
          this.objects = Object.values(response);
          this.handleData(callback);
        },
        error: (error, message, errorThrown) =>{
          console.log(error);
        }
      });
    }else{
      this.handleData(callback);
    }

    return this;
  }


  handleData(callback){
    this.data = [];

    this.objects.forEach((each, index)=>{
      var item = {id : index};

      if (this.onBuildItem){
        var struct = this.onBuildItem(each, index);
        item.value = struct.text;
        item.img = struct.img;
        item.data = each;
      }else{
        item.value = each;
      }

      this.data.push(item);
    });

    this.build();

    if (callback){
      callback();
    }
  }

  build(){

    var options = {
      minLength: this.minLength,
      source: (request, response)=> {
        var results = $.ui.autocomplete.filter(this.data, request.term);
        response(results.slice(0, this.limit));
      },
      select: (event, ui)=>{
        this.select(ui.item);
      }
    };

    this.instance = this.element.autocomplete(options);

    this.element.autocomplete('instance')._renderItem = (ul, item)=>{
      return buildItemLayout(item).appendTo(ul);
    };

    if (this.minLength == 0){
      this.instance.focus(function () {
        $(this).autocomplete("search", "");
      });
    }
  }

}

function buildItemLayout(item){
  var img;

  if (item.img){
    img = $('<img>').addClass('.circle').attr('src', item.img);
  }

  return $('<li>').append($('<div>').append(img, $('<span>').text(item.value)));

}
