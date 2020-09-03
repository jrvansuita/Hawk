const EccosysStorer = require('../eccosys/eccosys-storer.js');
const EccosysProvider = require('../eccosys/eccosys-provider.js');
const Product = require('../bean/product.js');
const MagentoCalls = require('../magento/magento-calls.js');

module.exports = {
  updateLocal(sku, newLocal, user, device, callback) {
    device = device || 'Desktop';

    this._getBySku(sku, false, (product) => {
      newLocal = newLocal.toUpperCase();

      // Reduzir a obs
      var lines = product.obs.split('\n');
      lines = lines.slice(lines.length - 15, lines.length);

      lines = lines.join('\n');

      var body = {
        codigo: product.codigo,
        localizacao: newLocal,
        obs: lines + '\n' + user.name + ' | ' + device + ' | ' + newLocal + ' | ' + Dat.format(new Date()) + '| Localização',
      };

      new EccosysStorer().product().update(body).go(callback);
    });
  },

  updateNCM(sku, newNCM, user, callback) {
    this._getBySku(sku, false, (product) => {
      newNCM = newNCM.trim();
      var lines = product.obs;

      var body = {
        codigo: product.codigo,
        cf: newNCM,
        obs: lines + '\n' + user.name + ' | Desktop | ' + newNCM + ' | ' + Dat.format(new Date()) + '| NCM',
      };

      new EccosysStorer().product().update(body).go(callback);
    });
  },

  updateStock(sku, stock, user, device, callback) {
    device = device || 'Desktop';

    stock = !isNaN(parseInt(stock)) ? parseInt(stock) : 0;

    /** Realiza a alteracao de estoque no eccosys **/
    this._getBySku(sku, false, (product) => {
      var body = {
        codigo: product.codigo,
        quantidade: Math.abs(stock),
        es: stock < 0 ? 'S' : 'E',
        obs: device + ' - ' + user.name,
        // Manter o mesmo preço
        custoLancamento: product.precoCusto,
        preco: product.preco,
      };

      /** Realiza a alteracao de estoque no eccosys **/
      new EccosysStorer().stock(product.codigo, body).go(callback);

      /** Realiza a alteracao de estoque no magento **/
      if (global.Params.updateProductStockMagento()) {
        new MagentoCalls().productStock(product.codigo).then((data) => {
          if (data.length === 1) {
            var stockMagento = Math.max(parseFloat(data[0].qty) + stock, 0);
            new MagentoCalls().updateProductStock(product.codigo, stockMagento);

            /** Realiza a alteracao no Mongodb **/
            Product.upsert({ sku: product.codigo.split('-')[0] }, { $inc: { quantity: stock } });
          }
        });
      }

      /** Realiza a alteracao de estoque no magento **/
    });
  },

  updateWeight(sku, weight, user, callback) {
    weight = Floa.floa(weight);

    this._getBySku(sku, false, (product) => {
      var lines = product.obs;

      var body = {
        codigo: product.codigo,
        pesoLiq: Math.abs(weight),
        pesoBruto: Math.abs(weight),
        obs: lines + '\n' + user.name + ' | Desktop | ' + Floa.weight(weight) + ' | ' + Dat.format(new Date()) + '| Peso',
      };

      new EccosysStorer().product().update(body).go(callback);

      if (Params.updateProductWeightMagento()) {
        new MagentoCalls().updateProductWeight(product.codigo, weight);
      }
    });
  },

  active(sku, active, user, callback) {
    this._getBySku(sku, true, (product) => {
      var skus = [product ? product.codigo : sku];
      if (product && product._Skus && product._Skus.length > 0) {
        skus = skus.concat(
          product._Skus.map((s) => {
            return s.codigo;
          })
        );
      }

      this.activeSingle(skus, active, user, callback);
    });
  },

  activeSingle(sku, active, user, callback) {
    new EccosysProvider().skus(sku).go((products) => {
      var body = [];

      products.forEach((each) => {
        body.push({
          codigo: each.codigo,
          situacao: active ? 'A' : 'I',
          obs: each.obs + '\n' + user.name + ' | Desktop | ' + (active ? 'Ativo' : 'Inativo') + ' | ' + Dat.format(new Date()) + '| Situação',
        });
      });

      new EccosysStorer().product().update(body).go(callback);
    });
  },

  /* Verificar */
  _getBySku(sku, father, callback) {
    new EccosysProvider(false).product(father ? this._getFatherSku(sku) : sku).go((product) => {
      callback(product);
    });
  },

  _getFatherSku(sku) {
    return sku ? sku.split('-')[0] : sku;
  },
};
