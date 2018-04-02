var EccosysCalls = require('../eccosys/eccosys-calls.js');
var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');

var from;
var to;
var localUsers = {};

module.exports = {

  run(callback) {

    loadUsers();

    //Find the last sale row date to set as from date sync
    salesDb.findOne({}).sort({
      _id: -1
    }).limit(1).exec(function(err, doc) {
      from = doc ? doc.billingDate : Dat.firstDayOfYear();
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

    salesDb.findOne({
      number: item.numeroPedido
    }, function(err, doc) {
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

    if (localUsers[user.id] === undefined)
      storeUser(user);

    storeSale(sale);
  }
}

function buildSale(idUser, pedido) {
  var sale = new Sale(pedido.numeroPedido);
  sale.setBillingDate(new Date(pedido.dataFaturamento));
  sale.setValue(pedido.totalVenda);
  sale.setUserId(idUser);

  return sale;
}

function storeSale(sale) {
  console.log('Sale ' + sale.number + ' stored');

  salesDb.update({
    number: sale.getNumber()
  }, sale, {
    upsert: true
  });
}

function buildUser(pedido) {
  var actions = pedido._Ocorrencias.filter(item => item.descricao.indexOf('Nota Fiscal Gerada') > -1)[0];
  return !actions ? undefined : new User(actions.idProprietario, actions.nomeProprietario);
}

function storeUser(user) {
  usersDb.update({
    id: user.id
  }, user, {
    upsert: true
  });
}

function loadUsers() {
  if (Object.keys(localUsers).length === 0) {

    usersDb.find({}, function(err, docs) {
      docs.forEach(function(item) {
        localUsers[item.id] = item.name;
      });
    });
  }
}