module.exports = class  {

  constructor(year) {
    this.year = year;

    //Charts items
    this.items = [];
    this.record = 'none';
    this.maxValue = 0;
  }

  addMonthItem(month) {
    var item = new MonthItem(month, this.year);
    this.items.push(item);
    return item;
  }

  getItems() {
    return this.items;
  }

  loadRecords(){
    var _self = this;

    this.items.forEach((item, index)=>{

      item.getWinners().forEach((winner)=>{
        winner.getBars().forEach((bar)=>{


        if (bar.countForRecord){
          if (_self.maxValue < bar.value){
            _self.maxValue = bar.value;
            _self.record = item.month;
          }
        }

        });

      });
    });
  }

};


class MonthItem {

  constructor(month, year) {
    this.month = month;
    this.year = year;
    this.monthDesc = Dat.monthDesc(month);

    this.winners = [];
  }

  addWinner(user) {
    var winner = new Winner(user);
    this.winners.push(winner);
    return winner;
  }

  getWinners(){
    return this.winners;
  }

}



class Winner {

  constructor(user) {
    this.user = user;
    this.bars = [];

  }

  addBar(label, value, barColor, countForRecord) {
    var bar = new Bar(label, value, barColor, countForRecord);
    this.bars.push(bar);


    return bar;
  }

  getBars() {
    return this.bars;
  }


}


class Bar {

  constructor(name, value, barColor, countForRecord) {
    this.name = name;
    this.value = value;
    this.barColor = barColor;
    this.countForRecord = countForRecord;
  }


}
