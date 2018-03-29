var Chart = require('../bean/chart.js');

var data;
var onFinished;

var chart;

module.exports = {
  get: function(from, to, callback) {
    chart = new Chart();
    data = {};

    onFinished = () => {
      callback(data);
    };

    daysDb.find(buildQuery(from, to), (err, docs) => {
      handle(docs, 0, onFinished);
    });
  }
};

function buildQuery(from, to) {
  return {
    'date': {
      $lte: from.withoutTime(),
      $gte: to.withoutTime()
    }
  };
}

function handle(docs, index, callback) {
  var item = docs[index];


  usersDb.findOne({
    id: item.userId
  }, function(err, doc) {
    item.userName = doc.name;
    handleItem(item);

    if (index < docs.length - 1) {
      handle(docs, ++index, callback);
    } else {
      callback();
    }
  });
}

function handleItem(item) {

  if (data[item.userId]) {
    data[item.userId].total += item.total;
    data[item.userId].count += item.count;
  } else {
    data[item.userId] = item;
  }
}