$(document).ready(()=>{

  $('.job').click(function() {
    var ref = $(this).data('ref');

    _post("/run-jobs", {ref: ref}, (data) => {
      console.log(data);
      $(this).find('.job-status').attr('src','img/wait.png');
    });
  });

});
