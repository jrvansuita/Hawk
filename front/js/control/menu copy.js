$(document).ready(() => {
  var focusHandler = menuClass => {
    var currentSelected;
    var showedMenu;

    let onEnter = function () {
      currentSelected = $('.' + menuClass + ' .menu-item.focus-menu');
      currentSelected.removeClass('focus-menu');
      $(this).addClass('focus-menu');

      setTimeout(params => {
        if (showedMenu) showedMenu.remove();

        showedMenu = showSubMenu(this);
      }, 50);
    };

    let onLeave = function () {
      $(this).removeClass('focus-menu');
      if (currentSelected) currentSelected.addClass('focus-menu');
    };

    /* --------- --------- --------- --------- --------- --------- */
    $('.' + menuClass + ' .menu-item').hover(onEnter, onLeave);

    $('.' + menuClass + ' .menu-item').click(function () {
      currentSelected = $(this);
      Local.set(menuClass, $(this).find('a').attr('href'));
    });

    var href = Local.getStr(menuClass);

    currentSelected = $('.' + menuClass + ' a[href*="' + href + '"]').parent('li');
    currentSelected.addClass('focus-menu');
  };

  focusHandler(mainMenu);
  focusHandler(subMenu);

  function showSubMenu(menuItem) {
    if ($(menuItem).attr('sub')) {
      var sub = $('<div>').load('/sub-menu?sub=' + $(menuItem).attr('sub'));
      $('body').append(sub);
      return sub;
    }
  }

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
