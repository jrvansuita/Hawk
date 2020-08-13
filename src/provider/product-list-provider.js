const Product = require('../bean/product.js');
const DataAccess = require('../mongoose/data-access.js');

module.exports = class ProductListProvider {
  constructor(user) {
    this.user = user;
  }

  with(query, page) {
    this.query = query;
    this.page = page;
    return this;
  }

  buildQuery() {
    var attrs = {};
    if (this.query.attrs) {
      for (const [key, value] of Object.entries(this.query.attrs)) {
        var seachValue = value;

        // Os attrs abaixo podem ter vários valores separadas por vírgula
        // Para todos os outros atributos, tem que ser exatamente o valor para buscar
        if (!['category', 'age'].includes(key)) {
          seachValue = '^' + value; // + '$'
        }

          console.log(attrs[key]);
         attrs[key] = DataAccess.regexpComp(key, seachValue)[key]
        // attrs[key] = {
        //   $regex: seachValue,
        //   $options: 'i',
        // };
      }
    }

    if (this.query.noQuantity === 'false') {
      // Acima de 0
      attrs.quantity = { $gt: 0 };
    }

    if (this.query?.filters) {
      Object.keys(this.query.filters).forEach(key => {
        attrs[key] = { $gte: Floa.def(this.query.filters[key][0]), $lte: Floa.def(this.query.filters[key][1]) };
      });
    }
    var result = Object.assign(Product.likeQuery(this.query.value), attrs);

    if (this?.user?.manufacturer) {
      result = { ...result, ...DataAccess.regexpComp('manufacturer', this.user.manufacturer) };
    }

    return result;
  }

  load(callback) {
    if (Array.isArray(this.query)) {
      Product.getBySkus(this.query, data => {
        callback(data);
      });
    } else {
      this.loadByQuery(callback);
    }
  }

  loadByQuery(callback) {
    if (this.page == null) {
      Product.find(this.buildQuery(), (_err, result) => {
        callback(result);
      });
    } else {
      Product.paging(this.buildQuery(), this.page, (_err, result) => {
        callback(result[0].items, result[0].info[0]);
      });
    }
  }
};
