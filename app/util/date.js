

var Dat = {




  format(date) {
    var formated = fmt(date);
    return formated.day + '/' + formated.month + '/' + formated.year.slice(2, 4);
  },

  formatwTime(date) {
    var formated = fmt(date);
    return formated.day + '/' + formated.month + '/' + formated.year.slice(2, 4) + " " + formated.hour + ":" + formated.min;
  },

  api(date, monthIndex) {
    var formated = fmt(date);
    return formated.year + '-' + (monthIndex ? --formated.month : formated.month) + '-' + formated.day;
  },

  id(date) {
    var formated = fmt(date);
    return formated.year + formated.month+ formated.day;
  },

  signatureDate(date) {
    var formated = fmt(date);
    return formated.day + '-' + formated.month + '-' + formated.year;
  },

  query(queryDate, def){
    return queryDate ? new Date(parseInt(queryDate)) : def;
  },

  daysDif(date1, date2) {
    dt1 = new Date(date1);
    dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
  },

  hoursDif(date1, date2) {
    var dt1 = new Date(date1);
    var dt2 = new Date(date2);

    dt1 = Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate(), dt1.getUTCHours(), dt1.getMinutes());
    dt2 = Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate(), dt2.getHours(), dt2.getMinutes());

    var dif = Math.abs(dt1 - dt2) / 36e5;

    return dif;
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

  now() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), getCurrentDay(), getCurrentHour(), getCurrentMinutes(), getCurrentSecondes()));
  },

  today() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), getCurrentDay()));
  },

  endToday() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), getCurrentDay(), 23, 59, 59));
  },

  yesterday() {
    var d = this.today();
    d.setDate(d.getDate() - 1);
    return d;
  },

  firstDayCurrentWeek() {
    var today = this.today();
    today.setDate(today.getUTCDate() - today.getUTCDay() - 1);
    return today;
  },

  lastDayCurrentWeek() {
    var d = this.firstDayCurrentWeek();
    d.setUTCDate(d.getUTCDate() + 6);
    d.setUTCHours(23,59,59);
    return d;
  },

  firstDayLastWeek() {
    var oneWeekAgo = this.firstDayCurrentWeek();
    oneWeekAgo.setUTCDate(oneWeekAgo.getUTCDate() - 7);
    return oneWeekAgo;
  },

  lastDayLastWeek() {
    var lastWeek = this.firstDayLastWeek();
    lastWeek.setUTCDate(lastWeek.getUTCDate() + 6);
    lastWeek.setUTCHours(23,59,59);
    return lastWeek;
  },



  firstDayOfMonth(monthIndex) {
    return new Date(Date.UTC(getCurrentYear(), monthIndex ? monthIndex : getCurrentMonth(), 1, 0));
  },

  lastDayOfMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() + 1, 0, 23,59,59));
  },

  firstDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth() - 1, 1, 0));
  },

  lastDayOfLastMonth() {
    return new Date(Date.UTC(getCurrentYear(), getCurrentMonth(), 0, 23, 59,59));
  },

  firstDayOfYear() {
    return new Date(Date.UTC(getCurrentYear(), 0, 2, 0));
  },

  monthDesc(index) {
    var m = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return m[index];
  },

  logTime: function(){
    var time = last || new Date();
    var now = new Date();

    console.log((now - time)/1000 + 's | ' + now.getMinutes() + ":" + now.getSeconds());

    last = now;
  }
};

var last;

function fmt(date) {
  var formated = {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear().toString(),
    hour: date.getHours(),
    min: date.getMinutes()
  };

  formated.day = ifLessThenZeroFix(formated.day);
  formated.month = ifLessThenZeroFix(formated.month);
  formated.hour = ifLessThenZeroFix(formated.hour);
  formated.min = ifLessThenZeroFix(formated.min);

  return formated;
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth();
}

function getCurrentDay() {
  return new Date().getDate();
}

function getCurrentHour() {
  return new Date().getHours();
}

function getCurrentMinutes() {
  return new Date().getMinutes();
}

function getCurrentSecondes() {
  return new Date().getSeconds();
}

function ifLessThenZeroFix(v){
  return  (v <= 9 ? '0' + v : v);
}

if (typeof module != 'undefined')
module.exports = Dat;
