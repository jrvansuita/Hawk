var onFinished;
var data;

module.exports = {
  get: function(from, to, callback) {
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
      $gte: from.withoutTime(),
      $lte: to.withoutTime()
    }
  };
}

function handle(docs, index, callback) {
  if (docs.length > 0) {
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
  } else {
    callback();
  }
}

function handleItem(item) {
  if (data[item.userId]) {
    data[item.userId].total += item.total;
    data[item.userId].count += item.count;
  } else {
    data[item.userId] = item;
  }
}