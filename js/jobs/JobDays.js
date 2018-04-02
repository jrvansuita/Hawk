var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');
var Day = require('../bean/day.js');


module.exports = {

  run() {
    salesDb.find({
      synced: {
        $exists: false
      }
    }, function(err, docs) {

      console.log('--- Updating ' + docs.length + ' rows ---');
      execute(docs, 0);
    });
  }

};


function execute(list, index) {
  store(list[index], function() {
    index++;

    if (index < list.length) {
      execute(list, index);
    }
  });
}


function store(sale, callback) {
  daysDb.findOne({
    date: sale.billingDate,
    userId: sale.userId,
    type: 'invoice',
  }, function(err, doc) {
    if (doc) {
      update(doc._id, sale, callback);
    } else {
      insert(sale, callback);
    }
  });

  salesDb.update({
    number: sale.number
  }, {
    $set: {
      synced: true
    }
  }, {
    multi: false
  }, function() {});
}


function update(id, sale, callback) {
  daysDb.update({
      _id: id
    }, {
      $inc: {
        count: 1,
        total: sale.value
      }
    },
    function(err, docs) {
      console.log('Updated ' + sale.number);
      callback();
    }
  );
}

function insert(sale, callback) {
  var invoice = Day.invoice(sale.userId, sale.billingDate, sale.value, 1);

  daysDb.insert(invoice, function(err, doc) {
    console.log('Inserted ' + sale.number);
    callback();
  });
}