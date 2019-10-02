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

  setOnLoaded(onLoaded){
    this.onLoaded = onLoaded;
    return this;
  }

  withAnim(){
    this.anim = true;
    return this;
  }

  put(){
    var newImg = new Image();
    newImg.onload = ()=>{
      if (this.onLoaded){
        this.onLoaded();
      }

      this.imgElement.attr('src', newImg.src);

      if (this.anim){
        this.imgElement.hide().fadeIn();
      }
    };

    newImg.onerror = ()=>{
      var placeholderPath = this.placeholderPath ? this.placeholderPath : 'img/product-placeholder.png';

      this.imgElement.attr('src', placeholderPath);

      if (this.anim){
        this.imgElement.hide().fadeIn();
      }
    };

    newImg.src = this.srcPath;
  }


}
