module.exports = class Chart {

  constructor(title, label) {
    this.title = title;
    this.label = label;
    this.items = [];
    this.maxs = {};
  }

  getMaxBarValue() {
    return maxBarValue;
  }

  addItem(label, imgName) {
    var item = new ChartItem(this, label, imgName);
    this.items.push(item);
    return item;
  }

  getItems() {
    return this.items;
  }

  sort(barName) {
    this.items = this.items.sort(function(a, b) {
      return a.getBarValue(barName) == b.getBarValue(barName) ? 0 : +(a.getBarValue(barName) > b.getBarValue(barName)) || -1;
    });
  }
};

class ChartItem {
  constructor(parent, label, imgName) {
    this.parent = parent;
    this.label = label;
    this.imgName = imgName;
    this.bars = [];
  }

  addBar(label, value, heightPerc, type) {
    var bar = new Bar(this.parent, label, value, heightPerc, type);
    this.bars.push(bar);
    return bar;
  }

  getBars() {
    return this.bars;
  }

  getBarValue(barName) {
    return this.getBar(barName).value;
  }

  getBar(barName) {
    for (var i = 0; i < this.bars.length; i++) {
      if (this.bars[i].name === barName)
        return this.bars[i];
    }

    return null;
  }
}

const maxBarHeight = 200; //Pixels
const minBarHeight = 30; //Pixels

class Bar {

  constructor(parent, name, value, heightPerc, type) {
    this.parent = parent;
    this.name = name;
    this.value = value;
    this.type = type;
    this.heightPerc = heightPerc;
    this.handlMax(name, value);
  }

  getHeight() {
    var perc = (this.value * 100) / this.getMaxBarValue();
    var hei = (perc * (maxBarHeight * this.heightPerc)) / 100;

    return hei < minBarHeight ? minBarHeight : hei;
  }

  handlMax(name, value) {
    var maxs = this.parent.maxs;

    if (maxs[name] === undefined || maxs[name] < value)
      maxs[name] = value;
  }

  getMaxBarValue() {
    return this.parent.maxs[this.name];
  }

  getValue() {
    return this.value;
  }

  getDisplayValue() {
    if (this.type === 'money') {
      return Num.small_money(this.getValue());
    } else if (this.type === 'int') {
      return Num.int(this.getValue());
    }
  }
}