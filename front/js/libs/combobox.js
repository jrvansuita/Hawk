class ComboBox{

  constructor(element, data, method){
    this.dependencies = new FileLoader().css('jquery-ui')
    .css('combobox').js('jquery-ui.min');


    this.element = element;
    this.setLimit(5);

    if (data instanceof Array){
      this.objects = data;
    }else if (typeof data === "string"){
      this.path = data;
    }else{
      this.objects = Object.keys(data)
      .map(key=>{
        return {val :data[key],
          key : key};
        });
      }

      this.method = method;
    }


    setDisabledCaption(text){
      this.disabledCaption = text;
      return this;
    }

    select(item){
      this.element.val(item ? item.label : '');

      if (this.callOnChangeBySelection) this.element.trigger("change");

      this.selectedItem = item;
      if (this.onItemSelect && item){
        this.onItemSelect(this.selectedItem, this.selectedItem.data);
      }
    }

    selectByFilter(filter){
      var options = this.getData();
      var sel = options.find(filter);

      if(sel){
        this.select(sel);
      }
    }

    setOnItemSelect(onItemSelect){
      this.onItemSelect = onItemSelect;
      return this;
    }

    setLimit(limit){
      if (limit){
        this.limit = limit || 5;
        this.minLength = 1;
      }

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

    callOnChangeEventBySelecting(b){
      this.callOnChangeBySelection = b;
      return this;
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
          type: this.method || "get",
          success: (response) =>{
            this.objects = Object.values(response);
            this.handleData(callback);
          },
          error: (error, message, errorThrown) =>{
            console.log(error);
          }
        });
      }else{
        if (this.objects.length){
          this.handleData(callback);
        }else{
          $(this.element).val(this.disabledCaption);
          $(this.element).prop('disabled', true);
        }
      }

      return this;
    }


    handleData(callback){
      this.data = [];

      this.objects.forEach((each, index)=>{
        var item = {id : index};

        if (this.onBuildItem){
          var struct = this.onBuildItem(each, index);
          item.label = struct.text;
          item.img = struct.img;
          item.data = each;
        }else if (typeof each === "string"){
          item.label = each;
        }else  if (typeof each.val === "string"){
          item.label = each.val;
          item.data = each;
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


    remove(){
      this.element.autocomplete({source: []});
    }

  }

  function buildItemLayout(item){
    var img;

    if (item.img){
      img = $('<img>').addClass('.circle').attr('src', item.img);
    }

    return $('<li>').append($('<div>').append(img, $('<span>').text(item.label)));

  }
