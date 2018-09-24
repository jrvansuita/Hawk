
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


$.ajax({
  url: '/product-sku',
  type: "get",
  data: {sku: "3817-Rsp-M"},
  success: function(response) {
    console.log(response);
  },
  error: function(error, message, errorThrown) {
    console.log(error);
  }
});



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
