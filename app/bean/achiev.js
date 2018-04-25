module.exports = class Achievement {

  constructor(year) {
    this.year = year;

    //Charts items
    this.items = [];
  }

  addItem(month) {
    var item = new MonthItem(month, this.year);
    this.items.push(item);
    return item;
  }

  getItems() {
    return this.items;
  }
};


class MonthItem {

  constructor(month, year) {
    this.month = month;
    this.year = year;
    this.monthDesc = Dat.monthDesc(month);
    this.user = 'default ';

    //Charts items
    this.bars = [];
  }

  addBar(label, value, barColor) {
    var bar = new Bar(label, value, barColor);
    this.bars.push(bar);
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