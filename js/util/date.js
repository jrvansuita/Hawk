module.exports = {

  format(date) {
    var d = date.getUTCDate();
    var m = date.getUTCMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear().toString().slice(2, 4);
    return (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;
  },

  today() {
    return new Date();
  },

  yesterday() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  },

  firstDayCurrentWeek() {
    var d = new Date();
    return new Date(d.setDate(d.getDate() - d.getDay()));
  },

  lastDayCurrentWeek() {
    var d = this.firstDayCurrentWeek();
    d.setDate(7);
    return d;
  },

  firstDayOfMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), 1));
  },

  lastDayOfMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() + 1, 0, 23));
  },

  firstDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() - 1, 1));
  },

  lastDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), 0, 23));
  },

  firstDayOfYear() {
    return new Date(Date.UTC(getCurrentYear(), 0, 1));
  },
};


function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth();
}