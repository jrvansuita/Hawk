const Day = require('../bean/day.js');

var cache = {};

module.exports = {
  
  load(from, to, callback){
    Day.byDay('invoice', from, to, (err, data) => {
      cache[from - to] = data;
      if (callback) callback(data);
    });
  },

  get(from, to, cache, callback) {
    cache = cache && cache[from - to];

    if(cache){
      callback(cache[from - to]);
    }else{
      this.load(from, to, callback)
    }
  }
};
