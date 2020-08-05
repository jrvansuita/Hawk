const cookieSession = require('cookie-session');
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');

module.exports = class ServerRunner {
  constructor(startListening) {
    this.express = express();
    this.startListening = startListening;
  }

  build() {
    this.beyond();
    this.fileUpload();
    this.parser();
    this.cookies();
    this.viewEngine();
    this.cors();
    this.static();

    return this;
  }

  getPort() {
    return process.env.PORT || 3000;
  }

  beyond() {
    this.express.set('port', this.getPort());
    this.express.listen().setTimeout(120000); // 2 minutos
  }

  fileUpload() {
    this.express.use(
      fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        useTempFiles: true
      })
    );
  }

  parser() {
    this.express.use(bodyParser.json({ limit: '5mb' }));
    this.express.use(
      bodyParser.urlencoded({
        extended: true,
        limit: '5mb',
        parameterLimit: 1000000,
      })
    );
  }

  cookies() {
    this.express.use(
      cookieSession({
        name: 'hawk-session',
        secret: 'HAWK-SES',
        maxAge: 30 /* 30 dias */ * (24 * 60 * 60 * 1000), // 24 hours
      })
    );
  }

  viewEngine() {
    this.express.set('view engine', 'ejs');
    this.express.set('views', require('path').resolve('./') + '/views');
  }

  getaAlowedOrigins() {
    if (this.allowedOrigins) {
      return this.allowedOrigins;
    }

    this.allowedOrigins = [global.Params.storeUrl()];
    if (!process.env.IS_PRODUCTION) this.allowedOrigins.push('http://localhost:' + this.getPort());
    return this.allowedOrigins;
  }

  cors() {
    this.express.use((req, res, next) => {
      if (this.getaAlowedOrigins().indexOf(req.headers.origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      next();
    });
  }

  static() {
    this.express.use('/img', express.static('front/img', this.getaAlowedOrigins()));
    this.express.use('/front', express.static('front', this.getaAlowedOrigins()));
    this.express.use('/util', express.static('src/util', this.getaAlowedOrigins()));
    this.express.use('/param', express.static('src/vars/params.js', this.getaAlowedOrigins()));
  }

  run(callback) {
    if (this.startListening) {
      var server = this.express.listen(this.getPort(), () => {
        // console.log('Node is running on port ', this.getPort())
      });
    }

    global.io = require('socket.io')(server || null);

    if (callback) callback(this.express);
  }
};
