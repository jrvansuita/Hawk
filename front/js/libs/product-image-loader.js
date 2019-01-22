class ProductImageLoader{
  constructor(imgElement){
    this.imgElement = imgElement;
  }

  src(path){
    this.srcPath = path;
    return this;
  }

  placeholder(path){
    this.placeholderPath = path;
    return this;
  }

  put(){

    var newImg = new Image();
    newImg.onload = ()=>{
      this.imgElement.attr('src', newImg.src).hide().fadeIn();
    };

    newImg.onerror = ()=>{
      var placeholderPath = this.placeholderPath ? this.placeholderPath : 'img/product-placeholder.png';
      this.imgElement.attr('src', placeholderPath).hide().fadeIn();
    };

    newImg.src = this.srcPath;
  }


}
