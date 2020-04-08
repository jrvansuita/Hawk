const Job = require('../jobs/controller/job.js');
const History = require('../bean/history.js');
const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

const GetResponseProvider = require('../getresponse/getresponse-provider.js');

module.exports = class JobSyncClients extends Job{


  getName(){
    return 'Sincronização de Clientes';
  }

  handleEach(client, next){
    Client.from(client).upsert(next);
    
    //new GetResponseProvider().addContact(client);
  }

  handlePage(page, nextPageCallback){
    var runEach = () => {
      if (page.length){
        this.handleEach(page[0], () => {
          page.shift();
          runEach();
        });
      }else{
        nextPageCallback();
      }
    }

    runEach();
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      new EccosysProvider(true)
      .setOnError((err) => {
        reject(err);
      })
      .pageCount(1000)
      .dates(Dat.rollDay(new Date(), -2), Dat.now())
      .clients()
      .pagging()
      .each((clientsPage, nextPage)=>{
        this.handlePage(clientsPage, nextPage);
      }).end(()=>{
        resolve();
      });
    });
  }


};
