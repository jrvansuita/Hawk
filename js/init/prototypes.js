Date.prototype.withoutTime = function() {
  var d = new Date(this);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

Date.prototype.maxTime = function() {
  var d = new Date(this);
  d.setUTCHours(23, 59, 59, 0);
  return d;
};

String.prototype.format = String.prototype.f = function() {
  var s = this,
    i = arguments.length;

  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
  }
  return s;
};