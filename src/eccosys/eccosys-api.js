const https = require('https');
const MD5 = require('../util/md5.js');
const Err = require('../error/error.js');
const Query = require('../util/query.js');

const EmailBuilder = require('../email/email-builder.js');

module.exports = class EccosysApi {
  constructor(log) {
    this.query = new Query();
    this.page_count = 100;
    this.log = !!log;
    this.jsonResult(true);
  }

  jsonResult(val) {
    this.parsedJsonResult = val;
    return this;
  }

  pageCount(pageCount) {
    this.page_count = pageCount;
    return this;
  }

  page(page) {
    this.query.add('$count', this.page_count);
    this.query.add('$offset', this.page_count * page);
    return this;
  }

  limit(limit) {
    return this.pageCount(limit).page(0);
  }

  dates(from, to, considerDate, prefix) {
    if (considerDate) {
      this.query.add((prefix ? '$' : '') + 'dataConsiderada', considerDate);
    }

    this.query.addDate('$fromDate', from);
    this.query.addDate('$toDate', to);

    return this;
  }

  nfeParams() {
    this.query.add('serie', '1');
    this.query.add('estornarEstoque', 'S');
    this.query.add('tipo', 'S');

    return this;
  }

  param(name, val) {
    this.query.add(name, val);
    return this;
  }

  order(order) {
    return this.param('$order', order);
  }

  active() {
    return this.param('$filter', 'situacao=A');
  }

  setMethod(method) {
    this.method = method;
    return this;
  }

  withUser(user) {
    this.user = user;
    return this;
  }

  setPath(path) {
    this.path = path;
    return this;
  }

  setBody(body) {
    this.body = body;
    return this;
  }

  setOnError(onError) {
    this.onError = onError;
    return this;
  }

  prepare(func) {
    this.onPrepare = func;
    return this;
  }

  filter(func) {
    this.onFilter = func;
    return this;
  }

  jsonFilter(multiple) {
    return this.filter((data) => {
      var def = multiple ? [] : undefined;
      var result = multiple ? [].concat(data) : data[0] || data;
      return typeof data === 'string' ? def : result;
    });
  }

  single() {
    return this.jsonFilter(false);
  }

  multiple() {
    return this.jsonFilter(true);
  }

  options() {
    var params = this.query.hasParams() ? this.query.build() : '';

    var path = '/api/' + encodeURI(this.path + params);

    var options = {
      host: Params.eccosysUrl(),
      port: 443,
      timeout: 60000, // 1 minutos
      path: path,
      method: this.method,
      url: 'https://' + Params.eccosysUrl() + path,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    };

    if (this.user && this.user.token) {
      options.headers['x-access-token'] = this.user.token;
    } else {
      options.headers.signature = generateSignature();
      options.headers.apikey = Params.eccosysApi();
    }

    if (this.log) {
      console.log(path);
      console.log(options);
    }

    this.optionsData = options;

    return options;
  }

  checkErrorStatus(data) {
    if (data.includes('Service Temporarily Unavailable') || data.includes('Bad Gateway') || data.startsWith('<html>')) {
      global.eccoConnErrors++;

      // Só vamos dar throw nas 2 primeiras requests.
      // Se nao fica muito poluído o historico
      if (global.eccoConnErrors <= 2) {
        var msg = data.includes('<title>502') ? '502 Bad Gateway' : data;
        msg = Const.api_not_available.format(msg) + '\n' + this.method + ': /' + this.path;

        onEmailReportEccosysAPIDown(this.optionsData, msg);

        throw Err.thrw(msg, this.user);
      } else {
        throw undefined;
      }
    } else {
      if (global.eccoConnErrors > 0) {
        global.eccoConnErrors--;
      }
    }

    return data;
  }

  make(onGetResponse, onGetBuffer) {
    var self = this;
    var req = https.request(this.options(), function (res) {
      var responseBody = '';
      var chucks = [];

      res.on('data', function (chunk) {
        responseBody += chunk;
        chucks.push(chunk);
      });

      res.on('end', function () {
        self.checkErrorStatus(responseBody);

        if (onGetResponse) {
          if (self.parsedJsonResult) {
            responseBody = JSON.parse(responseBody);
          }

          if (self.onFilter) {
            responseBody = self.onFilter(responseBody);
          }

          if (self.onPrepare) {
            responseBody = self.onPrepare(responseBody);
          }

          onGetResponse(responseBody);
        }

        if (onGetBuffer) {
          onGetBuffer(chucks);
        }
      });
    });

    req.on('error', function (e) {
      if (self.onError) {
        self.onError(new Err(e.toString(), self.user));
      }
    });

    if (this.body) {
      var parsedBody = JSON.stringify(this.body);

      if (this.log) {
        console.log(parsedBody);
      }

      req.write(parsedBody);
    }

    req.end();
  }

  get(path) {
    return this.setMethod('GET').setPath(path);
  }

  put(path) {
    return this.setMethod('PUT').setPath(path);
  }

  post(path) {
    return this.setMethod('POST').setPath(path);
  }

  delete(path) {
    return this.setMethod('DELETE').setPath(path);
  }

  download(path, res, docName) {
    this.setMethod('GET')
      .jsonResult(false)
      .setPath(path)
      .make(null, (chunks) => {
        var file = new Buffer.concat(chunks);

        res.type('application/pdf');
        res.setHeader('Content-disposition', 'inline; filename="' + docName + '"');
        res.send(file);
      });
  }

  go(callback) {
    this.make(callback);
  }

  pagging() {
    var page = 0;

    var callbackHandler = {
      each: function (callback) {
        this.onEach = callback;
        return this;
      },

      end: function (callback) {
        this.onEnd = callback;
      },
    };

    var makePagging = () => {
      this.page(page).go((data) => {
        page++;

        if (data.length > 0) {
          if (callbackHandler.onEach) {
            callbackHandler.onEach(data, makePagging);
          }
        } else {
          if (callbackHandler.onEnd) {
            callbackHandler.onEnd();
          }
        }
      });
    };

    makePagging();

    return callbackHandler;
  }
};

// Gera uma nova Signature
var signature;

function generateSignature() {
  if (!signature) {
    signature = MD5.get(Params.eccosysSecret() + ':' + Dat.signatureDate(new Date()));
  }

  return signature;
}

function onEmailReportEccosysAPIDown(options, error) {
  if (global.eccoConnErrors == 1 && !error.includes('502')) {
    if (Params.eccosysApiReportEmails().length > 0) {
      new EmailBuilder()
        .template('API_DOWN')
        .to(Params.eccosysApiReportEmails())
        .setData({
          error: error,
          options: '\n\n <p><pre>' + JSON.stringify(options, undefined, 2) + '</pre></p>',
        })
        .send();
    }
  }
}
