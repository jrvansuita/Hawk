
const Day = require('../bean/day.js');

Day.findAll((err, docs)=>{
  docs.forEach((doc, index)=>{


    if (doc.type == 'invoice'){
      doc.points = (doc.count * (doc.total/3)) / 10000;

      Day.updateAll({_id: doc._id}, doc, function(err, numberAffected){
        console.log(doc.points);
      });

    }


  });

});
