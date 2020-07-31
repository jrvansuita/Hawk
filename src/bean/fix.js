module.exports = class Fix extends DataAccess {
  constructor(sku, name, type, brand, manufacturer) {
    super();
    this.sku = Str.def(sku);
    this.name = Str.def(name);
    this.type = Str.def(type);
    this.date = new Date();
    this.brand = Str.def(brand);
    this.manufacturer = Str.def(manufacturer);
  }

  static findByType(type, callback) {
    Fix.find({ type: type }, callback);
  }

  static findBySku(sku, callback) {
    var regexp = new RegExp('^' + sku);
    Fix.find({ sku: regexp }, callback);
  }

  static findByBrand(brandName, type, callback) {
    var query = {
      name: {
        $regex: brandName,
        $options: 'i',
      },
    };

    if (type > -1) {
      query.type = type;
    }

    Fix.find(query, callback);
  }

  static put(product, type) {
    new Fix(product.codigo, product.nome, type, product.Marca, product.Fabricante).upsert();
  }

  static getKey() {
    return ['sku', 'type'];
  }

  static removeSkuAll(sku) {
    sku = sku.split('-')[0];

    var regexp = new RegExp('^' + sku);

    this.staticAccess().deleteMany({ sku: regexp }, err => {});
  }

  static sums(callback) {
    Fix.aggregate(
      [
        {
          $group: {
            _id: {
              type: '$type',
            },
            sum_count: {
              $sum: 1,
            },
          },
        },
      ],
      function (err, res) {
        if (callback) {
          callback(err, res);
        }
      }
    );
  }
};
