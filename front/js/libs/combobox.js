class ComboBox {
  constructor(element, data, method) {
    this.dependencies = new FileLoader().css('jquery-ui').css('combobox').js('jquery-ui.min');

    this.element = element;
    this.setLimit(5);
    this.setData(data);

    this.method = method;
  }

  setData(data) {
    if (data instanceof Array) {
      this.objects = data;
    } else if (typeof data === 'string') {
      this.path = data;
    } else if (typeof data === 'object' && data !== null) {
      this.objects = Object.keys(data).map(key => {
        return {
          val: data[key],
          key: key,
        };
      });
    }
  }

  fromEnum(tag) {
    this.path = '/enum?tag=' + tag;
    this.method = 'get';
    this.enumMode = true;

    return this;
  }

  setDisabledCaption(text) {
    this.disabledCaption = text;
    return this;
  }

  select(item) {
    this.element.val(item ? item.value || item.label : '');

    this.selectedItem = item;
    if (this.onItemSelect && item) {
      this.onItemSelect(this.selectedItem, this.selectedItem.data);
    }
  }

  selectByFilter(filter) {
    var options = this.getData();
    var sel = options.find(filter);

    if (sel) {
      this.select(sel);
    }
  }

  setOnItemSelect(onItemSelect) {
    this.onItemSelect = onItemSelect;
    return this;
  }

  setLimit(limit) {
    if (limit) {
      this.limit = limit || 5;
      this.minLength = 1;
    }

    return this;
  }

  setOnItemBuild(onBuildItem) {
    this.onBuildItem = onBuildItem;
    return this;
  }

  setAutoShowOptions() {
    this.limit = 10;
    this.minLength = 0;
    return this;
  }

  /* Focus element and set Enter key to show options */
  pressEnterToSelect() {
    this.element.focus();
    this.element.select();

    this.element.autocomplete('close');

    this.element.one('keyup', e => {
      if (e.which == 13) {
        this.element.val('');
        this.element.focus();
        $('li').attr('tabindex', '0');
      }
    });
  }

  callOnChangeBySelectingListItem(b) {
    this._callOnChangeBySelectingListItem = b;
    return this;
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  getSelectedObject() {
    return this.selectedItem && this.selectedItem.data ? this.selectedItem.data : this.selectedItem;
  }

  getData() {
    return this.data;
  }

  async load(callback) {
    await this.dependencies.load();

    if (this.path) {
      $.ajax({
        url: this.path,
        type: this.method || 'get',
        success: response => {
          this._prepareResponse(response);
          this._handleData(callback);
        },
        error: (error, message, errorThrown) => {
          console.log(error);
        },
      });
    } else {
      if (this.objects.length) {
        this._handleData(callback);
      } else {
        $(this.element).val(this.disabledCaption);
        $(this.element).prop('disabled', true);
      }
    }

    return this;
  }

  _prepareResponse(response) {
    if (this.enumMode) {
      this.objects = response.items;
      this.setOnItemBuild((item, index) => {
        return { img: item.icon, text: item.description, value: item.value };
      });
    } else {
      this.objects = Object.values(response);
    }
  }

  _handleData(callback) {
    this.data = [];

    this.objects.forEach((each, index) => {
      var item = { id: index };

      if (this.onBuildItem) {
        var struct = this.onBuildItem(each, index);
        item.label = struct.text;
        item.value = struct.value || struct.text;
        item.img = struct.img;
        item.data = each;
      } else if (typeof each === 'string') {
        item.label = each;
      } else if (typeof each.val === 'string') {
        item.label = each.val;
        item.value = each.val;
        item.data = each;
      }

      this.data.push(item);
    });

    this.build();

    if (callback) {
      callback();
    }
  }

  build() {
    var options = {
      minLength: this.minLength,
      data: this.data,
      source: (request, response) => {
        var results = $.ui.autocomplete.filter(this.data, request.term);
        response(results.slice(0, this.limit));
      },
      select: (event, ui) => {
        if (this._callOnChangeBySelectingListItem) this.element.trigger('change');

        this.select(ui.item);
      },
    };

    this.instance = this.element.autocomplete(options);

    this.element.autocomplete('instance')._renderItem = (ul, item) => {
      return this._buildItemLayout(item).appendTo(ul);
    };

    if (this.minLength == 0) {
      this.instance.focus(() => {
        this.element.autocomplete('search', '');
      });
    }
  }

  remove() {
    this.element.autocomplete({ source: [] });
  }

  _buildItemLayout(item) {
    var img;

    if (item.img) {
      img = $('<img>').addClass('.circle').attr('src', item.img);
    }

    return $('<li>').append($('<div>').append(img, $('<span>').text(item.label)));
  }

  destroy() {
    this.data = [];
    this.method = null;
  }
}
