const Routes = require('../redirects/_routes.js');


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
  var jobsRunner = require('../jobs/Jobs.js');

  if (req.headers.referer.includes('packing')){
    jobsRunner.runPacking((runned) => {
      callback(buildResponse(runned));
    });
  }else{
    jobsRunner.runPicking(()=>{
      callback(buildResponse(true));
    });
  }
}

function buildResponse(wasRunning){
  var r = {};
  r.was_running = wasRunning;
  return r;
}
