module.exports = class {

  constructor(){
    this.content = "<p>A API do Eccosys parou de responder ou está retornando um erro!</p><p>Este é um email automático.</p></br></br> ";
  }

  response(error){
    this.error = error;
  }

  request(data){
    this.options = data;
  }

  build(){
   this.content += '\n' + this.error;
   this.content += '\n\n <p><pre>' + JSON.stringify(this.options, undefined, 2) + '</pre></p>';


    return this.content;
  }
};
