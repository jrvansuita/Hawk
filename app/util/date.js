module.exports = {

  format(date) {
    var d = date.getUTCDate();
    var m = date.getUTCMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear().toString().slice(2, 4);
    return (d <= 9 ? '0' + d : d) + '/' + (m <= 9 ? '0' + m : m) + '/' + y;
  },

  api(date) {
    var d = date.getUTCDate();
    var m = date.getUTCMonth() + 1; //Month from 0 to 11
    var y = date.getFullYear();
    return y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  },

  rollDay(date, n) {
    date.setDate(date.getDate() + n);
    return date;
  },

  print(from, to) {
    if (Math.ceil((to.getTime() - from.getTime()) / (1000 * 3600 * 24)) > 1) {
      return Const.from_to.format(this.format(from), this.format(to));
    } else {
      return this.format(from);
    }
  },

  def(date, def) {
    return date instanceof Date ? date : (def instanceof Date ? def : this.today());
  },

  today() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), getCurrentDay()));
  },

  yesterday() {
    var d = this.today();
    d.setDate(d.getDate() - 1);
    return d;
  },

  firstDayCurrentWeek() {
    var today = this.today();
    today.setDate(today.getDate() - today.getDay() - 1);
    return today;
  },

  lastDayCurrentWeek() {
    var d = this.firstDayCurrentWeek();
    d.setDate(d.getDate() + 6);
    return d;
  },

  firstDayLastWeek() {
    var oneWeekAgo = this.firstDayCurrentWeek();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return oneWeekAgo;
  },

  lastDayLastWeek() {
    var lastWeek = this.firstDayLastWeek();
    lastWeek.setDate(lastWeek.getDate() + 6);
    return lastWeek;
  },

  firstDayOfMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), 1, 0));
  },

  lastDayOfMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() + 1, 0, 23));
  },

  firstDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() - 1, 1, 0));
  },

  lastDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), 0, 23));
  },

  firstDayOfYear() {
    return new Date(Date.UTC(getCurrentYear(), 0, 1, 0));
  },
};



function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth();
}

function getCurrentDay() {
  return new Date().getDate();
}