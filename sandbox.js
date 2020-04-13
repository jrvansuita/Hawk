const https = require('https');
const Initilizer = require('./app/abra-cadabra/initializer.js');
const GetResponseHandler = require('./app/getresponse/getresponse-handler.js');



new Initilizer(__dirname, true).begin(() => {

  //new GetResponseHandler().getCustomFields((res) => {
  //  console.log(res);
//  });

/*  var cliente = JSON.stringify({
    "nome": "Jaison Klemer Teste",
    "email": "jaison@boutiqueinfantil.com.br",
    "dataNascimento": "11/05/1998",
    "cidade": "Gaspar",
    "estado": "SC",
    "celular": "47999999999",
    "fone":"+5547999999999",
    "socialCode":"101.027.049-45"
  });
  cliente = JSON.parse(cliente);

  console.log(cliente.nome);


  new GetResponseHandler().getContact(cliente.email, (data) => {

    if(data[0] != null){
      new GetResponseHandler()
      .prepareBody(cliente)
      .updateContact(data[0]['contactId'], (res) => {
        console.log('Cliente atualizado');
      });
    }else{
      new GetResponseHandler()
      .prepareBody(cliente)
      .createContact((res) => {
        console.log('Cliente adicionado');
      });
    }
  });*/

  console.log(Params.getResponseCheckbox());

  });
