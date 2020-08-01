const Template = require('../bean/template.js');
const cheerio = require('cheerio');

module.exports = class TemplateBuilder {
  constructor(id) {
    this.id = id;
  }

  template(use) {
    this.templateUse = use;
    return this;
  }

  setData(data) {
    this.data = data;
    return this;
  }

  useSampleData() {
    this.useSample = true;
    return this;
  }

  findAllVariables(value) {
    var matches = value.match(/{.*?}/g);

    if (matches && matches.length) {
      this.variables = [
        ...new Set(
          matches.map((e) => {
            return e.replace(/{|}/g, '');
          })
        ),
      ];

      this.findArraysAndHandleIt();
    }
  }

  findArraysAndHandleIt() {
    this.arrays = {};

    var arraysNames = [
      ...new Set(
        this.variables.filter((each) => {
          return each.includes('...');
        })
      ),
    ];

    arraysNames.forEach((name) => {
      this.variables.splice(this.variables.indexOf(name), 1);
      name = name.replace('...', '');

      this.arrays[name] = this.variables.filter((item) => {
        return item.includes(name + '.');
      });

      this.variables = this.variables.filter((each) => {
        return !this.arrays[name].includes(each);
      });
    });
  }

  _getFormatValue(value) {
    if (Num.isInt(value)) {
      return Num.def(value);
    } else if (Floa.isFloat(value)) {
      return Num.money(value);
    } else {
      return value;
    }
  }

  proccessSingleValues(str, arr, data) {
    arr.forEach((each) => {
      var value = Util.deepVal(each, data);
      if (value) {
        str = str.replaceAll('{' + each + '}', this._getFormatValue(value));
      }
    });

    return str;
  }

  getBetween(str, findKey) {
    var arr = str.split(findKey);

    // Remove Fisrt
    arr.splice(0, 1);

    // Remove Last
    arr.splice(-1, 1);

    return arr;
  }

  processVariables(str) {
    this.findAllVariables(str);

    if (this.variables && this.variables.length) {
      str = this.proccessSingleValues(str, this.variables, this.data);
    }

    if (this.arrays) {
      Object.keys(this.arrays).forEach((key) => {
        if (this.data[key]) {
          var arrayVariables = this.arrays[key];
          var findKey = '{' + key + '...}';

          var matches = this.getBetween(str, findKey);

          if (matches && matches.length) {
            matches.forEach((each) => {
              var innerContent = each;
              var contentResultArr = [];

              this.data[key].forEach((eachData) => {
                var dataHolder = {};
                dataHolder[key] = eachData;
                contentResultArr.push(this.proccessSingleValues(innerContent, arrayVariables, dataHolder));
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

  htmlFormatting(data) {
    const $ = cheerio.load(data);

    // Atributir a src correta para a imagem
    $('img').each((i, el) => {
      var alt = $(el).attr('alt');

      if (alt && alt.includes('http')) {
        $(el).attr('src', alt);
      }
    });

    // Remover selo Froala
    $("p[data-f-id='pbf']").remove();

    return $.html();
  }

  _load(callback) {
    if (this.id) {
      Template.findByKey(this.id, (err, template) => {
        callback(template);
      });
    } else if (this.templateUse) {
      Template.findByUsage(this.templateUse, (err, template) => {
        callback(template);
      });
    }
  }

  _handleSampleData(template) {
    if (this.useSample) {
      this.data = template.sample;
    } else if (this.data) {
      Template.updateSample(template._id, this.data);
    }

    return this.data && Object.keys(this.data).length > 0;
  }

  build(callback) {
    this._load((template) => {
      if (this._handleSampleData(template)) {
        template.subject = this.processVariables(template.subject);
        template.content = this.processVariables(template.content);
      }

      template.content = this.htmlFormatting(template.content);

      callback(template);
    });
  }

  get() {
    return new Promise((resolve) => {
      this.build(resolve);
    });
  }
};
