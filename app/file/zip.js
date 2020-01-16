const archiver = require('archiver');
const path = require("path");
const fs = require('fs')

module.exports = class{


  setName(name){
    this.name = name;
    return this;
  }

  setPath(path){
    this.path = path;
    return this;
  }

  setFiles(files){
    this.files = files;
    return this;
  }

  getFullPath(){
    return this.path + '/' +  this.name + '.zip';
  }

  setOnError(onError){
    this.onError = onError;
    return this;
  }



  run(callback){

    var output = fs.createWriteStream(this.getFullPath());
    var archive = archiver('zip', {
      gzip: true,
      zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('error', function(err) {
      if (this.onError){
        this.onError();
      }

      throw err;
    });

    // pipe archive data to the output file
    archive.pipe(output);

    // append files
    this.files.forEach((file) => {
      archive.file(file.path, {name:  path.basename(file.path)});
    })

    output.on('close', () => callback(this.getFullPath()));

    archive.finalize();
  }



};
