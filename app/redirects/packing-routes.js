const Routes = require('../redirects/controller/routes.js');
const PackingHandler = require('../handler/packing-handler.js');
const PackingProvider = require('../provider/packing-provider.js');
const Pack = require('../bean/pack.js');
const PackageTypeVault = require('../vault/package-type-vault.js');
const PackingChartBuilder = require('../builder/packing-chart-builder.js');
const PackingDaysProvider = require('../provider/packing-days-provider.js');
const TransportLaws = require('../laws/transport-laws.js');


module.exports = class PackingRoutes extends Routes{

  attach(){

    this._page('/packing', (req, res) => {
      if (Sett.get(res.locals.loggedUser,8)){

        var result = (sale) => {
          res.render('packing/packing.ejs', {
            sale : sale,
            groups: !sale.id ? PackingProvider.get() : {}
          });
        };

        if (req.query.sale){
          if (Num.isEan(req.query.sale)){
            PackingHandler.findSaleFromEan(req.query.sale, (sale) => {
              result(sale);
            })
          }else{
            PackingHandler.findSale(req.query.sale, req.session.loggedUserID, (sale)=>{
              result(sale);
            });
          }
        }else{
          result({});
        }
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


    this._get('/packing-days', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());

      new PackingDaysProvider().get(from, to, (data)=>{
        res.status(200).send(data);
      });
    });





    /*** End Packing Screen ****/


    this._page('/packing/overview', (req, res) => {
      PackingChartBuilder.buildOverview(res.locals.loggedUser.full, (charts)=> {

        res.render('packing/packing-chart', {
          charts: charts,
          page: req.originalUrl,
        });
      });
    });


    this._page('/packing/by-date', (req, res) => {
      var from = Dat.query(req.query.from, Dat.firstDayOfMonth());
      var to = Dat.query(req.query.to, Dat.lastDayOfMonth());

      PackingChartBuilder.buildByDate(from, to, res.locals.loggedUser.full, function(charts) {
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



      this._get('/packages-registering', (req, res)=>{
        Pack.findAll((err, all)=>{
          if (req.query._id){
            Pack.findOne({_id:req.query._id}, (err, pack)=>{
              res.render('packing/package-type-registering', {pack: pack, all: all});
            });
          }else{
            res.render('packing/package-type-registering', {pack: null,  all: all});
          }
        });
      });




      this._post('/packages-registering', (req, res) => {
        PackageTypeVault.storeFromScreen(req.body, (packId)=>{
          res.redirect("/packages-registering?_id=" + packId);
        });
      });

      this._post('/packages-remove', (req, res) => {
        PackageTypeVault.delete(req.body.id);
        res.status(200).send('Ok');
      });





    }};
