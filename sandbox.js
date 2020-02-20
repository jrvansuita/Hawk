



const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {

  //const EmailBuilder = require('./app/email/email-builder.js');
  //const Pending = require('./app/bean/pending.js');
  //const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

  /*Pending.getLast((err, doc) => {
    new EccosysProvider().client(doc.sale.idContato).go((client)=>{
      new EmailBuilder()
      .template('PENDING')
      .setData({
        pedido: doc.sale,
        cliente: client,
        produtos: doc.sale.items.filter((i) => {
          i.img = "https://hawkproject.herokuapp.com/product-image-redirect?sku=" + i.codigo;
          i.total = parseFloat(i.precoLista) * parseFloat(i.quantidade);
          return i.pending == true;
        })
      }).send((err, sucessId) => {

      });

    });

  });*/



  /*new EmailBuilder()
  .template('API_DOWN')
  .to(Params.eccosysApiReportEmails())
  .setData({
    error: "teste",
    options: '\n\n <p><pre>' + JSON.stringify({ "host": "boutiqueinfantil.eccosys.com.br", "port": 443, "timeout": 60000, "path": "/api/produtos/PGC600vd-3", "method": "GET", "url": "https://boutiqueinfantil.eccosys.com.br/api/produtos/PGC600vd-3", "headers": { "Content-Type": "application/json; charset=utf-8", "signature": "9c44abd7ba14537b20866662bc28b236", "apikey": "b37f6a2583f10f369c549333b7c76cdaa4c56801" } }, undefined, 2) + '</pre></p>'
  }).send();*/


});


/*const job = require('./app/jobs/job-mundipagg-checker.js');

const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

new EccosysProvider().sale('729422').go((sale) => {
new job().handleSale(sale);
})

*/
