const GetResponseAPI = require('./getresponse-api.js');

module.exports = class GetResponseHandler extends GetResponseAPI{

  addContact(data){
    this.post('contacts/').prepareBody(data).go();
  }

  getCampaigns(){
    this.get('campaigns/').go();
  }
}
