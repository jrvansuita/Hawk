
class CostsBoxBuilder{
  constructor(costs, total){
    this.data = costs;
    this.total = total;

    this.box = $('<div>').addClass('grid-item shadow').css('grid-column', '3 / 5');
    $('.content-grid').append(this.box);
  }

  group(title, editable=false, num='', clazz=''){
    var group = $('<div>').addClass('row ' + clazz);
    this.box.append(group);

    this.currentGroup = group;
    this.currentEditable = editable;

    group.append($('<span>').addClass('title').append(title,  $('<label>').addClass('right sum red-val min-val').text(num)));

    return this;
  }

  _getValue(id){
    var val = 0;
    if (this.data){
      this.data.forEach((each) => {
        val += parseFloat(each.data[id]) || 0;
      })
    }

    return val;
  }

  _format(input, val){
    var value = parseFloat(val);
    input.val(Num.money(value)).data('val', val);

    //Update Sum
    this.currentGroup.find('.sum').text('- ' + Num.money($('input').toArray().reduce((acun, each) => {
      return acun + (parseFloat($(each).data('val')) || 0);
    }, 0)));

    var label = input.parent().find('label');
    if (label.length){
      label.text(label.data('label') + ' ('+Num.percent((value*100)/this.total)+')');
    }
  }


  field(label, id){
    var val = this._getValue(id);

    var $inputHolder = $('<div>').addClass('material-input-holder');

    var $input = $('<input>').attr('type', 'text').attr('id', id).attr('required','').attr('disabled', !this.currentEditable);
    var $bar = $('<span>').addClass('bar');
    var $label = $('<label>').text(label).data('label', label);
    $inputHolder.append($input, $bar, $label);

    this.currentGroup.append($('<div>').addClass('col').append($inputHolder));

    if (val){
      this._format($input, val);
    }

    $input.change(() => {
      _post('/sales-dashboard-cost', {tag: $input.attr('id'), val:  $input.val()}, (e) => {
        this._format($input, $input.val());
      });
    });

    return this;
  }



}
