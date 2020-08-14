/* eslint-disable standard/no-callback-literal */
const SaleLoader = require('../loader/sale-loader.js');
const Enum = require('../bean/enumerator.js');

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

    var options = {
      url: url,
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

      callback(body);
    });
  }

  async buildResult(sale, trackingData) {
    trackingData = JSON.parse(trackingData);

    var result = { tracking: trackingData?.dados ?? trackingData };

    var {
      deliveryTime,
      dataEntrega,
      dataPrevista,
      numeroPedido,
      totalVenda,
      transport,
      paymentType,
      dataFaturamento,
      data,
      numeroNotaFiscal,
      pedidoColetado,
      observacaoInterna,
      _OutroEndereco,
    } = sale;

    result.sale = {
      transport,
      paymentType,
      deliveryTime,
      deliveryDate: dataEntrega,
      expectedDate: dataPrevista,
      invoiceDate: dataFaturamento,
      buyDate: data,
      nf: numeroNotaFiscal,
      saleNumber: numeroPedido,
      saleSent: pedidoColetado,
      total: totalVenda,
      obs: observacaoInterna,
      destiny: _OutroEndereco,
      icon: await Enum.on('TRANSPORT-IMGS').hunt(transport.toLowerCase(), 'value'),
    };

    return result;
  }

  get(callback) {
    if (this.saleNumber) {
      this.findSale((sale) => {
        this.findTrackingData(async (data) => {
          callback(await this.buildResult(sale, data));
        });
      });
    } else {
      callback();
    }
  }
};
