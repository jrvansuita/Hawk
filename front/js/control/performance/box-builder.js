
class BuildBox{
  constructor(gridSpan){
    this.box = $('<div>').addClass('grid-item shadow');
    $('.content-grid').append(this.box);

    if (gridSpan){
      this.box.css('grid-column', gridSpan);
    }
  }

  get(){
    return this.currentGroup;
  }

  group(title, num, clazz=''){
    var group = $('<div>').addClass('row ' + clazz);
    this.box.append(group);
    if (title){
      group.append($('<span>').addClass('title').append(title, $('<span>').addClass('right').append(num)));
    }
    this.currentGroup = group;

    return this;
  }

  hidableItems(items){
    this.currentGroup.attr('data-show', items);
    return this;
  }

  checkHidableItems(){
    if (this.currentGroup){
      if (this.currentGroup.find('.col').length > this.currentGroup.data('show')){
        this.currentGroup.find('.col').last().addClass('hide-item');
        this._spawSeeMore();
      }
    }
  }

  info(label, value, clazz='', id=''){
    var col = $('<div>').addClass('col');
    this.currentGroup.append(col);
    var val = $('<span>').addClass('value ' + clazz).append(value);

    if (id){
      val.attr('id', id);
    }

    col.append($('<span>').addClass('super').append(label), val);

    return this;
  }

  toast(label, value, clazz='', attr, attrVal){
    var col = $('<div>').addClass('col taggable ' + clazz).data('attr', attr).data('value', attrVal || label)
    this.currentGroup.append(col);
    col.append($('<span>').addClass('super').append(label, $('<span>').addClass('right high-val').append(value)));

    this.checkHidableItems();

    return this;
  }

  square(label, right, sub, value='', attr, attrVal, max){
    var col = $('<div>').addClass('col coloring-data').data('max', max).data('cur', right);


    if (attr){
      col.addClass('taggable').data('attr', attr).data('value', attrVal);
    }

    this.currentGroup.append(col);

    col.append($('<span>').addClass('super').append(label, $('<span>').addClass('right').append(Num.points(right))));
    col.append($('<span>').addClass('value min-val').append(sub, $('<span>').addClass('right min-val').append(value)));

    this.checkHidableItems();

    return this;
  }


  img(path, label, right, click){
    var col = $('<div>').addClass('col box-img-col');

    this.currentGroup.append(col);

    var img = $('<img>').attr('src', path).addClass('box-img');
    col.append(img);
    col.append($('<span>').addClass('super').append(label, $('<span>').addClass('right').append(right)));
    col.click(click);

    return this;
  }

  table(){
    var table = $('<table>').addClass('list');
    this.box.append(table);
    this.currentTable = table;
    this.box.css('grid-column', '1 / 3');

    return this;
  }

  row(clazz=''){
    var row = $('<tr>').addClass(clazz);
    this.currentTable.append(row);
    this.currentRow = row;

    return this;
  }

  col(val, clazz='', attr, attrVal){
    var row = $('<td>').append($('<span>').addClass('value ' + clazz).append(val));

    if (attr){
      row.addClass('taggable').data('attr', attr).data('value', attrVal);
    }

    this.currentRow.append(row);
    return this;
  }


  _spawSeeMore(){
    if(!this.currentGroup.find('.see-more').length){
      var hide = $('<span>').addClass('see-more').text('Ver Mais');
      hide.click(() => {
        var toggle = hide.parent().find('.hide-item').first().is(':visible');
        hide.text(toggle ? 'Ver Mais' : 'Ver Menos');

        if (toggle){
          hide.parent().find('.hide-item').hide();
        }else{
          hide.parent().find('.hide-item').fadeIn().css("display","inline-block");
        }
      });

      this.currentGroup.append(hide);
    }
  }
}