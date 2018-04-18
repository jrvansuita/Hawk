module.exports = class Achievement {

  constructor(month, user) {
    this.month = month;
    this.user = user;

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