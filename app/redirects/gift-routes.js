const Routes = require('../redirects/controller/routes.js');
const GiftHandler = require('../handler/gift-handler.js');
const GiftRule = require('../bean/gift-rule.js');

module.exports = class GiftRoutes extends Routes{

  attach(){


    this._page('/gift-rules', (req, res) => {
      if (req.query.id){
        GiftRule.findOne({id:req.query.id}, (err, item)=>{
          res.render('gift/gift-rules', {gift: item});
        });
      }else{
        res.render('gift/gift-rules', {gift: null});
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
