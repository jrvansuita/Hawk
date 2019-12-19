var imgur = require('imgur');

module.exports = {

  upload(base64Image, callback){
    imgur.setCredentials(Params.imgurEmail(), Params.imgurPass(), Params.imgurId());

    imgur.uploadBase64(base64Image)
    .then(function (json) {
      console.log(json.data);
      callback(json.data);
    })
    .catch(function (err) {
      callback(err);
    });
  }


};
