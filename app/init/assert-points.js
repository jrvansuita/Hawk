
const Day = require('../bean/day.js');

Day.findAll((err, docs)=>{
  docs.forEach((doc, index)=>{

     doc.points = parseFloat(doc.points);

     Day.updateAll({_id: doc._id}, doc, function(err, numberAffected){
       console.log(doc.points);
     });

    /*if (doc.type == 'invoice'){
      //doc.points = (doc.count * (doc.total/3)) / 10000;



    }else{
      doc.points = (doc.total / (doc.count/doc.total)) * 4;


      Day.updateAll({_id: doc._id}, doc, function(err, numberAffected){
        console.log(doc.points);
      });

    }*/


  });

});
