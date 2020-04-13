var dateBeginPicker = null;
var dateEndPicker = null;
var tagsHandler;

$(document).ready(()=>{
  var queryId = new URLSearchParams(location.search).get('id');
  tagsHandler = new TagsHandler();


  dateBeginPicker = new DatePicker();

  dateBeginPicker.holder('.date-begin-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-begin').val(formatedDate);
  })
  .load();


  dateEndPicker = new DatePicker();

  dateEndPicker.holder('.date-end-holder', true)
  .setOnChange((formatedDate, date)=>{
    $('#date-end').val(formatedDate);
  })
  .load().then(()=>{
    if (!queryId){
      seachData();
    }
  });

  $('#search-input').on("keyup", function(e) {
    if (e.which == 13){
      $('#search-button').trigger('click');
    }
  });

  $('#search-button').click(()=>{
    seachData();
  });

  $('.button').on("keyup", function(e) {
    if (e.which == 13){
      $(this).click();
    }
  });

  $('.icon-open').click(()=>{
    toggleTagBox();
  });


  if (queryId){
    seachData(queryId);
  }

  paramsVariablesBinding();
});


function seachData(id){
  $('.icon-open').attr('src','/img/loader/circle.svg');

  if (id){
    _get('/sales-dashboard-data', {id: id}, onHandleResult);
  }else{
    var begin = dateBeginPicker.getSelected();
    var end = dateEndPicker.getSelected();
    begin = begin && $('#date-begin').val() ? begin.getTime() : undefined;
    end = end && $('#date-end').val() ? end.getTime() : undefined

    _get('/sales-dashboard-data',{
      begin: begin,
      end: end,
      value: $('#search-input').val(),
      attrs: tagsHandler.get()
    }, onHandleResult);
  }
}


function onHandleResult(result){
  tagsHandler.placeAll(result.query.attrs)
  $('#search-input').val(result.query.value);

  var begin = new Date(parseInt(result.query.begin));
  var end = new Date(parseInt(result.query.end));

  $('#date-begin').val(Dat.format(begin));
  $('#date-end').val(Dat.format(end));

  setTimeout(() => {
    dateBeginPicker.setSelected(begin);
    dateEndPicker.setSelected(end);
  },1000)


  if (window.history.replaceState) {
    window.history.replaceState("Data", null, location.pathname + '?id=' + result.id);
  }

  if (result.data.count){
    $('.no-data').hide();
    $('.content-grid').empty();
    console.log(result);
    buildBoxes(result.data);
    $('.costs-box').show();
  }else{
    $('.no-data').show();
    $('.content-grid').empty();
    $('.costs-box').hide();
  }

  setTimeout(() => {
    $('.icon-open').attr('src','/img/open-down.png');
  },400)

}



function buildBoxes(data){
  new BuildBox()
  .group('Geral', data.count, 'min-col')
  .info('Valor', Num.money(data.total), 'high-val')
  .info('Desconto', Num.money(data.discount), 'high-val')
  .info('Ticket', Num.money(data.tkm))
  .info('Custo Produtos', Num.money(data.cost))
  .info('Frete', Num.money(data.freight))
  .info('Recompra', Num.percent((data.repurchaseCount*100)/data.count))
  .info('Peso', Floa.weight(data.weight) + 'Kg')
  .info('R$/Kg', Num.money(data.total/data.weight))
  .info('Margem', Num.percent((data.profit*100)/data.total), data.profit ? 'green-val': 'red-val')
  .info('Lucro', Num.money(data.profit), data.profit ? 'green-val': 'red-val')

  .group('Produtos', Num.points(data.items), 'gray')
  .info('Markup', Floa.abs((data.total - data.freight) / data.cost, 3))
  .info('Med. Pedido', Floa.abs(data.avgItems,3))
  .info('Med. Un', Num.money(data.avgUnit));


  var box = new BuildBox()
  .group('Estados', data.uf.length);
  data.uf.forEach((each) => {
    box.square(each.name, each.count, Num.percent(each.count*100/data.count, true), Num.format(each.total), 'uf', each.name, data.uf[0].count);
  });


  var box = new BuildBox()
  .group('Cidades', data.city.length);
  data.city.forEach((each) => {
    box.square(each.name, each.count, Num.format(each.total), null, 'city', each.name, data.city[0].count);
  });


  var box = new BuildBox()
  .group('Pagamentos', data.paymentType.length);
  data.paymentType.forEach((each) => {
    box.square(Util.getPaymentType(each.name), each.count, Num.percent(each.count*100/data.count, true), Num.format(each.total), 'paymentType', each.name, data.paymentType[0].count);
  });

  box.group('Cupons', data.coupom.length, 'gray coupom-box');
  showedCount=0;
  data.coupom.forEach((each) => {
    if (each.count >= 5) showedCount++;
    box.toast(each.name, each.count, 'coupom ' + ((each.count < 5) && (showedCount > 10) ? 'coupom-hidable' : ''), 'coupom');
  });


  var table = new BuildBox().table()
  .row('header')
  .col('')
  .col('Pedidos', 'high-val')
  .col('Total')
  .col('Ticket')
  .col('%', 'middle')
  .col('Prazo Min.')
  .col('Prazo Máx.')
  .col('Prazo Méd.', 'high-val')
  .col('Valor Min.')
  .col('Valor Máx.')
  .col('Valor Méd.', 'high-val')
  .col('% Ped.')
  .col('Total ' + data.transport.length);

  data.transport.forEach((each) => {
    table.row()
    .col(each.name, 'super high-val')
    .col(each.count, 'super high-val')
    .col(Num.format(each.total))
    .col(Num.parse(each.total/each.count, true))
    .col(Num.percent((each.count * 100) / data.count))
    .col(each.minDT, 'middle')
    .col(each.maxDT, 'middle')
    .col(Num.int(each.countDT / each.count) + ' dias', 'high-val')
    .col(Num.parse(each.minValue))
    .col(Num.parse(each.maxValue))
    .col(Num.parse(each.totalValue / each.count), 'high-val')
    .col(Num.percent((each.totalValue * 100) / each.total ))
    .col(Num.parse(each.totalValue), 'min-val')

  });


  table.row('footer')
  .col()
  .col(data.count, 'high-val')
  .col(Num.format(data.total))
  .col()
  .col()
  .col()
  .col()
  .col(Num.int(data.transportSummary.countDT / data.count) + ' dias', 'high-val')
  .col()
  .col()
  .col(Num.format(data.transportSummary.totalValue / data.count), 'high-val')
  .col(Num.percent( (data.freight* 100) / data.total))
  .col(Num.format(data.transportSummary.totalValue), 'min-val')


  coloringData();
  tagsHandler.bind();
  toogleCupomHidable(true);
}








function coloringData(){
  $('.coloring-data').each((i , each) => {
    var perc = $(each).data('cur') / $(each).data('max');
    $(each).css('background-color', "rgba(200, 200, 200, x)".replace('x', perc));
  });
}








function toogleCupomHidable(hide){
  if (hide){
    $('.coupom-hidable').fadeOut();
  }else{
    $('.coupom-hidable').fadeIn().css("display","inline-block");
  }

  if ($('.coupom-hidable').length && !$('.hide-infos').length){
    var hide = $('<span>').addClass('hide-infos').text('Ver Mais');
    hide.click(() => {
      var toggle = $('.coupom-hidable').first().is(':visible');
      hide.text(toggle ? 'Ver Mais' : 'Ver Menos');
      toogleCupomHidable(toggle);
    });
    $('.coupom-box').append(hide);
  }
}

function paramsVariablesBinding(){
  $('.param-info > input').focusin(function (){
    $(this).val($(this).val().split(' ').pop());
    $(this).select();
  });


  var format = function(){
    var val = _params[$(this).attr('id')] || Floa.def($(this).val());

    if(val){
      $(this).val(Num.money(val));
    }

    var label = $(this).parent().find('label');
    if (label.length){
      label.text(label.data('label') + ' ('+Num.percent((val*100)/data.total)+')');
    }
  };


  $('.param-info > input').focusout(format);
  $('.param-info > input').trigger('focusout');

  $('.param-info > input').change(function() {
    var id = $(this).attr('id');
    var val = $(this).val();
    _params[id] = val;
    _post('/put-main-param', {name: id, val: val}, () => {
      //nothing
    });
  });

}
