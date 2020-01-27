const Template = require('../../bean/template.js')
const Email = require('../email.js')
const cheerio = require('cheerio');

module.exports = class EmailBuilder{

  constructor(){
    this.sender = new Email();
    this.defaultEmail = Params.email();
    this.defaultReplyEmail = Params.replayEmail();
    this.defaultName = Params.emailName();
  }

  findAllVariables(value){
    this.variables = [...new Set(value.match(/{.*?}/g).map((e) => {
      return e.replace(/{|}/g, '');
    }))];

    this.findArraysAndHandleIt();
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

  processVariables(str){
    this.findAllVariables(str);

    str = this.proccessSingleValues(str, this.variables, this.data);

    Object.keys(this.arrays).forEach((key) => {
      if (this.data[key]){
        var arrayVariables = this.arrays[key];
        var findKey = "{" + key + "...}";

        var matches = str.match(findKey + ".*?" + findKey, 'g');

        if (matches && matches.length){
          var innerContent = matches[0];
          var contentResultArr = [];

          this.data[key].forEach((eachData) => {
            var dataHolder = {};
            dataHolder[key] = eachData;
            contentResultArr.push(this.proccessSingleValues(innerContent, arrayVariables,  dataHolder));
          });

          str = str.replace(innerContent, contentResultArr.join(''));
          str = str.replaceAll(findKey, '');
        }
      }
    });

    return str;
  }

  htmlFormatting(data){
    const $ = cheerio.load(data);

    $('img').each((i, el) => {
      var alt = $(el).attr('alt');

      if (alt.includes('http')){
        $(el).attr('src', alt);
      }
    });

    return $.html();
  }

  prepare(){
    //this.sender.to([this.to, this.defaultEmail]);
    this.sender.to(["vansuita.jr@gmail.com"]);
    this.sender.from(this.defaultName, this.defaultEmail);
    this.sender.replyTo(this.defaultReplyEmail, this.defaultReplyEmail);

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
      console.log('enviou o email');
      this.sender.send(callback);
    });
  }
}
