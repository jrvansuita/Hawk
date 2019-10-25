const Routes = require('../redirects/controller/routes.js');
const GiftVault = require('../vault/gift-vault.js');
const GiftRule = require('../bean/gift-rule.js');

module.exports = class GiftRoutes extends Routes{

  attach(){


    this._page('/gift-rules', (req, res) => {
      var render = (selected)=>{
        GiftRule.findAll((err, all)=>{
          res.render('gift/gift-rules', {gift: selected,
            rulesAttrs: GiftRule.attrs(),
            rulesConditions :GiftRule.conditions(),
            all: all
          });
        });
      };


      if (req.query.id){
        GiftRule.findOne({id:req.query.id}, (err, item)=>{
          render(item);
        });
      }else{
        render(null);
      }
    });



    this._post('/gift-rules', (req, res) => {
      GiftVault.storeFromScreen(req.body, (gift)=>{
        res.status(200).send(gift);
      });
    });



    this._get('/gift-all', (req, res)=>{
      GiftRule.findAll((err, all)=>{
        res.status(200).send(all);
      });
    });


    this._post('/gift-delete', (req, res)=>{
      GiftVault.delete(req.body.id, ()=>{
        res.status(200).send('Ok');
      });
    });



  }

};
