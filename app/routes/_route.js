
module.exports = class {

  constructor(app){
    this.app = app;
  }

  _page(paths, callback, pathNotLogged){
    if (pathNotLogged){
      this.addNotLoggedNeeded(paths);
    }

    this._get(paths, (req, res, body, locals, session)=>{
      callback(req, res, body, locals, session);
      req.session.lastpath = paths instanceof Array ? paths[0] : paths;
    });
  }


  _get(paths, callback, pathNotLogged, enableCors){
    if (pathNotLogged){
      this.addNotLoggedNeeded(paths);
    }



    this.app.get(paths, (req, res) => {
      Response.onTry(res, ()=>{

        if(enableCors){
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        }

        callback(req, res, req.body, res.locals, req.session);
      });
    });
  }

  _post(paths, callback, pathNotLogged, enableCors){
    if (pathNotLogged){
      this.addNotLoggedNeeded(paths);
    }

    this.app.post(paths, (req, res) => {
      Response.onTry(res,()=>{

        if(enableCors){
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        }

        callback(req, res, req.body, res.locals, req.session);
      });
    });
  }


  _checkPermissionOrGoBack(req, res, settNum){
    var user = res.locals.loggedUser;
    if (!Sett.get(user, settNum)){
      res.redirect(req.session.lastpath);
      return false;
    }

    return true;
  }


  _resp(){
    return Response;
  }

  addNotLoggedNeeded(path){
    this.createNotLogged();

    global.pathNotLogged.push(path);
  }

  createNotLogged(){
    if (!global.pathNotLogged){
      global.pathNotLogged = [];
    }
  }

  //Verifica se o caminho é uma das páginas acessiveis sem login como Login/User-registering etc
  static checkIsPathNotLogged(path){
    return Arr.isIn(global.pathNotLogged, path);
  }
};



const History = require('../bean/history.js');
const Err = require('../error/error.js');


var Response = {

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
    if (typeof r == 'number'){
      r = r.toString();
    }

    res.status(200).send(r);
  },

  error(res, e){
    console.log('Printing error: ' + e.toString());

    var userId = res.locals.loggedUser ? res.locals.loggedUser.id : 0;
    History.handle(e, userId);

    res.status(500).send(e.toString());
  }
};
