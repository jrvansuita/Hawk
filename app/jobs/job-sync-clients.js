const Job = require('../jobs/controller/job.js');
const History = require('../bean/history.js');
const Client = require('../bean/client.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');

module.exports = class JobSyncClients extends Job{

  getName(){
    return 'Sincronização de Clientes';
  }

  handleEach(client, next){
  var client =  new Client(
      client.id,
      client.codigo,
      client.nome,
      client.fantasia,
      client.cnpj,
      client.ie,
      client.tipo,

      client.endereco,
      client.enderecoNro,
      client.bairro,
      client.cidade,
      client.uf,
      client.cep,
      client.fone,
      client.celular,
      client.email,
      client.dataNascimento
    );

    client.upsert(next);
  }

  handlePage(page, nexPageCallback){
    var runEach = () => {
      if (page.length){
        this.handleEach(page[0], () => {
          page.shift();
          runEach();
        });
      }else{
        nexPageCallback();
      }
    }

    runEach();
  }

  doWork(){
    return new Promise((resolve, reject)=>{
      new EccosysProvider()
      .setOnError((err) => {
        reject(err);
      })
      .pageCount(1000)
      //.dates(Dat.firstDayOfLastMonth(), Dat.rollDay(new Date(), -2), 'data')
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
