const Routes = require('../redirects/controller/routes.js');
const PackingHandler = require('../handler/packing-handler.js');
const PackingProvider = require('../provider/packing-provider.js');
const Pack = require('../bean/pack.js');
const PackageTypeVault = require('../vault/package-type-vault.js');
const PackingChartBuilder = require('../builder/packing-chart-builder.js');
const PackingDaysProvider = require('../provider/packing-days-provider.js');
const TransportLaws = require('../laws/transport-laws.js');
const ShippingOrderProvider = require('../provider/shipping-order-provider.js');

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

      new PackingDaysProvider().get(from,  to, (data)=>{
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


      /*--------*/


      this._page('/packing/shipping-order-list', (req, res) => {
        res.locals.shippingListQuery = req.session.shippingListQuery;
        res.render("packing/shipping-order/shipping-order-list", {transportList: TransportLaws.getObject()});
      });

      this._get('/shipping-order-list-page', (req, res) => {
        req.session.shippingListQuery = req.query.query;
        ShippingOrderProvider.list(req.query.query, req.query.page, (data)=>{
          this._resp().sucess(res, data);
        });
      });

      this._get('/packing/shipping-order', (req, res) => {
        if (req.query.id){
          ShippingOrderProvider.get(req.query.id, (data) => {
            res.render("packing/shipping-order/shipping-order",  {shippingOrder: data});
          });
        }else{
          res.render("packing/shipping-order/shipping-order",  {shippingOrder: null});
        }
      });

      this._get('/shipping-order-print', (req, res) => {
        ShippingOrderProvider.get(req.query.id, (data) => {
          res.render("packing/shipping-order/shipping-order-print", {shippingOrder: data});
        });
      });



    }};
