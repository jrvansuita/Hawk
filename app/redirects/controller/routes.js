const Response = require('../../util/response.js');

module.exports = class Routes {

  constructor(app){
    this.app = app;
  }

  _page(paths, callback){
    this._get(paths, (req, res, body, locals, session)=>{
      req.session.lastpath = [paths][0];
      callback(req, res, body, locals, session);
    });
  }


  _get(paths, callback){
    this.app.get(paths, (req, res) => {
      Response.onTry(res, ()=>{
        callback(req, res, req.body, res.locals, req.session);
      });
    });
  }

  _post(paths, callback){
    this.app.post(paths, (req, res) => {
      Response.onTry(res,()=>{
        callback(req, res, req.body, res.locals, req.session);
      });
    });
  }

  _resp(){
    return Response;
  }

};
