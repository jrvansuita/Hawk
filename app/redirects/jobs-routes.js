const Routes = require('../redirects/controller/routes.js');
const PickingHandler = require('../handler/picking-handler.js');
const Job = require('../bean/job.js');
const JobsPool = require('../jobs/controller/pool.js');

module.exports = class JobsRoutes extends Routes{

  attach(){
    this._post('/run-jobs', (req, res) => {
      runJobs(req, (result)=>{
        this._resp().sucess(res, result);
      });
    });

    this._get('/jobs-all', (req, res)=>{
      Job.findAll((err, all)=>{
        res.status(200).send(all);
      });
    });

    this._get('/job-registering', (req, res) => {
      var onResult = (job)=>{
          res.render('job/job-registering', {job: job, jobTypes: JobsPool.getAvailableJobs()});
      }

      if (req.query.id){
        Job.findOne({id:req.query.id}, (err, item)=>{
          onResult(item.toObject());
        });
      }else{
        onResult(null);
      }
    });

    this._post('/job-registering', (req, res) => {

    });

  }


};

function runJobs(req, callback){
  if (req.body.ref.includes('picking')){
    PickingHandler.reloadPickingList(req.session.loggedUserID, req.body.ignoreDone, callback);
  }
}
