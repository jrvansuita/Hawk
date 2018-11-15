const Routes = require('../redirects/controller/routes.js');
const PickingLaws = require('../laws/picking-laws.js');
const JobSales = require('../jobs/job-sales.js');

module.exports = class JobsRoutes extends Routes{

  attach(){
    this._post('/run-jobs', (req, res) => {
      runJobs(req, (r)=>{
        this._resp().sucess(res, r);
      });
    });
  }
};

function runJobs(req, callback){
  if (req.headers.referer.includes('packing')){
    try{
      var runner = new JobSales();
      runner.setUserId(req.session.loggedUser.id);
      runner.run();
      callback(buildResponse(true));
    }catch(e){
      callback(buildResponse(false));
    }
  }else if (req.headers.referer.includes('picking')){
    PickingLaws.clear(req.session.loggedUser.id);
    callback(buildResponse(true));
  }
}

function buildResponse(wasRunning){
  var r = {};
  r.was_running = wasRunning;
  return r;
}
