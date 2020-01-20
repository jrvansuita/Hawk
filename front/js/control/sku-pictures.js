$(document).ready(()=>{


  $('#insta-post').keypress(function(e){
    if(e.which == 13){
      _post('/sku-picture-from-insta', {instaPost : $('#insta-post').val(), sku: $('#sku').val()}, (data)=>{
        console.log('veio' + data);
      });
    }
  });

});
