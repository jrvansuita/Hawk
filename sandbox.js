require('./app/init/init.js');

const Pending = require('./app/bean/pending.js');

Pending.findAll(function(err, pendings){

  console.log(err);
  console.log(Object.keys(pendings[0]));
  });
