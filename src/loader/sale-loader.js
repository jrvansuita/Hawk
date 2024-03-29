const EccosysProvider = require('../eccosys/eccosys-provider.js');
const History = require('../bean/history.js');

const Err = require('../error/error.js');

module.exports = class SaleLoader {
  constructor(data) {
    this.initialData = data;
    this.sale = data;
    this.list = [];
  }

  _callbackHit(onCallNext, onCallOuter) {
    if (typeof onCallNext === 'function') {
      onCallNext();
    }

    if (typeof onCallOuter === 'function') {
      onCallOuter(this.sale);
    }
    // this.checkTerminate();
  }

  _loadFinalAttrsOnSale() {
    if (!this.innerAttrsLoaded && this.sale) {
      this.innerAttrsLoaded = true;
      this.sale.transport = Util.transportName(this.sale.transportador);
      this.sale.paymentType = 'Não Encontrato';

      this.sale.observacaoInterna.split('\n').forEach((eachLine) => {
        if (eachLine.includes('dias')) {
          this.sale.deliveryTime = Num.def(Str.between(eachLine, '- ', ' dias'));
        } else if (eachLine.includes('Meio de pagamento:')) {
          // this.sale.paymentType = Str.between(this.sale.observacaoInterna, 'Meio de pagamento: ', ' ').replace('mundipagg_', '');
          var arr = eachLine.replace('Meio de pagamento: ', '').split(' ');

          this.sale.paymentType = arr[0] ? arr[0].replace('mundipagg_', '') : this.sale.paymentType;
          this.sale.coupom = arr[1] ? arr[1].toUpperCase() : '';
        } else if (eachLine.includes('Custo do Frete:')) {
          this.sale.frete = Floa.floa(eachLine.split(':')[1]) || Floa.floa(this.sale.frete);
        }
      });
    }
  }

  getSkusFromSale() {
    if (this.sale.items) {
      return this.sale.items.map((i) => {
        return i ? i.codigo : '';
      });
    } else {
      return [];
    }
  }

  setOnError(onError) {
    this.onError = onError;
    return this;
  }

  loadSale(saleNumber, onCallOuter) {
    new EccosysProvider()
      .setOnError(this.onError)
      .sale(saleNumber)
      .go((sale) => {
        if (!sale) {
          this.onError('O pedido ' + saleNumber + ' não existe!');
        } else {
          this.sale = sale;
          onCallOuter(sale);
        }
      });
  }

  loadClient(onCallOuter) {
    var funcClient = (onCallNext) => {
      if (this.sale.idContato && !this.sale.client) {
        new EccosysProvider()
          .setOnError(this.onError)
          .client(this.sale.idContato)
          .go((client) => {
            if (Object.keys(client).length === 0) {
              History.error(e, null, 'Erro ao carregar cliente ' + this.sale.idContato + ' do pedido ' + this.sale.numeroPedido);
            }

            this.sale.client = client;

            this._callbackHit(onCallNext, onCallOuter);
          });
      } else {
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(funcClient);

    return this;
  }

  reloadItems(onCallOuter) {
    return this.loadItems(onCallOuter, true);
  }

  prepareSaleItems(items) {
    return items.map((item) => {
      item.img = Params.productImageUrl(item.codigo);
      item.valorTotal = Math.abs((parseFloat(item.valor) - parseFloat(item.valorDesconto)) * parseFloat(item.quantidade));
      return item;
    });
  }

  loadItems(onCallOuter, force) {
    var funcItems = (onCallNext) => {
      if (!this.sale.items || force) {
        new EccosysProvider()
          .setOnError(this.onError)
          .saleItems(this.sale.numeroPedido)
          .go((items) => {
            this.sale.items = this.prepareSaleItems(items);
            this.sale.itemsQuantity = items.reduce(function (a, b) {
              return a + parseFloat(b.quantidade);
            }, 0);

            this._callbackHit(onCallNext, onCallOuter);
          });
      } else {
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(funcItems);

    return this;
  }

  loadItemsDeepAttrs(onCallOuter, onBindEachProduct) {
    var funcItemsWeight = (onCallNext) => {
      new EccosysProvider()
        .setOnError(this.onError)
        .skus(this.getSkusFromSale())
        .go((products) => {
          for (const item of this.sale.items) {
            for (const product of products) {
              if (item.codigo == product.codigo) {
                item.liq = product.pesoLiq;
                item.bru = product.pesoBruto;
                item.local = product.localizacao;
                item.ncm = product.cf;

                if (onBindEachProduct) {
                  onBindEachProduct(item, product);
                }
                break;
              }
            }
          }

          this._callbackHit(onCallNext, onCallOuter);
        });
    };

    this.list.push(funcItemsWeight);

    return this;
  }

  loadNfe(onCallOuter) {
    var funcNfe = (onCallNext) => {
      if (this.sale.numeroNotaFiscal && !this.sale.nfe) {
        new EccosysProvider()
          .setOnError(this.onError)
          .nfe(this.sale.numeroNotaFiscal)
          .go((nfe) => {
            this.sale.nfe = nfe;
            this._callbackHit(onCallNext, onCallOuter);
          });
      } else {
        this._callbackHit(onCallNext, onCallOuter);
      }
    };

    this.list.push(funcNfe);

    return this;
  }

  loadProducts(onCallOuter) {
    var funcProducts = (onCallNext) => {
      new EccosysProvider()
        .setOnError(this.onError)
        .skus(this.getSkusFromSale())
        .go((products) => {
          this._callbackHit(onCallNext, () => {
            onCallOuter(products, this.sale);
          });
        });
    };

    this.list.push(funcProducts);

    return this;
  }

  callFuncs(index) {
    if (index < this.list.length) {
      this.list[index](() => {
        index++;
        this.callFuncs(index);
      });
    } else {
      if (typeof this.onFinished === 'function') {
        this._loadFinalAttrsOnSale();
        this.onFinished(this.sale);
        this.onFinished = null;
      }
    }
  }

  run(onFinished) {
    this.onFinished = onFinished;

    if (typeof this.sale !== 'object') {
      this.loadSale(this.sale, (sale) => {
        this.callFuncs(0);
      });
    } else {
      this.callFuncs(0);
    }
  }
};
