const GetResponseAPI = require('./getresponse-api.js')

module.exports = class GetResponseHandler extends GetResponseAPI {
  handle (client) {
    this.getContact(client.email, (data) => {
      if (data[0] != null) {
        this.prepareBody(client)
          .updateContact(data[0].contactId, (res) => {
            console.log('Cliente atualizado')
          })
      } else {
        this.prepareBody(client)
          .createContact((res) => {
            console.log('Cliente adicionado')
          })
      }
    })
  }

  createContact (callback) {
    this.post('contacts/').setBody(this.body).go(callback)
  }

  updateContact (contactId, callback) {
    this.post('contacts/' + contactId).setBody(this.body).go(callback)
  }

  getCustomFields (callback) {
    this.get('custom-fields/').go(callback)
  }

  getContact (email, callback) {
    this.get('campaigns/' + Params.getResponseBaseId() + '/contacts').findContact(email).go((res) => {
      callback(res)
    })
  }

  prepareBody (data) {
    this.body = JSON.stringify({
      name: data.nome,
      campaign: {
        campaignId: Params.getResponseBaseId()
      },
      email: data.email,

      customFieldValues: [
        {
          customFieldId: 'V',
          value: [
            data.dataNascimento || '01/01/1991'
          ]
        },
        {
          customFieldId: 'r',
          value: [
            data.cidade
          ]
        },
        {
          customFieldId: 'w',
          value: [
            data.uf
          ]
        },
        {
          customFieldId: 't',
          value: [
            data.cnpj
          ]
        }
      ]
    })
    return this
  }
}
