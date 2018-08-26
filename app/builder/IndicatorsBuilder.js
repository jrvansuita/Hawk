const Day = require('../bean/day.js');
const Indicators = require('../bean/ind.js');

module.exports = class IndicatorsBuilder{

  constructor(userId, isFull){
    this.userId = userId;
    this.indicators = new Indicators();
    this.runnedLoads = 0;
    this.isFull = isFull;
  }

  load(type, callback){
    this.runnedLoads++;

    Day.search(this.userId, type, (err, res) =>{
      this.runnedLoads--;

      if(res.length > 0){
        res = res[0];
        callback(this, res);
      }

      this.checkTerminate();
    });
  }

  build(onTerminate){
    this.load('picking', this.buildPickingResults);
    this.load('invoice', this.buildPackingResults);
    this.onTerminate = onTerminate;
  }

  checkTerminate(){
    if (this.runnedLoads == 0){
      this.onTerminate(this.indicators);
    }
  }

  buildPickingResults(clazz, data){
    var group = clazz.indicators.addGroup('Picking');

    group.addItem('Itens Coletados', data.sum_total , '03c184');
    group.addItem('Pedidos Separados', data.sum_total/5.3, '23afe0');

    var hours = parseInt((data.sum_count/60)/60);
    if (hours>0){
      group.addItem('Horas Ativas', hours, 'b359e2');
    }

    group.addItem('Segundos/Item', parseInt(data.sum_count/data.sum_total), '5f7ce8');
    group.addItem('Pontos', data.sum_points, '1da8b9');
  }


  buildPackingResults(clazz, data){
    var group = clazz.indicators.addGroup('Packing');

    if (clazz.isFull){
      group.addItem('Receita', data.sum_total, '03c184');
    }
    group.addItem('Pedidos Faturados', data.sum_count, '14b5a6');
    group.addItem('Ticker Médio', data.sum_total/data.sum_count, 'b359e2');
    group.addItem('Pontos', data.sum_points , '1da8b9');
  }
};
