var Util = {

  id(){
    return parseInt(new Date().getTime().toString().slice(-8));
  },


  transportName: (name, def)=>{
    return Util.twoNames(name, def ? def : Const.no_transport);
  },

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

   getPaymentType(method){
    switch(method){
      case 'mundipagg_boleto': return 'Boleto';
      case 'mundipagg_creditcard': return 'Cartão de Crédito';
      case 'paypal_express': return 'PayPal';
      case 'free': return 'Voucher';
    }
  },

  //remover os elementos null do objeto
  removeNullElements(object){
    for(var f in object){
      if(object[f] == null){
        delete object[f];
      }
    }
    return object;
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

  deepVal(deepPath, object){
    return deepPath.split('.').reduce((p,c)=>p&&p[c]||null, object);
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
    str = str.toString().toLowerCase();

    return array.some((s)=>{
      return str == s.toString().toLowerCase();
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
      return 'Picking Não Realizado';
    }else if (status == 'A'){
      return 'Aguardando Faturamento';
    }else if (status == 'S'){
      return 'Faturado';
    }
  },

  getSaleStatusInfo(status){
    switch(status){
      //sale status
      case 'pending': return 'Pedido Realizado';
      case 'processing': return 'Pagamento Confirmado';
      case 'canceled': return 'Cancelado';
      case 'separation': return 'Em Separação';
      case 'pending_payment': return 'Pagamento Pendente';
      case 'payment_review': return 'Aguardando Analise Antifraude';
      case 'waiting_antifraud_analisys': return 'Análise do Credito';
      case 'holded': return 'Bloqueado na Expedição';
      case 'ip_delivered': return 'Entregue';
      case 'ip_to_be_delivered': return 'Saiu para Entrega';
      case 'ip_delivery_failed': return 'Entrega Falhou';
      case 'ip_delivery_late': return 'Atraso na Entrega';
      case 'ip_in_transit': return 'Em Trânsito';
      case 'ip_shipped': return 'Despachado';
      case 'awaiting': return 'Aguardando Devolução';
      case 'devolucao_recebida': return 'Devolução Recebida';
      case 'complete': return 'Conferência do(s) produto(s) e NF-e';
      case 'closed': return 'Estornado';
      case 'ip_shipped': return 'Despachado';

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


  getGenderIcon(gender){
    if (gender.toLowerCase().includes('femi')){
      return 'girl.png';
    }if (gender.toLowerCase().includes('masc')){
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
    },

    circylarStringify(object){
      var cache = [];
      var str = JSON.stringify(object,
        // custom replacer fxn - gets around "TypeError: Converting circular structure to JSON"
        function(key, value) {
          if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
              // Circular reference found, discard key
              return;
            }
            // Store value in our collection
            cache.push(value);
          }
          return value;
        }, 4);
        cache = null; // enable garbage collection
        return str;
      },


      printList(arr, allVal, allDef, showCount){
        var result = allDef || allVal;
        showCount = showCount || 1;

        if (arr){
          if (!arr.includes(allVal)){

            if (typeof arr == 'string'){
              arr = arr.split(',');
            }

            var dif = arr.length - showCount

            result = arr.slice(0, showCount).join(', ') + (dif > 0 ? ' +' + dif : '');
          }
        }

        return result;
      },


      getUrlParam: function (name){
        if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
      },

      isTokenOk: (user)=>{
        return user.token && (user.token.length > 100);
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
