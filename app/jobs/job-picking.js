const Controller = require('../jobs/controller/controller.js');
const PickingLaws = require('../laws/picking-laws.js');
const PickingHandler = require('../handler/picking-handler.js');
const History = require('../bean/history.js');

module.exports = class JobPicking extends Controller{

  run(){
    var controller = this;

    History.job('Importação de Picking', 'Importando pedidos para picking.', 'Eccosys');

    PickingLaws.clear(404);
    PickingHandler.init(()=>{
      controller.terminate();
    });
  }
};
