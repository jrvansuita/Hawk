module.exports = class Achievement {

  constructor(month, year) {
    this.month = month;
    this.year = year;
    this.monthDesc = Dat.monthDesc(month);
    this.user = 'default ';

    //Charts items
    this.bars = [];
  }


  addBar(label, value, barColor) {
    var bar = new Bar(this.parent, label, value, barColor);
    this.bars.push(bar);
    return bar;
  }

  getBars() {
    return this.bars;
  }
};

class Bar {

  constructor(parent, name, value, barColor) {
    this.parent = parent;
    this.name = name;
    this.value = value;
    this.barColor = barColor;
  }


}