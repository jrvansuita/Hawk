const Routes = require('../redirects/_routes.js');
const HistoryProvider = require('../provider/HistoryProvider.js');

module.exports = class HistoryRoutes extends Routes{

  attach(){
    this._get('/history', (req, res) => {
      HistoryProvider.getAll((all)=>{
        res.render('history', {
          histories: all
        });
      });

    });
  }
};
