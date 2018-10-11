const Routes = require('../redirects/controller/routes.js');
const HistoryLaws = require('../laws/history-laws.js');

module.exports = class HistoryRoutes extends Routes{

  attach(){
    this._get('/history', (req, res) => {
      res.render('history');
    });

    this._get('/history-page',  (req, res) => {
      var page = parseInt(req.query.page);
      var query = req.query.query;

      HistoryLaws.getPage(page, query, (all)=>{
        this._resp().sucess(res, all);
      });

    });

    this._post('/history-delete', (req, res) => {
      HistoryLaws.delete(req.body.query,()=>{
        this._resp().sucess(res);
      });
    });
  }
};
