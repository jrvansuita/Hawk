$(document).ready(() => {
  new MenuController().bind();

  $('.user-logged-holder').hover(
    () => {
      $('.user-logged-img').attr('src', '/img/off.png');
      $('.user-logged-name').text('Sair');
    },
    () => {
      $('.user-logged-img').attr('src', loggedUser.avatar);
      $('.user-logged-name').text(loggedUser.name);
    }
  );

  $('.user-logged-holder').click(() => {
    $.ajax({
      url: '/login',
      type: 'post',
      data: {},
      success: function (response) {
        location.href = '/login';
      },
      error: function (jqXHR, textStatus, errorThrown) {
        location.href = '/login';
      },
    });
  });
});
