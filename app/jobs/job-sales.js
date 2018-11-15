const Controller = require('../jobs/controller/controller.js');

var EccosysCalls = require('../eccosys/eccosys-calls.js');
var UsersProvider = require('../provider/UsersProvider.js');
var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');
const History = require('../bean/history.js');

//Este job é usado para contabilizar os pedidos faturados.
//Deve ser extinto assim que implementado o faturamento por dentro do hawk.
const jobDays = require('../jobs/job-days.js');

var from;
var to;
var count;

module.exports = class JobSales extends Controller{

  setUserId(userId){
    this.userId = userId;
    return this;
  }

  run() {
    count = 0;

    var controller = this;

    //Find the last sale row date to set as from date sync
    Sale.getLast(function(err, doc) {
      from = doc ? doc.billingDate : Dat.firstDayOfYear();
      to = new Date();

      storeHistoryBegin(from, to, controller.userId);

      handleSalePaging(0, () => {
        clear();

        storeHistoryEnd(from, to, count, controller.userId);

        controller.terminate();

        new jobDays().run();
      });
    });
  }
};

function clear(){
  var cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  Sale.removeAll({
    $and: [{
      synced: true
    }, {
      billingDate: {
        $lt: cutoff
      }
    }]
  });
}

function handleSalePaging(page, callback) {
  EccosysCalls.getSales(from, to, page, function(data) {
    try{
      var list = JSON.parse(data);

      if (list instanceof Array && list.length > 0) {
        count += list.length;

        processSalesPage(list, -1, () => {
          page++;

          handleSalePaging(page, callback);
        });
      } else {
        callback();
      }
    }catch(e){
      callback();
    }
  });
}

function processSalesPage(list, index, callback) {
  index++;

  if (index < list.length) {

    var item = list[index];

    Sale.findByKey(item.numeroPedido, function(err, doc) {
      //console.log(item.numeroPedido + ' - ' + (doc ? doc.synced : false));
      //If there isn't a sale stored on local db
      if (!doc) {
        //To to Eccosys and find the sale
        EccosysCalls.getSale(item.numeroPedido, function(pedido) {
          handleSale(pedido);
          processSalesPage(list, index, callback);
        });
      } else {
        processSalesPage(list, index, callback);
      }

    });
  } else {
    callback();
  }
}

function handleSale(pedido) {
  pedido = JSON.parse(pedido)[0];

  var user = buildUser(pedido);

  if (user) {
    var sale = buildSale(user.id, pedido);
    UsersProvider.store(user);

    sale.upsert();
  }
}

function buildSale(userId, pedido) {
  return new Sale(pedido.numeroPedido, new Date(pedido.dataFaturamento), userId, pedido.totalVenda);
}

function buildUser(pedido) {
  var actions = pedido._Ocorrencias.filter(item => item.descricao.indexOf('Nota Fiscal Gerada') > -1)[0];
  return !actions ? undefined : new User(actions.idProprietario, actions.nomeProprietario);
}


function storeHistoryBegin(from, to, userId){
  var msg = 'Iniciando a importação de pedidos faturados de ' + Dat.format(from) + ' até ' + Dat.format(to);

  History.job('Importação de Pedidos Packing', msg, 'Eccosys', userId);

}

function storeHistoryEnd(from, to, salesCount, userId){
  var msg = 'Finalizado a importação de pedidos faturados de ' + Dat.format(from) + ' até ' + Dat.format(to);
  msg+= '\nForam importados ' + salesCount + ' pedidos';

  History.job('Importação de Pedidos Packing', msg, 'Eccosys', userId);

}
