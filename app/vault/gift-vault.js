const Err = require('../error/error.js');
const GiftRule = require('../bean/gift-rule.js');

module.exports = class  {




  static storeFromScreen(params, callback) {

    var gift = new GiftRule(
      params.id,
      params.name,
      params.active.includes('true'),
      params.checkStock.includes('true'),
      new Date(parseInt(params.expires))
    );

    gift.addSkus(params.skus);
    gift.addRules(params.rules);

    gift.upsert((err, doc)=>{
      callback(doc);
    });

  }




    static delete(id, callback){
      GiftRule.findOne({id:id}, (err, item)=>{
        item.remove(callback);
      });
    }




};
