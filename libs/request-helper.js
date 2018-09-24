
function _get(path, data, onSucess, onError){
  $.ajax({
    url: path,
    type: "get",
    data: data,
    success: function(response) {
      if (onSucess){
        onSucess(response);
      }else{
        window.location.reload();
      }
    },
    error: function(error, message, errorThrown) {
      console.log(error);
      if (onError){
        onError(error, message, errorThrown);
      }
    }
  });
}


function _post(path, data, onSucess, onError){
  $.ajax({
    url: path,
    type: "post",
    data: data,
    success: function(response) {
      if (onSucess){
        onSucess(response);
      }else{
        window.location.reload();
      }
    },
    error: function(error, message, errorThrown) {
      console.log(error);
      if (onError){
        onError(error, message, errorThrown);
      }
    }
  });
}
