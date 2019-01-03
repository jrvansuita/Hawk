//Class helper for Settings
var Sett = {
   get(user, settNum){
    return user ? user.setts && user.setts[settNum.toString()] : false;
  }
};



if (typeof module != 'undefined')
module.exports = Sett;
