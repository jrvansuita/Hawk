const Routes = require('../redirects/controller/routes.js');
const PackingHandler = require('../handler/packing-handler.js');
const PackingProvider = require('../provider/packing-provider.js');
const Pack = require('../bean/pack.js');
const PackagesHandler = require('../handler/packages-handler.js');

module.exports = class PackingRoutes extends Routes{

  attach(){

    this._page('/packing', (req, res) => {
      if (Sett.get(res.locals.loggedUser,8)){
        PackingHandler.findSale(req.query.sale, req.session.loggedUserID, (sale)=>{
          res.render('packing/packing.ejs', {
            sale : sale,
            groups: !sale.id ? PackingProvider.get() : {}
          });
        });
      }else{
        res.redirect("/packing/overview");
      }
    });

    this._post('/packing-done', (req, res) => {
      PackingHandler.done(req.body, res.locals.loggedUser, this._resp().redirect(res));
    });

    this._get('/packing-danfe', (req, res) => {
      req.setTimeout(3600000);
      PackingHandler.loadDanfe(res, req.query.nfe);
    });

    this._get('/packing-transport-tag', (req, res) => {
      req.setTimeout(3600000);
      PackingHandler.loadTransportTag(res, req.query.idnfe);
    });



    /*** End Packing Screen ****/


    this._page('/packing/overview', (req, res) => {
      require('../builder/InvoiceChartBuilder.js').buildOverview(res.locals.loggedUser.full, (charts)=> {
        res.render('packing/packing-chart', {
          charts: charts,
          page: req.originalUrl,
        });
      });
    });


    this._page('/packing/by-date', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());

      require('../builder/InvoiceChartBuilder.js').buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
        res.render('packing/packing-chart', {
          charts: charts,
          page: req.originalUrl,
          showCalendarFilter : true
        });
      });
    });



    this._page('/packing/records', (req, res) => {
      var builder = new (require('../builder/packing-records-builder.js'))();
      builder.init(res.locals.loggedUser.full,
        (data) => {
          res.render('packing/packing-records', {
            data: data
          });
        });

        builder.build();
      });

      /*--  Packing Types  --*/

      this._get('/package-types', (req, res)=>{
        Pack.findAll((err, all)=>{
          res.status(200).send(all);
        });
      });



      this._get('/packages', (req, res)=>{
        if (req.query._id){ 
          Pack.findOne({_id:req.query._id}, (err, pack)=>{
            res.render('packing/package-type', {pack: pack});
          });
        }else{
          res.render('packing/package-type', {pack: null});
        }
      });




      this._post('/packages', (req, res) => {
        PackagesHandler.storeFromScreen(req.body, (packId)=>{
          res.redirect("/packages?_id=" + packId);
        });
      });

      this._post('/packages-remove', (req, res) => {
        PackagesHandler.delete(req.body.id);
        res.status(200).send('Ok');
      });


      /*--------*/



    }};
