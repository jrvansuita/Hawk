const Routes = require('./_route.js');
const GiftVault = require('../vault/gift-vault.js');
const GiftRule = require('../bean/gift-rule.js');

module.exports = class GiftRoutes extends Routes {
  mainPath() {
    return '/gift';
  }

  attach() {
    this.page('/rules', (req, res) => {
      var render = (selected) => {
        GiftRule.findAll((_err, all) => {
          res.render('gift/gift-rules', {
            gift: selected,
            rulesAttrs: GiftRule.attrs(),
            rulesConditions: GiftRule.conditions(),
            all: all,
          });
        });
      };

      if (req.query.id) {
        GiftRule.findOne({ id: req.query.id }, (_err, item) => {
          render(item);
        });
      } else {
        render(null);
      }
    });

    this.post('/rules', (req, res) => {
      GiftVault.storeFromScreen(req.body, (gift) => {
        res.status(200).send(gift);
      });
    });

    this.get('/all', (req, res) => {
      GiftRule.findAll((_err, all) => {
        res.status(200).send(all);
      });
    });

    this.post('/delete', (req, res) => {
      GiftVault.delete(req.body.id, () => {
        res.status(200).send('Ok');
      });
    });
  }
};
