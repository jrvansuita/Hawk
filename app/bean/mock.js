module.exports = class MockSetting extends DataAccess {


  constructor(fontName, mockurl, msg, fontColor, fontShadowColor, showDiscount, fontNameDiscount, discountFontColor, discountShadowColor, discountBackground,discountBackgroundShadow,  width, height) {
    super();
    this.id = 1;
    this.fontName = Str.def(fontName);
    this.msg = Str.def(msg);
    this.imgUrl = Str.def(mockurl);
    this.fontColor = Str.def(fontColor);
    this.fontShadowColor = Str.def(fontShadowColor);

    this.showDiscount = showDiscount ? true: false;
    this.fontNameDiscount = Str.def(fontNameDiscount);
    this.discountFontColor = Str.def(discountFontColor);
    this.discountShadowColor = Str.def(discountShadowColor);
    this.discountBackground = Str.def(discountBackground);
    this.discountBackgroundShadow = Str.def(discountBackgroundShadow);

    this.width = Num.def(width);
    this.height = Num.def(height);
  }

  static getKey() {
    return ['id'];
  }


  static get(callback){
    MockSetting.findOne({id : 1}, callback);
  }




};
