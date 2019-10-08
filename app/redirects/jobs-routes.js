const Routes = require('../redirects/controller/routes.js');
const PickingHandler = require('../handler/picking-handler.js');

module.exports = class JobsRoutes extends Routes{

  attach(){
    this._post('/run-jobs', (req, res) => {
      runJobs(req, (result)=>{
        this._resp().sucess(res, result);
      });
    });



  }


};

function runJobs(req, callback){
  if (req.body.ref.includes('picking')){
    PickingHandler.reloadPickingList(req.session.loggedUserID, req.body.ignoreDone, callback);
  }
}
