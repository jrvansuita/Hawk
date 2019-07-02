var imgur = require('imgur');


module.exports = {

  upload(base64Image, callback){
    imgur.setCredentials(process.env.IMGUR_EMAIL, process.env.IMGUR_PASS, process.env.IMGUR_CLIENT_ID);

    imgur.uploadBase64(base64Image)
    .then(function (json) {
      callback(json.data);
    })
    .catch(function (err) {
      callback(err);
    });
  }


};
