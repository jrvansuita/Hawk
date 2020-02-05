const Template = require('../../bean/template.js')
const Email = require('../email.js')
const cheerio = require('cheerio');

module.exports = class EmailBuilder{

  constructor(){
    this.sender = new Email();
    this.senderEmail = Params.email();
    this.senderName = Params.emailName();
  }

  findAllVariables(value){
    var matches = value.match(/{.*?}/g);

    if (matches && matches.length){
      this.variables = [...new Set(matches.map((e) => {
        return e.replace(/{|}/g, '');
      }))];

      this.findArraysAndHandleIt();
    }
  }

  findArraysAndHandleIt(){
    this.arrays = {};

    var arraysNames = [...new Set(this.variables.filter((each) => {
      return each.includes('...');
    }))];

    arraysNames.forEach((name) => {
      this.variables.splice(this.variables.indexOf(name),1);
      name = name.replace('...','');

      this.arrays[name] = this.variables.filter((item)=> {
        return item.includes(name + '.');
      });

      this.variables = this.variables.filter((each) => {
        return !(this.arrays[name].includes(each));
      });
    });
  }

  to(email){
    this.to = email;
    return this;
  }

  receiveCopy(){
    this.wantMyCopy = true;
    return this;
  }

  copy(email){
    this.to = email;
    return this;
  }

  reply(email){
    this.replyEmail = email || Params.replayEmail();
    return this;
  }

  template(type){
    this.templateType = type;
    return this;
  }

  setData(data){
    this.data = data;
    return this;
  }

  getFormatValue(value){
    if (Num.isInt(value)){
      return Num.def(value);
    }else if (Floa.isFloat(value)){
      return Num.money(value);
    }else{
      return value;
    }
  }

  proccessSingleValues(str, arr, data){
    arr.forEach((each) => {
      var value = Util.deepVal(each, data);
      if (value){
        str = str.replaceAll("{" + each + "}", this.getFormatValue(value));
      }
    });

    return str;
  }

  getBetween(str, findKey){
    var arr = str.split(findKey);

    //Remove Fisrt
    arr.splice(0,1);

    //Remove Last
    arr.splice(-1,1);

    return arr;
  }

  processVariables(str){
    this.findAllVariables(str);

    if (this.variables && this.variables.length){
      str = this.proccessSingleValues(str, this.variables, this.data);
    }

    if (this.arrays && this.arrays.length > 0){
      Object.keys(this.arrays).forEach((key) => {
        if (this.data[key]){
          var arrayVariables = this.arrays[key];
          var findKey = "{" + key + "...}";

          var matches = this.getBetween(str, findKey);

          if (matches && matches.length){
            matches.forEach((each) => {
              var innerContent = each;
              var contentResultArr = [];

              this.data[key].forEach((eachData) => {
                var dataHolder = {};
                dataHolder[key] = eachData;
                contentResultArr.push(this.proccessSingleValues(innerContent, arrayVariables,  dataHolder));
              });

              str = str.replace(innerContent, contentResultArr.join(''));
              str = str.replaceAll(findKey, '');
            });
          }
        }
      });
    }

    return str;
  }

  htmlFormatting(data){
    const $ = cheerio.load(data);

    //Atributir a src correta para a imagem
    $('img').each((i, el) => {
      var alt = $(el).attr('alt');

      if (alt.includes('http')){
        $(el).attr('src', alt);
      }
    });

    //Remover selo Froala
    $("p[data-f-id='pbf']").remove();

    return $.html();
  }

  prepare(){
    var destination = [this.to];
    if (this.wantMyCopy){
      destination.push(this.senderEmail);
    }

    this.sender.to(destination);
    this.sender.from(this.senderName, this.senderEmail);
    this.sender.replyTo(this.replyEmail, this.replyEmail);

    this.subject = this.processVariables(this.subject);
    this.content = this.processVariables(this.content);
    this.content = this.htmlFormatting(this.content);


    this.sender.subject(this.subject);
    this.sender.html(this.content);
  }

  send(callback){
    Template.findByType(this.templateType,(err, template) => {
      this.subject = template.subject;
      this.content = template.content;

      this.prepare()
      this.sender.send((err, id) => {
        if (callback){
          callback(err, id);
        }
      });
    });
  }
}
