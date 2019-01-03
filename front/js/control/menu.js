$(document).ready(() => {

  

  $('.user-logged-holder').click(() => {
    $.ajax({
      url: "/login",
      type: "post",
      data: {
      },
      success: function(response) {
        location.href = "/login";
      },
      error: function(jqXHR, textStatus, errorThrown) {
        location.href = "/login";
      }
    });
  });


});
