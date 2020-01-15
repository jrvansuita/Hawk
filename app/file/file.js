const fs = require('fs')

module.exports = class{

  setName(name){
    this.name = name;
    return this;
  }

  setFolder(folder){
    this.folder = folder;
    return this;
  }

  fromCanvas(canvas){
    this.canvas = canvas;
    return this;
  }

  getFullPath(){
    return this.folder + '/' + this.name;
  }

  save(callback){
    fs.mkdir(this.folder, { recursive: true }, (err) => {
      var out = fs.createWriteStream(this.getFullPath());
      var stream = this.canvas.pngStream();

      stream.on('data', function(chunk){
        out.write(chunk);
      });

      stream.on('end', () => callback(out));
    });

  }


};
