const Response = require('../../util/response.js');


module.exports = class Routes {

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


  _get(paths, callback, pathNotLogged){
    if (pathNotLogged){
      this.addNotLoggedNeeded(paths);
    }

    this.app.get(paths, (req, res) => {
      Response.onTry(res, ()=>{
        callback(req, res, req.body, res.locals, req.session);
      });
    });
  }

  _post(paths, callback, pathNotLogged){
    if (pathNotLogged){
      this.addNotLoggedNeeded(paths);
    }

    this.app.post(paths, (req, res) => {
      Response.onTry(res,()=>{
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

  //Verifica se o caminho é uma das páginas acessiveis sem login como Login/User-Form etc
  static checkIsPathNotLogged(path){
    return Util.isIn(global.pathNotLogged, path);
  }
};
