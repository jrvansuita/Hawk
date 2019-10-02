const Err = require('../error/error.js');
const Mock = require('../bean/mock.js');

module.exports = class MockHandler {

  static storeFromScreen(params, callback) {
    console.log(params.mockurl);

    var mock = new Mock(
      params.fontName,
      params.mockurl,
      params.msg,
      params.fontColor,
      params.fontShadowColor,
      params.showDiscount.includes('true'),
      params.fontNameDiscount,
      params.discountFontColor,
      params.discountShadowColor,
      params.discountBackground,
      params.discountBackgroundShadow,
      params.width,
      params.height
    );


    mock.upsert((err, doc)=>{
      callback(doc);
    });

  }




};
