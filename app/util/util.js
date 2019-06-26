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

  removeAttrs(object, keep){
    return Object.keys(object).reduce((obj, key) => {
      if (keep.includes(key)) {
        obj[key] = object[key]
      }
      return obj
    }, {});
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

  isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
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
    if (str){
      str = str.toString().toLowerCase().trim();
    }

    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  },

  strToColor: function(str, alpha) {
    var shortened = this.hashCode(str) % 160;
    return 'hsl(' + shortened + ', 45%, 60%'+ (alpha ? ', ' + alpha : '') + ')';
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

  getSaleSituationName(status){
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

  getSaleSituationIcon(status){
    switch(status) {
      case 1:
      return 'paper-checked';
      case 3:
      return 'checked';
      default:
      return 'alert';
    }
  },


  getSaleStatusName(status){
    if (status == 'N'){
      return 'Aguardando Picking';
    }else if (status == 'A'){
      return 'Aguardando Faturamento';
    }else if (status == 'S'){
      return 'Faturado';
    }
  },

  getSaleStatusIcon(status){
    if (status == 'N'){
      return 'alert';
    }else if (status == 'A'){
      return 'checked';
    }else if (status == 'S'){
      return 'paper-checked';
    }
  },

  papersIcon(much){
    if (much <= 5){
      return 'paper';
    }else if (much <= 10){
      return 'papers';
    }else if (much <= 49){
      return 'many-papers';
    }else if (much >= 50){
      return 'all-papers';
    }
  },

  orderDatesObject(object){
    return Object
    .entries(object)
    .sort((a, b)=>{
      return new Date(a[0]) - new Date(b[0]);
    }).reduce((obj, [k,v]) => ({...obj,[k]: v}), {});
  },


  getProductBrand(name, isChild){
    var spl = name.split('-');
    var brand = spl[spl.length + (isChild  ? -2 : -1)];


    return brand || '';
  },

  getProductName(name, isChild){
    var desc = name.split('-').slice(0, isChild ? -2: -1).join('-').trim();

    return desc || '';
  },


  diagTitle(type){
    switch(type) {
      case 0:
      return 'Produtos sem Foto';
      case 1:
      return 'Produtos sem Localização e Com estoque';
      case 2:
      return 'Produtos sem Peso';
      case 3:
      return 'Produtos sem Vendas';
      case 4:
      return 'Produtos sem Marca';
      case 5:
      return 'Produtos sem Cor';
      case 6:
      return 'Produtos sem Preço de Custo'
      case 7:
      return 'Produtos sem Departamento'
      case 8:
      return 'Produtos com Gênero incorreto'
      case 9:
      return 'Produtos com Localização e Sem estoque';
      case 10:
      return 'Produtos aguardando entrada';
      case 11:
      return 'Produtos inconsistentes no Magento';
      case 12:
      return 'Ncm incorreto ou não encontrado';

      default:
      return 'Não encontrado';
    }
  },


  diagIcon(type){
    switch(type) {
      case 0:
      return 'photo';
      case 1:
      return 'no-local';
      case 2:
      return 'no-weight';
      case 3:
      return 'calc';
      case 4:
      return 'tags';
      case 5:
      return 'color';
      case 6:
      return 'price';
      case 7:
      return 'category';
      case 8:
      return 'gender';
      case 9:
      return 'local-no-stock';
      case 10:
      return 'registring';
      case 11:
      return 'not-visible';
      case 12:
      return 'paper-blocked';

      default:
      return 'question-mark';
    }
  },

  getGenderIcon(gender){
    if (gender.toLowerCase().includes('fema')){
      return 'girl.png';
    }if (gender.toLowerCase().includes('male')){
      return 'boy.png';
    }else{
      return 'baby.png';
    }
  },

  colorVal: function(str, alpha) {
    var color = Colors[str.replace(' ', '').toLowerCase()];

    return color ? '#' + color + (alpha ? alpha : '') : undefined;
  },


  colorBrightness(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

      // If HEX --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

      r = color[1];
      g = color[2];
      b = color[3];
    }
    else {

      // If RGB --> Convert it to HEX: http://gist.github.com/983661
      color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
      }

      // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
      hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
      );

      return hsp;
    }



  };





  var Colors = {
    vermelho: 'f33a26',
    azul: '4984f9',
    azulmarinho: '072586',
    amarelo: 'fde300',
    verde: '2ed268',
    rosa: 'ff89ee',
    pink: 'ce50a1',
    salmao: 'f99a84',
    offwhite: 'fbf7f5',
    branco: 'ffffff',
    cinza: '979798',
    laranja: 'e69939',
    preto: '4a4646',
    roxo: 'aa6bc7',
    bordo: '964242',
    royal: '4a49a7',
    marrom: '8c6751',
    bege: 'e0cebc',
    lilas: 'a79bd8',
    jeans: '8699b3',
    dourado: 'deb647',
    vinho: '904366'
  };


  if (typeof module != 'undefined')
  module.exports = Util;
