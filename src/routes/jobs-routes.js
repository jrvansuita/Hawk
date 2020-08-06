const Routes = require('./_route.js');
const Job = require('../bean/job.js');
const JobsPool = require('../jobs/controller/pool.js');
const JobsVault = require('../vault/job-vault.js');

module.exports = class JobsRoutes extends Routes {
  attach() {
    this.post('/job-run-force', (req, res) => {
      JobsPool.runForce(req.body.id);
      res.status(200).send('OK');
    });

    this.get('/jobs-all', (req, res) => {
      Job.findAll((_err, all) => {
        res.status(200).send(all);
      });
    });

    this.get('/job-registering', (req, res) => {
      var onResult = (job) => {
        res.render('job/job-registering', { job: job, jobTypes: JobsPool.getAvailableScripts() });
      };

      if (req.query.id) {
        Job.findOne({ id: req.query.id }, (_err, item) => {
          onResult(item.toObject());
        });
      } else {
        onResult(null);
      }
    });

    this.post('/job-registering', (req, res) => {
      JobsVault.storeFromScreen(req.body, (id) => {
        res.redirect('/job-registering?id=' + id);
      });
    });

    this.post('/job-remove', (req, res) => {
      JobsVault.delete(req.body.id);
      res.status(200).send('Ok');
    });
  }
};
