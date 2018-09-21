const History = require('../bean/history.js');
const Err = require('../error/error.js');

module.exports = {

   onTry(res, call){
     try {
       call();
     } catch (e) {
       this.error(res, e);
     }
   },

  redirect(res){
    return (response, error)=>{
      this.onRedirect(res, response, error);
    };
  },

  onRedirect(res, r, e){
    if (e != undefined){
      this.error(res, e);
    }else{
      this.sucess(res, r);
    }
  },

  sucess(res, r){
    res.status(200).send(r);
  },

  error(res, e){
    console.log('Printing error:');
    console.log(e);

    var userId = res.locals.loggedUser ? res.locals.loggedUser.id : 0;
    History.handle(e, userId);

    res.status(500).send(e.toString());

  }
};
