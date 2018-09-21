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
    $.post("/login",
      function(response) {
        console.log(response);
        location.href = "/login";
      }, function(jqXHR, textStatus, errorThrown) {
        console.log('error');
        location.href = '/login';
      });
  });


});
