const SaleLoader = require('../loader/sale-loader.js');

const request = require('request');

module.exports = class TrackingProvider {
  constructor(saleNumber) {
    this.saleNumber = saleNumber;
    this.setOnError((e) => {
      console.error(e);
    });
  }

  setOnError(onError) {
    this.onError = onError;
    return this;
  }

  findSale(callback) {
    new SaleLoader(this.saleNumber).setOnError(this.onError).run((sale) => {
      callback(sale);
    });
  }

  findTrackingData(callback) {
    var url = Params.trackingUrl().replace('__sale__', this.saleNumber);
    console.log(url);
    var options = {
      url: url,

      // hostname: 'www.boutiqueinfantil.com.br',
      // localAddress: '202.1.1.1',
      headers: {
        accept: 'application/json',
        origin: 'https://boutiqueinfantil.com.br',
        'content-type': 'application/json',
      },
    };

    request.post(options, (error, res, body) => {
      if (error) {
        if (this.onError) this.onError(error);
        return;
      }

      console.log('STATUS: ' + res.statusCode);
      console.log(res.req.headers);
      console.log(body);

      callback(body);
    });
  }

  get(callback) {
    if (this.saleNumber) {
      this.findSale((sale) => {
        this.findTrackingData((data) => {
          //   console.log(sale);
          //   console.log(data);

          callback();
        });
      });
    } else {
      callback();
    }
  }
};
