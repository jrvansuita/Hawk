const Day = require('../bean/day.js');

module.exports = class  {

  constructor() {

  }


  get(from, to, callback) {
    Day.byDay('invoice', from, to, (err, data) => {
      callback(data)
    });
  }

};
