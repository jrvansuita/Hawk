const Routes = require('../redirects/controller/routes.js');
const PickingLaws = require('../laws/picking-laws.js');
const JobSales = require('../jobs/job-sales.js');

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
  if (req.body.ref.includes('packing')){
    try{
      console.log('passou');
      var runner = new JobSales();
      runner.setUserId(req.session.loggedUserID);
      runner.run();
      callback();
    }catch(e){
      callback();
    }
  }else if (req.body.ref.includes('picking')){
    PickingLaws.clear(req.session.loggedUserID);
    callback();
  }
}
