
const Day = require('../bean/day.js');

Day.findAll((err, docs)=>{
  docs.forEach((doc, index)=>{


  if (doc.type == 'invoice'){
    doc.points = (doc.count * (doc.total/2)) / 10000;
  }else if (doc.type == 'picking'){
    doc.points = ((doc.total) / (doc.count/doc.total)) * 4;
  }

  Day.updateAll({_id: doc._id}, doc, function(err, numberAffected){
    console.log(doc.points);
  });
 

  });

});
