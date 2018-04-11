module.exports = class Chart {

  constructor(title, label) {
    this.title = title;
    this.label = label;

    //Charts items
    this.items = [];
    //Chart maximum by bar
    this.maxs = {};
    //Chart sum bars
    this.sums = {};
  }

  getSums() {
    return this.sums;
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

  addBar(label, value, factor, barColor, doSum) {
    var bar = new Bar(this.parent, label, value, factor, barColor, doSum);
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

  constructor(parent, name, value, factor, barColor, doSum) {
    this.parent = parent;
    this.name = name;
    this.value = value;
    this.factor = factor;
    this.doSum = doSum;
    this.barColor = barColor;
    this.handleMaxAndSum(name, value);
  }

  getHeight() {
    var perc = (this.value * 100) / this.getMaxBarValue();
    var hei = (perc * (maxBarHeight * this.factor)) / 100;

    return hei < minBarHeight ? minBarHeight : hei;
  }

  handleMaxAndSum(name, value) {
    var maxs = this.parent.maxs;

    if (maxs[name] === undefined || maxs[name] < value)
      maxs[name] = value;

    if (this.doSum) {
      var sums = this.parent.sums;
      sums[name] = sums[name] === undefined ? value : sums[name] + value;
    }
  }

  getMaxBarValue() {
    return this.parent.maxs[this.name];
  }

  getValue() {
    return this.value;
  }

  getBarColor() {
    return this.barColor;
  }

}