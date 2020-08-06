const Routes = require('./_route.js');
const HistoryLaws = require('../laws/history-laws.js');
const Enum = require('../bean/enumerator.js');

module.exports = class HistoryRoutes extends Routes {
  mainPath() {
    return '/history';
  }

  attach() {
    this.page('', async (req, res) => {
      res.render('history/history', { tag: req.query.tag, icons: await Enum.on('HISTORY-ICONS').get(true) });
    });

    this.get('/page', (req, res) => {
      var page = parseInt(req.query.page);
      var query = req.query.query;

      HistoryLaws.getPage(page, query, (all) => {
        this._resp().success(res, all);
      });
    });

    this.post('/delete', (req, res) => {
      HistoryLaws.delete(req.body.query, () => {
        this._resp().success(res);
      });
    });
  }
};
