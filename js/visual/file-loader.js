function loadCssFile(link) {
  $('<link>')
    .appendTo('head')
    .attr({
      type: 'text/css',
      rel: 'stylesheet',
      href: link
    });
}

function loadJsFile(link, callback) {
  $.getScript(link, callback);
}

function checkImgFileExists(link, callback) {
  var img = new Image();
  $(img).load(function() {
    callback(true);
  }).attr('src', link).error(function() {
    callback(false);
  });
}

function loadImgFiles(clazz, srcTag) {
  $('.' + clazz).each(function() {

    var $img = $(this);

    checkImgFileExists($img.attr(srcTag), function(exists) {
      if (exists) {
        $img.attr('src', $img.attr(srcTag)).hide().fadeIn();
      }
    });
  });
}