const Routes = require('../redirects/_routes.js');
const HistoryProvider = require('../provider/HistoryProvider.js');

module.exports = class HistoryRoutes extends Routes{

  attach(){
    this._get('/history', (req, res) => {
      res.render('history');
    });

    this._get('/history-page',  (req, res) => {
      var page = parseInt(req.query.page);
      var query = req.query.query;

      HistoryProvider.getPage(page, query, (all)=>{
        this._resp().sucess(res, all);
      });

    });
  }
};
