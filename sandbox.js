



const Initilizer = require('./app/abra-cadabra/initializer.js');
new Initilizer(__dirname, true).begin(() => {

  const EmailBuilder = require('./app/email/builder/email-builder.js');
  const Pending = require('./app/bean/pending.js');
  const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

  Pending.getLast((err, doc) => {
    new EccosysProvider().client(doc.sale.idContato).go((client)=>{
      new EmailBuilder()
      .template('PENDING')
      .setData({
        pedido: doc.sale,
        cliente: client,
        produtos: doc.sale.items.filter((i) => {
          i.img = "http://localhost:3000/sku-image?sku=" + i.codigo;
          i.total = parseFloat(i.precoLista) * parseFloat(i.valor);
          return i.pending == true;
        })
      }).send((err, sucessId) => {

      });

    });

  });
});


/*const job = require('./app/jobs/job-mundipagg-checker.js');

const EccosysProvider = require('./app/eccosys/eccosys-provider.js');

new EccosysProvider().sale('729422').go((sale) => {
new job().handleSale(sale);
})

*/
