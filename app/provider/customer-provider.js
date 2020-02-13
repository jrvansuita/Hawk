const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = {

  get(id, callback){
    Client.find({id: id}, (err, client)=>{
      new EccosysProvider().client(id).go((eccoClient) => {
        callback({...client, ...eccoClient});
      });
    });
  },

  searchAutoComplete(typing, callback){
    Client.likeThis(typing, 50, (err, data)=>{
      callback(data);
    });
  }


};
