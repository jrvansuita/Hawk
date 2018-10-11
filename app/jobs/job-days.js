const Controller = require('../jobs/controller/controller.js');

const Sale = require('../bean/sale.js');
const User = require('../bean/user.js');
const Day = require('../bean/day.js');
const History = require('../bean/history.js');

var data;

module.exports = class JobDays extends Controller{
  run() {
    var controller = this;

    Sale.findNotSynced((err, salesArr) => {
      if (salesArr.length > 0) {
        data = {};
        handleData(salesArr);

        var rows = Object.values(data);
        History.job('Calculando Pontos', 'Calculando os pontos gerados pelo faturamento dos pedidos', 'Hawk');

        execute(rows, 0, () => {
          Sale.syncAll();

          controller.terminate();
        });
      }
    });
  }
};

function handleData(sales) {
  sales.forEach((sale) => {
    console.log(sale);
    var code = Sale.invoiceCode(sale);
    var dayRow = data[code];

    if (dayRow === undefined) {
      dayRow = Day.invoice(sale);
    } else {
      var day = Day.invoice(sale);

      dayRow.total += day.total;
      dayRow.points += day.points;
      dayRow.count++;
    }

    data[code] = dayRow;
  });
}

function execute(data, index, onFinished) {
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
  console.log(dayRow);
  Day.sync(dayRow, (err, doc) => {
    callback();
  });
}
