function loadImages(clazz, srcTag) {
  $('.' + clazz).each(function() {
    var img = new Image();
    var $img = $(this);

    $(img).load(function() {
      $img.attr('src', $(img).attr('src')).hide().fadeIn();
    }).attr('src', $img.attr(srcTag)).error(function() {});
  });

}