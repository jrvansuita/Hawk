const Day = require('../bean/day.js');
var UsersProvider = require('../provider/UsersProvider.js');

module.exports = class DaysChartProvider {

  constructor(type, callback) {
    this.data = {};
    this.type = type;
    this.callback = callback;
  }

  onFinished() {
    this.callback(this.data);
  }

  get(from, to) {
    var _self = this;

    Day.find(this.buildQuery(from, to), (err, items) => {
      _self.handle(items, 0);
    });
  }


  buildQuery(from, to) {
    return {
      'type': this.type,
      'date': {
        $gte: from.withoutTime(),
        $lte: to.withoutTime()
      }
    };

  }

  handle(docs, index) {
    if (docs.length > 0) {
      var item = docs[index];

      var user = UsersProvider.getDefault(item.userId);

      item.userName = user.name;
      item.userImg = user.avatar;
      this.handleItem(item);

      if (index < docs.length - 1) {
        this.handle(docs, ++index);
      } else {
        this.onFinished();
      }
    } else {
      this.onFinished();
    }
  }

  handleItem(item) {
    if (this.data[item.userId]) {
      this.data[item.userId].total += item.total;
      this.data[item.userId].count += item.count;
    } else {
      this.data[item.userId] = item;
    }
  }
};
