var EccosysCalls = require('../eccosys/eccosys-calls.js');
var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');

var from;
var to;
var localUsers;

module.exports = {

  run(callback) {

    loadUsers();

    //Find the last sale row date to set as from date sync
    Sale.getLast(function(err, doc) {
      from = doc ? doc.billingDate : Dat.firstDayOfMonth();
      to = new Date();

      console.log('---  From ' + Dat.format(from) + ' To ' + Dat.format(to) + ' ---');

      handleSalePaging(0, () => {
        if (callback)
          callback();
        console.log('---  Sale Sync Job Finished --- ');
      });
    });
  }
};

function handleSalePaging(page, callback) {
  EccosysCalls.getSales(from, to, page, function(data) {
    var list = JSON.parse(data);

    if (list instanceof Array) {
      processSalesPage(list, -1, () => {
        page++;

        //console.log('--- ' + list.length + ' Sales were stored on page ' + page + ' --- ');
        handleSalePaging(page, callback);
      });
    } else {
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
    storeUser(user);
    storeSale(sale);
  }
}

function buildSale(userId, pedido) {
  return new Sale(pedido.numeroPedido, new Date(pedido.dataFaturamento), userId, pedido.totalVenda);
}

function storeSale(sale) {
  console.log('Sale ' + sale.number + ' stored');
  sale.upsert();
}

function buildUser(pedido) {
  var actions = pedido._Ocorrencias.filter(item => item.descricao.indexOf('Nota Fiscal Gerada') > -1)[0];
  return !actions ? undefined : new User(actions.idProprietario, actions.nomeProprietario);
}

function storeUser(user) {
  if (localUsers[user.id] === undefined) {
    user.upsert();

    localUsers[user.id] = user.name;
  }
}

function loadUsers() {
  localUsers = {};

  User.findAll(function(err, users) {
    users.forEach(function(user) {
      localUsers[user.id] = user.name;
    });
  });
}