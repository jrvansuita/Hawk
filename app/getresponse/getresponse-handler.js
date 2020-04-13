const GetResponseAPI = require('./getresponse-api.js');

module.exports = class GetResponseHandler extends GetResponseAPI{

  createContact(callback){
    this.post('contacts/').setBody(this.body).go(callback);
  }

  updateContact(contactId, callback){
    this.post('contacts/' + contactId).setBody(this.body).go(callback);
  }

  getCustomFields(callback){
    this.get('custom-fields/').go(callback);
  }

  getContact(email, callback){
    this.get('contacts/').findContact(email).go((res) => {
      callback(res);
    });
  }

  prepareBody(data){
    this.body =  JSON.stringify({
      "name": data.nome,
      "campaign": {
        "campaignId": "w"
      },
      "email": data.email,

      "customFieldValues": [
        {
          "customFieldId": "V",
          "value": [
            data.dataNascimento
          ],
        },
        {
          "customFieldId": "r",
          "value": [
            data.cidade
          ]
        },
        {
          "customFieldId": "w",
          "value": [
            data.estado
          ]
        },
        {
          "customFieldId": "f",
          "value": [
            '+55'+ data.celular
          ]
        },
        {
          "customFieldId": "Q",
          "value": [
            '+55'+ data.fone
          ]
        },
        {
          "customFieldId": "t",
          "value": [
            data.socialCode
          ]
        }
      ]
    });
    return this;
  }
}
