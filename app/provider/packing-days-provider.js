const Day = require('../bean/day.js');

module.exports = class  {

  constructor() {

  }

  get(from, to, cache, callback) {
    var type = to - from;
    if(cache){
      var data = chartsCached[type];
      data ? callback(data) : getDataAndCache(from, to, type, (response) => {
        callback(response);
      })
    }else{
      getDataControl(from, to, (data) => {
        callback(data);
      });
    }
  }
};

var chartsCached = {};

function getDataAndCache(from, to, type, callback){
  getDataControl(from, to, (data) => {
    chartsCached[type] = data;
    callback(data);
  });
}

function getDataControl(from, to, callback){
  Day.byDay('invoice', from, to, (err, data) => {
    callback(data);
  });
}
