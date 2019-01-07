var Util = {

  getSubtitles: function(charts) {

    var arrItem;

    charts.some((chart) => {

      var arr = chart.getItems().filter((item) => {
        return item.getBars().length > 0;
      });

      if (arr.length > 0) {
        arrItem = arr[0];
        return true;
      }

      return false;
    });


    return arrItem ? arrItem.getBars() : [];
  },

  clone(object){
    return JSON.parse(JSON.stringify(object));
  },


  forProperty(object, callback){
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  },

  findByProperty(object, onCheck){
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        if (onCheck(object[key], key)){
          return object[key];
        }
      }
    }
  },

  selectContent: function(element) {
    var range = document.createRange();
    range.selectNodeContents(element);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  },

  copySeleted: function(text) {
    if (text) {
      const textarea = document.createElement('textarea');
      textarea.style.width = 0;
      textarea.style.height = 0;
      textarea.style.position = 'absolute';
      textarea.style.bottom = '-100%';
      textarea.style.left = '-100%';
      textarea.style.margin = 0;
      document.body.appendChild(textarea);

      textarea.value = text;
      textarea.select();
    }

    return document.execCommand('copy');
  },

  isTrueStr: function(val){
    return val == true || val == "true";
  },

  hashCode: function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  },

  strToColor: function(str) {
    var shortened = this.hashCode(str) % 160;
    return 'hsl(' + shortened + ', 45%, 60%)';
  },

  historyTagColor(tag){
    if (tag == 'Falha'){
      return '#ec7565';
    }else{
      return this.strToColor(tag);
    }
  },

  historyIcon(status){
    if (status == 1){
      return "alert";
    }else if (status == 2){
      return "error";
    }else if(status == 3){
      return "notification";
    }else if(status == 4){
      return "gear";
    }


  },

  notIn(array, str){
    return !this.isIn(array, str);
  },

  isIn(array, str){
    return array.some((s)=>{
      return str.includes(s);
    });
  },

  ellipsis(str, max){

    if (str.length > max + 3){
      return str.substring(0,max) + '...';
    }

    return str;
  },

  twoNames(name, def, pMax){
    if (!name){
      return def ? def : '';
    }

    var max = pMax ? pMax : 10;

    var two = name.split(' ').slice(0,2).join(' ').length <= max;

    if (two){
      name = name.split(' ').filter((e, i)=>{
        return i <=1;
      }).join(' ');
    }else{
      name = name.split(' ')[0];
    }

    return name;
  },

  getSaleStatusName(status){
    switch(status) {
      case -1:
      return 'Aguardando pagamento';
      case 0:
      return 'Em aberto';
      case 1:
      return 'Atendido';
      case 2:
      return 'Cancelado';
      case 3:
      return 'Pronto para picking';
      case 4:
      return 'Pagamento em análise';
      default:
      return 'Não encontrado';
    }
  },


  papersIcon(much){
    if (much < 5){
      return 'paper';
    }else if (much < 10){
      return 'papers';
    }else if (much < 49){
      return 'many-papers';
    }else if (much > 50){
      return 'all-papers';
    }
  },

  orderDatesObject(object){
    return Object
    .entries(object)
    .sort((a, b)=>{
      return new Date(a[0]) - new Date(b[0]);
    }).reduce((obj, [k,v]) => ({...obj,[k]: v}), {});
  }

};



if (typeof module != 'undefined')
module.exports = Util;
