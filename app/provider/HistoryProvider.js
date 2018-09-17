const History = require('../bean/history.js');
var UsersProvider = require('../provider/UsersProvider.js');

module.exports = {
  getAll(callback){
    History.findAll((err, result)=>{
      result.forEach((item)=>{
        item.user = UsersProvider.get(item.userId);
      });

      callback(result);
    });
  }


};
