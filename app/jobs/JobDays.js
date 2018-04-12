var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');
var Day = require('../bean/day.js');


var data;

module.exports = {
  run() {


    Sale.find({
      synced: {
        $exists: false
      }
    }, (err, sales) => {
      if (sales.length > 0) {
        console.log('--- Updating ' + sales.length + ' rows ---');

        data = {};

        sales.forEach((sale) => {
          var dayRow = data[getIndex(sale)];

          if (dayRow === undefined) {
            dayRow = Day.invoice(sale);
          } else {
            dayRow.total += sale.value;
            dayRow.count++;
          }

          data[getIndex(sale)] = dayRow;
        });

        console.log(data);

        //execute(docs, 0);
      }
    });
  }

};


function getIndex(sale) {
  return sale.userId + '-invoie-' + sale.billingDate.getTime();
}


function execute(list, index) {
  store(list[index], function() {
    index++;

    if (index < list.length) {
      execute(list, index);
    }
  });
}


function store(dayRow, callback) {
  Days.findOne({
    date: dayRow.date,
    userId: dayRow.userId,
    type: dayRow.type,
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