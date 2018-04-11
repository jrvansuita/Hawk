module.exports = class InvoicesProvider {

  constructor(callback) {
    this.data = {};
    this.callback = callback;
  }

  onFinished() {
    this.callback(this.data);
  }

  get(from, to) {
    var _self = this;

    daysDb.find(this.buildQuery(from, to), (err, items) => {
      _self.handle(items, 0);
    });
  }


  buildQuery(from, to) {
    return {
      'date': {
        $gte: from.withoutTime(),
        $lte: to.withoutTime()
      }
    };

  }

  handle(docs, index) {
    if (docs.length > 0) {
      var item = docs[index];

      var _self = this;

      usersDb.findOne({
        id: item.userId
      }, function(err, doc) {
        item.userName = doc.name;
        _self.handleItem(item);

        if (index < docs.length - 1) {
          _self.handle(docs, ++index);
        } else {
          _self.onFinished();
        }
      });
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