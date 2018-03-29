Date.prototype.withoutTime = function() {
  var d = new Date(this);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};