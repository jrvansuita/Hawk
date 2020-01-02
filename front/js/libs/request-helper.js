
function _get(path, data, onSucess, onError){
  $.ajax({
    url: path,
    type: "GET",
    headers: {
      "Content-Type": "application/json"
    },
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
    type: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify(data ? data : {}),
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


function _postImg(path, data, onSucess, onError){
  $.ajax({
    url: path,
    type: "POST",
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
