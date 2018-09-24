$(document).ready(() => {

  $('.start-jobs').click(() => {
    $('#logo').hide();
    $('#run-jobs-img').fadeIn();

    $.post("/run-jobs", (data) => {
      if (data.was_running) {
        location.reload();
      }
    });
  });

  $('.user-logged-holder').click(() => {
    $.ajax({
      url: "/login",
      type: "post",
      data: {
      },
      success: function(response) {
        console.log(data);
        location.href = "/login";
      },
      error: function(jqXHR, textStatus, errorThrown) {
        location.href = "/login";
      }
    });
  });


});
