const Routes = require('../redirects/controller/routes.js');
const GiftHandler = require('../handler/gift-handler.js');
const GiftRule = require('../bean/gift-rule.js');

module.exports = class GiftRoutes extends Routes{

  attach(){


    this._page('/gift-rules', (req, res) => {
      var render = (selected)=>{
        res.render('gift/gift-rules', {gift: selected,
          rulesAttrs: GiftRule.attrs(),
          rulesConditions :GiftRule.conditions(),
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
      GiftHandler.storeFromScreen(req.body, (gift)=>{
        res.status(200).send(gift);
      });
    });



    this._get('/gift-all', (req, res)=>{
      GiftRule.findAll((err, all)=>{
        res.status(200).send(all);
      });
    });


    this._post('/gift-delete', (req, res)=>{
      GiftHandler.delete(req.body.id, ()=>{
        res.status(200).send('Ok');
      });
    });



  }

};
