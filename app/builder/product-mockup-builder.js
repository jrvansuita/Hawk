const {createCanvas, loadImage, registerFont } = require('canvas');
const TypeFace = require('../typeface/typeface.js');
const Mock = require('../bean/mock.js');

module.exports = class {

  constructor(){

  }

  setProduct(product){
    this.product = product;
    return this;
  }

  setOnFinishedListener(listener){
    this.setOnFinishedListener = listener;
    return this;
  }


  loadImages(callback){
    // Load the product image
    loadImage(this._geProductImage()).then((image) => {
      this.productImage = image;

      // Load the mockup imaage
      loadImage(this.mockSett.imgUrl).then((image) => {
        this.mockupImage = image;

        callback();
      });
    });
  }

  loadSettings(callback){
    this.mockSett = {};

    Mock.get((err, mock)=>{
      this.mockSett = mock;
      callback();
    });
  }


  _geProductImage(){
    return   this.product ? this.product.image : './front/img/product-placeholder.png';
  }


  _getPrice(){
    return this.product ? Num.money(this.product.price) : 'R$ 0,00';
  }

  _getFromPrice(){
    return this.product ? Num.money(this.product.fromPrice) : 'R$ 0,00';
  }

  _getDiscount(){
    return this.product ? Math.trunc(this.product.discount) + '%' : '0%';
  }

  _getMsg(){
    var msg = this.mockSett.msg
    .replace('{preco}',this._getPrice())
    .replace('{preco-de}',this._getFromPrice())
    .replace('{desconto}',this._getDiscount());

    return msg;
  }


  _getDiscountBackgroundColor() {
    var p = this.context.getImageData(this.canvas.width - 5, this.canvas.height - 5, 1, 1).data;
    var s = ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16);
    var backgroundColor = "#" + ("000000" + s).slice(-6);


    return backgroundColor;
  }

  n(v) {
    var perc = (this.canvas.width) * 100 / 1000;
    return perc * v / 100
  }

  applyFontShadow(shadowColor) {
    this.context.shadowColor = shadowColor;
    this.context.shadowBlur = 5;
    this.context.shadowOffsetX = 1;
    this.context.shadowOffsetY = 1;
  }

  //Filling canvas with white background
  fillCanvasWhiteBackground() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderDiscount() {

    var rightMargin = this.n(100);
    var topMargin = this.n(100);

    //Circle for the discount
    this.context.beginPath();
    this.context.arc(this.canvas.width - rightMargin, topMargin, this.n(65), 0, 2 * Math.PI, false);
    this.context.fillStyle = this.mockSett.discountBackground;
    this.context.shadowColor = this.mockSett.discountBackgroundShadow;
    this.context.shadowBlur = 10;
    this.context.shadowOffsetX = 5;
    this.context.shadowOffsetY = 5;
    this.context.fill();

    rightMargin += this.n(this._getDiscount().length * 16);
    this.context.font = "bold " + this.n(35) + "pt " + this.mockSett.fontNameDiscount;
    this.context.fillStyle = this.mockSett.discountFontColor;
    this.applyFontShadow(this.mockSett.discountShadowColor);
    this.context.fillText(this._getDiscount(), this.canvas.width - rightMargin, topMargin + this.n(13));
  }

  renderProductPrice() {
    var leftPriceMargin = this.n(45);

    this.applyFontShadow(this.mockSett.fontShadowColor);

    /* Placing the product Price */
    this.context.font = "bold " + this.n(50) + "pt " + this.mockSett.fontName;
    this.context.fillStyle = this.mockSett.fontColor;
    var bottomPriceMargin = this.n(45);
    this.context.fillText(this._getPrice(), leftPriceMargin, this.canvas.height - bottomPriceMargin);

    this.context.font = "bold " + this.n(20) + "pt " + this.mockSett.fontName;
    this.context.fillStyle = this.mockSett.fontColor;
    var bottomPriceMargin = this.n(110);
    this.context.fillText(this._getMsg(), leftPriceMargin + 5, this.canvas.height - bottomPriceMargin);
  }

  loadFont(callback){
    new TypeFace()
    .setFonts([this.mockSett.fontName , this.mockSett.fontNameDiscount])
    .load((files)=>{
      try{
        files.forEach((file)=>{
          registerFont(file, { family: 'OpenSans', weight: 'bold' });
        });
      }catch(e){

      }

      if (callback){
        callback();
      }
    });
  }

  definePaddings(){
    this.padding = 0;
    this.paddingTop = 0;

    if (!this.product || this.product.associates){
      //Define a negative top margin for product image
      var minSize = 600;
      this.padding = this.n(this.productImage.width < minSize ? 450 : 190);
      this.paddingTop = this.n(this.productImage.width < minSize ? 150 : 10);
    }
  }

  renderingImages() {
    this.definePaddings();

    this.context.drawImage(this.productImage, this.padding/2, this.paddingTop, this.canvas.width - this.padding, this.canvas.height - this.padding);
    this.context.drawImage(this.mockupImage, 0, this.canvas.height - this.mockupImage.height, this.canvas.width, this.mockupImage.height);
  }

  initCanvas(){
    this.canvas = createCanvas(this.mockSett.width, this.mockSett.width);
    this.context = this.canvas.getContext('2d');
  }

  load(){
    this.loadSettings(()=>{
      this.initCanvas();

      this.loadImages(()=>{
        this.loadFont(()=>{
          this.fillCanvasWhiteBackground();
          this.renderingImages();
          this.renderProductPrice();

          if(this.mockSett.showDiscount){
            this.renderDiscount();
          }

          if (this.setOnFinishedListener){
            this.setOnFinishedListener(this.canvas);
          }
        });
      });
    });
  }


};
