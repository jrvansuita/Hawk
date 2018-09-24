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

module.exports = class JobSales extends Controller{

  run() {
    //Find the last sale row date to set as from date sync
    Sale.getLast(function(err, doc) {
      from = doc ? doc.billingDate : Dat.firstDayOfYear();
      to = new Date();

      handleSalePaging(0, () => {
        clear();
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

        if (page == 0){
          storeHistory(from, to, list.length);
        }

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


function storeHistory(from, to, salesCount){
  var msg = 'Iniciando a importação de pedidos de ' + Dat.format(from) + ' até ' + Dat.format(to);
  msg+="\nSerão importados " + salesCount + " pedidos" ;

  History.job('Importação de Pedidos', msg, 'Eccosys');

}
