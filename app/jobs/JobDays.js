const Sale = require('../bean/sale.js');
const User = require('../bean/user.js');
const Day = require('../bean/day.js');


var data;

module.exports = {
  run(onFinished) {
    Sale.findNotSynced((err, salesArr) => {
      if (salesArr.length > 0) {
        data = {};
        handleData(salesArr);

        var rows = Object.values(data);
        console.log('--- Updating ' + rows.length + ' rows ---');

        execute(rows, 0, () => {
          Sale.syncAll();
          onFinished();

          console.log('--- Days Sync Job Finished ---');
        });
      } else {
        onFinished();
      }
    });
  }
};

function handleData(sales) {
  sales.forEach((sale) => {
    var code = Sale.invoiceCode(sale);
    var dayRow = data[code];

    if (dayRow === undefined) {
      dayRow = Day.invoice(sale);
    } else {
      dayRow.total += sale.value;
      dayRow.count++;
    }

    data[code] = dayRow;
  });
}

function execute(data, index, onFinished) {
  console.log('Day ' + (index + 1));

  store(data[index], () => {
    index++;

    if (index < data.length) {
      execute(data, index, onFinished);
    } else {
      onFinished();
    }
  });
}

function store(dayRow, callback) {
  Day.upsert(dayRow.getPKQuery(), {
    $inc: {
      count: dayRow.count,
      total: dayRow.total
    }
  }, (err, doc) => {
    callback();
  });
}