function startJobs() {

  $('#run-jobs-label').hide();
  $('#run-jobs-img').fadeIn();

  $.post("run-jobs", (data) => {
    if (data.was_running) {
      location.reload();
    }
  });

}