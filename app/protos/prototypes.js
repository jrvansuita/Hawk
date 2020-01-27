Date.prototype.begin = function() {
  var d = new Date(this);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

Date.prototype.end = function() {
  var d = new Date(this);
  d.setUTCHours(23, 59, 59, 59);
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


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// Object.prototype._getType = function() {
//   var funcNameRegex = /function (.{1,})\(/;
//   var results = (funcNameRegex).exec((this).constructor.toString());
//   return (results && results.length > 1) ? results[1] : "";
// };
