
class BuildBox{
  constructor(){
    this.box = $('<div>').addClass('grid-item shadow');
    $('.content-grid').append(this.box);
  }

  group(title, num, clazz=''){
    var group = $('<div>').addClass('row ' + clazz);
    this.box.append(group);
    group.append($('<span>').addClass('title').append(title, $('<span>').addClass('right').append(num)));
    this.currentGroup = group;

    return this;
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

    return this;
  }

  square(label, right, sub, value='', attr, attrVal, max){
    var col = $('<div>').addClass('col coloring-data taggable').data('attr', attr).data('value', attrVal).data('max', max).data('cur', right);
    this.currentGroup.append(col);

    col.append($('<span>').addClass('super').append(label, $('<span>').addClass('right').append(right)));
    col.append($('<span>').addClass('value min-val').append(sub, $('<span>').addClass('right min-val').append(value)));

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

  col(val, clazz=''){
    var row = $('<td>').append($('<span>').addClass('value ' + clazz).append(val));
    this.currentRow.append(row);
    return this;
  }
}
