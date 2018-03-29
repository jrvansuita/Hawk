var EccosysCalls = require('../eccosys/eccosys-calls.js');
var Sale = require('../bean/sale.js');
var User = require('../bean/user.js');



var from;
var to;

module.exports = {

  run() {

    this.from = new Date();
    this.to = Date();

    handleSalePaging(0, () => {
      console.log('---  Finished --- ');
    });
  }

};

function handleSalePaging(page, callback) {
  EccosysCalls.getSales(from, to, page, function(data) {
    var list = JSON.parse(data);

    if (list instanceof Array) {
      processSalesPage(list, 0, () => {
        page++;

        console.log('--- ' + list.length + ' Sales were stored on page ' + page + ' --- ');
        handleSalePaging(page, callback);
      });
    } else {
      callback();
    }

  });
}

function processSalesPage(list, index, callback) {
  var item = list[index];

  EccosysCalls.getSale(item.numeroPedido, function(pedido) {
    handleSale(pedido);

    index++;

    if (index < list.length) {
      processSalesPage(list, index, callback);
    } else {
      callback();
    }
  });
}

function handleSale(pedido) {
  pedido = JSON.parse(pedido)[0];

  var user = buildUser(pedido);
  var sale = buildSale(user.id, pedido);

  storeUser(user);
  storeSale(sale);
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
  return new User(actions.idProprietario, actions.nomeProprietario);
}

function storeUser(user) {
  usersDb.update({
    id: user.id
  }, user, {
    upsert: true
  });
}