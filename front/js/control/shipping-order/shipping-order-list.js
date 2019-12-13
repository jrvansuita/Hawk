var situationPicker;
var transportPicker;

var dateBeginPicker = null;
var dateEndPicker = null;

var page = -1;
var loading = false;

var situationsArr = {0: 'Em Aberto', 1:'Coletado', 2 : 'Enviado'};

function initialize(){
  initialize = null;
  loadList();
  bindScrollLoad();
}

$(document).ready(() => {
  situationPicker = new ComboBox($('#situation'), situationsArr);
  situationPicker
  .setAutoShowOptions()
  .load(() => {
    if (memoryQuery.situation){
      situationPicker.selectByFilter((a) => {
        return a.id == parseInt(memoryQuery.situation);
      });
    }
  });


  transportPicker = new ComboBox($('#transport'), transportList);
  transportPicker
  .setAutoShowOptions()
  .setOnItemBuild((data, index)=>{
    return {text : data.val, img : '../img/transport/' + data.val.toLocaleLowerCase() + '.png' };
  })
  .load(() => {
    if (memoryQuery.transport){
      $('#transport').val(memoryQuery.transport);
    }
  });


  dateBeginPicker = new DatePicker();

  dateBeginPicker.holder('.date-begin-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-begin').val(formatedDate);
    $('#date-begin').data('date', date);
  })
  .load().then(()=>{
    if (memoryQuery.begin){
      var date = new Date(parseInt(memoryQuery.begin));
    }else{
      var date = Dat.rollDay(null, -8);
    }

    dateBeginPicker.setSelected(date);
    $('#date-begin').val(Dat.format(date));

  });


  dateEndPicker = new DatePicker();

  dateEndPicker.holder('.date-end-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-end').val(formatedDate);
    $('#date-end').data('date', date);
  })
  .load().then(()=>{
    if (memoryQuery.end){
      var date = new Date(parseInt(memoryQuery.end));
    }else{
      var date = new Date();
    }

    dateEndPicker.setSelected(date);
    $('#date-end').val(Dat.format(date));
    initialize()
  });


  $('#search-button').click(()=>{
    page = -1;
    $('.content').find("tr:gt(0)").empty();
    loadList();
  });

});



function bindScrollLoad(){
  var $pane = $('.content-scroll');
  var $list = $('.content');

  $pane.unbind('scroll').bind('scroll', function() {
    if ((($pane.scrollTop() + $pane.height()) + 1000 >= $list.height()) && !loading) {
      loadList();
    }
  });
}



function loadList(){
  page++;
  loading = true;

  $('.loading').show();
  $('#header').hide();

  var s = $('#situation').val() ? situationPicker.getSelectedItem() : ''
  var begin = dateBeginPicker.getSelected();
  var end = dateEndPicker.getSelected();

  var query = {
    page : page,
    query: {
      transport: $('#transport').val(),
      situation: s ? s.id : undefined,
      begin: begin ? begin.getTime() : undefined,
      end: end ? end.getTime() : undefined
    }
  };


  _get('/shipping-order-list-page', query ,(result)=>{
    loading = false;
    $('.loading').hide();

    console.log(result);

    result.forEach((each, index)=>{
      addItemLayout(each, index);
    });

    $('#header').show();
  });
}




function addItemLayout(item, index){
  var tds = [];

  var nfsCount = item._NotasFiscais.length;
  var valCount = 0;
  var ufs = {};

  item._NotasFiscais.forEach((each) => {
    valCount += parseFloat(each.totalFaturado);
    ufs[each.uf] = '';
  });

  tds.push($('<td>').append($('<label>').addClass('number').text(item.numeroColeta)));
  tds.push($('<td>').append(Dat.format(new Date(item.data))));

  var transpHolder = $('<div>')
  var transpName = Util.transportName(item.transportador, 'Não Encontrado');
  var transpIcon = $('<img>').attr('src', '../img/transport/' + transpName.toLocaleLowerCase() + '.png');
  transpName = $('<span>').append(transpName)

  tds.push($('<td>').addClass('transp-col').append(transpHolder.append(transpIcon, transpName)));
  tds.push($('<td>').append(item.usuario_criacao));
  tds.push($('<td>').append($('<span>').append(Num.money(valCount)).attr('title', valCount)));
  tds.push($('<td>').append(nfsCount));
  tds.push($('<td>').append(Object.keys(ufs).sort().join(', ')));
  tds.push($('<td>').append(getSituationName(item.situacao)));




  var dots = $('<div>').addClass('menu-dots').append($('<img>').attr('src','../img/dots.png').addClass('dots-glyph'));
  dots.data('number', item.numeroColeta).click(getDropDow());

  tds.push($('<td>').append(dots));

  var line = $('<tr>').addClass('line-item').append(tds).click(() => {
      window.open('/packing/shipping-order?number=' + item.numeroColeta ,'_blank');
  });

  applyBackgroundColor(item.situacao, line);

  $('.content').append(line);
}


function getSituationName(situation){
  switch(parseInt(situation)) {
    case 0:
    return 'Em Aberto';
    case 1:
    return 'Coletado';
    case 2:
    return 'Enviado';
    default:
    return 'Não encontrado';
  }
}


function applyBackgroundColor(situation, el){
  switch(parseInt(situation)) {
    case 0:
    el.addClass('open-item');
    break;
    case 1:
    el.addClass('colected-item');
    break;
    case 2:
    el.addClass('send-item');
    break;
  }
}


function getDropDow(){
  return function (e){
    var number = $(this).data('number');
    e.stopPropagation();

    var drop = new MaterialDropdown($(this), e, true);
    drop.addItem('../img/print.png', 'Imprimir', function(){
      window.open('/shipping-order-print?number=' + number ,'_blank');
    }).addItem('../img/delete.png', 'Excluir', function(){

    }).addItem('../img/transport/default.png', 'Coletado', function(){

    })/*.addItem('../img/all-papers.png', 'Enviado', function(){
      //Aqui não faz nada, como trabalhamos com a intelipost, o eccosys não faz nada.
      //Sem a intelipost, o eccosys iria enviar o lote de notas para o transportador
    });*/

    drop.setMenuPosAdjust(-100, 0).show();
  }
}
