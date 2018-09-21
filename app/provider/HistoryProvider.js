const History = require('../bean/history.js');
var UsersProvider = require('../provider/UsersProvider.js');

module.exports = {


  getPage(page, query, callback){
    History.paginate(buildQuery(query), page, '-date', (err, result)=>{
      callback(loadUsers(result));
    });
  },

};


function loadUsers(data){
  if (data){
    data.forEach(function (item, index){
      data[index]._doc.user = UsersProvider.get(item.userId);
    });
  }

  return data;
}

function buildQuery(query){
  var result = {};

  if (query){
    result = {};
    var and = [];

    assertStr(and, "message", query.message);
    assertStr(and, "title", query.title);
    assertStr(and, "tag", query.tag);


    if (and.length > 0){
      result.$and = and;
    }


  }

  return result;
}

function assertStr(list, name, val){
  if (val != undefined && val.length > 0){
    list.push({
      [name]:{
        $regex: new RegExp(val, 'i')
      }
    });
  }
}
