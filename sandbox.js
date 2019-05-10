require('./app/init/init.js');

const BlockHandler = require('./app/handler/block-handler.js');



const User = require('./app/bean/user.js');

User.findByKey('141135352', (err, doc)=>{
  //console.log(doc.id);
  //console.log(doc['_doc']);

  //console.log(Util.removeAttrs(doc['_doc'], ['name', 'id', 'avatar']));

  BlockHandler.pendingSkus(['1dsd','2sdsd','3ds'], 'teste', doc['_doc']);
});
