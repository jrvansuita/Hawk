const Product = require('../bean/product.js');
const EmailBuilder = require('../email/email-builder.js');


module.exports = class ProductBoardEmailHandler {

  go(callback){
    Product.boardPerformance({sync: true, newStock: {$gt:100}}, (err, data) => {
      Product.boardPerformance({sync: true, newStock: {$lt: -50}}, (err, saida)=>{
        var result = Object.assign({}, this._buildObject(data[0], "in_"), this._buildObject(saida[0], "out_"));
        this._sendEmail(result, (res) => {
          console.log(res);
        });

      });
    });
  }

  _buildObject(data, type){
    var arrays = {};

    Util.forProperty(data, (each, key) => {
      arrays[type + key] = each.sort((a, b)=>{
        return b.stock - a.stock;
      });
    });

    return arrays;
  }

  _sendEmail(data, callback){
    new EmailBuilder()
    .template('STOCK')
    .to(Params.performanceEmailsReport())
    .setData(data).send(callback);
  }
}
