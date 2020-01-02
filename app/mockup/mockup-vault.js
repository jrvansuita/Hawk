const Err = require('../error/error.js');
const Mock = require('../bean/mock.js');

module.exports = class MockHandler {

  static storeFromScreen(params, callback) {

    var mock = new Mock(
      params.name,
      params.fontName,
      params.mockurl,
      params.msg,
      params.fontColor,
      params.fontShadowColor,
      params.priceBottomMargin,
      params.showDiscount,
      params.fontNameDiscount,
      params.discountFontColor,
      params.discountShadowColor,
      params.discountBackground,
      params.discountBackgroundShadow,
      params.width,
      params.height
    );


    if (params._id.toString().length>0){
      mock._id = params._id;
    }

    if (mock._id){
      mock.upsert((err, doc)=>{
        callback(doc ? doc._id : 0);
      });
    }else{
      Mock.create(mock, (err, doc)=>{
        callback(doc ? doc._id : 0);
      });
    }

  }




};
