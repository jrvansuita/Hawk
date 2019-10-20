const Controller = require('../jobs_old/controller/controller.js');
const History = require('../bean/history.js');
const EccosysCalls = require('../eccosys/eccosys-calls.js');

module.exports = class JobProducts extends Controller{

  run(callback){
    var controller = this;

    History.job('Inclusão de Brindes', 'Atualizando pedidos com brindes', 'Brinde');

    new EccosysCalls().getWaitingPaymentSales((sales) => {

      sales.forEach((sale, index)=>{

        if (parseFloat(sale.totalVenda) > 500){
          console.log(sale.numeroPedido + ' ' + sale.totalVenda);
        }
      });


    });


    }
  };
