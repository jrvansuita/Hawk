const {createCanvas, loadImage, registerFont } = require('canvas');

module.exports = class {

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

      this.canvas = createCanvas(this.productImage.width, this.productImage.height);
      this.context = this.canvas.getContext('2d');
      this.context.drawImage(this.productImage, 0, 0);


      callback();
    });
  }

  _geProductImage(){
    if (this.product){
      return this.product.image;
    }else{
      return './front/img/product-placeholder.png';
    }
  }

  load(){
    this.loadImages(()=>{
      if (this.setOnFinishedListener){
        this.setOnFinishedListener(this.canvas);
      }
    });
  }

};
