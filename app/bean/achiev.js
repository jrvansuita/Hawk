module.exports = class Achievement {

  constructor(year) {
    this.year = year;

    //Charts items
    this.items = [];
    this.record = 'none';
    this.maxValue = 0;
  }

  addItem(month) {
    var item = new MonthItem(this, month, this.year);
    this.items.push(item);
    return item;
  }

  getItems() {
    return this.items;
  }
};


class MonthItem {

  constructor(parent, month, year) {
    this.parent = parent;
    this.month = month;
    this.year = year;
    this.monthDesc = Dat.monthDesc(month);
    this.user = 'default ';

    //Charts items
    this.bars = [];
  }

  addBar(label, value, barColor, lookRecord) {
    var bar = new Bar(label, value, barColor);
    this.bars.push(bar);

    if (lookRecord){
      if (this.parent.maxValue < value){
         this.parent.maxValue = value;
         this.parent.record = this.month;
      }
    }

    return bar;
  }

  getBars() {
    return this.bars;
  }

}


class Bar {

  constructor(name, value, barColor) {
    this.name = name;
    this.value = value;
    this.barColor = barColor;
  }


}
