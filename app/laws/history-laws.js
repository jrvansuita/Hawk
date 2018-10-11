const History = require('../bean/history.js');
var UsersProvider = require('../provider/UsersProvider.js');

module.exports = {


  getPage(page, query, callback){
    History.paginate(buildQuery(query), page, '-date', (err, result)=>{
      callback(loadUsers(result));
    });
  },

  delete(query,callback){
    History.removeAll(buildQuery(query), callback);
  }

};


function loadUsers(data){
  if (data){
    data.forEach(function (item, index){
      data[index]._doc.user = UsersProvider.getDefault(item.userId);
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

    if (query.userId)
    assertStr(and, "userId", parseInt(query.userId));

    if (and.length > 0){
      result.$and = and;
    }
  }

  return result;
}

function assertStr(list, name, val){
  if (val != undefined && val.toString().length > 0){
    list.push({
      [name]: typeof val == 'number' ? val: {
        $regex: new RegExp(val, 'i')
      }
    });
  }
}
