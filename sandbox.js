require('./app/init/init.js');

//const JobProducts = require('./app/jobs/job-products.js');

//new JobProducts().run();
const Product = require('./app/bean/product.js');

Product.findAll((err, docs)=>{

  docs.forEach((each)=>{

    if (each.sku.includes('-')){
       console.log(each.sku);
       each.remove();
    }
  });

})
