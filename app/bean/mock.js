module.exports = class MockSetting extends DataAccess {


  constructor(name, fontName, mockurl, msg, fontColor, fontShadowColor, priceBottomMargin, showDiscount, fontNameDiscount, discountFontColor, discountShadowColor, discountBackground, discountBackgroundShadow,  width, height) {
    super();
    this.name = Str.def(name);
    this.fontName = Str.def(fontName);
    this.msg = Str.def(msg);
    this.imgUrl = Str.def(mockurl);
    this.fontColor = Str.def(fontColor);
    this.fontShadowColor = Str.def(fontShadowColor);
    this.priceBottomMargin = Num.def(priceBottomMargin);

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
    return ['_id'];
  }


};
