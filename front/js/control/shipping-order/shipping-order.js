var MEM_TAG;
var memoryList;
var nfeHighlight;

$(document).ready(()=>{

  nfeHighlight = Util.getUrlParam('nfe');

  initMemoryHandler();

  onInit();

  $('#nf').on("keyup", function(e) {
    if ((e.which == 13) && ($(this).val().length > 5)){
      handleNfeInclusion($(this).val().trim());
    }
  });

  $('.icon-open-list').click(function(e){
    var tableId = $(this).data('table');

    if (!$(this).hasClass('closed')){
      $(this).addClass('closed').attr('src','/img/arrow-down.png').hide().fadeIn();
      $('#' + tableId + ' > tbody > tr').not(':first').hide();

      var title = $('<span>').addClass('title-closed ' + tableId).text($(this).data('title')).click(()=>{
        $(this).click();
      });

      $('#' + tableId).parent().append(title);
    }else{
      $('.title-closed.' + tableId).remove();
      $(this).removeClass('closed').attr('src','/img/arrow-up.png').hide().fadeIn();
      $('#' + tableId + ' > tbody  > tr').not(':first').show();
    }

    e.stopPropagation();
    e.preventDefault();
  });

  $('#save').click(() => {
    saveShippingOrder();
  });

});

function initMemoryHandler(removeNew){
  if (removeNew && MEM_TAG){
    clearMemory();
  }

  MEM_TAG = 'shipping-order-' + (shippingOrder.numeroColeta || 'new');
  memoryList = Local.get(MEM_TAG, []);
}

function clearMemory(tag){
  Local.put(tag || MEM_TAG, []);
}

function onInit(){
  createNfsTable('nfs-in-holder', 'nfs-in', {title: 'Lista de Notas da Ordem de Coleta'});
  loadNfsInTableFromDataBase();
  loadNfsInTableFromMemory();
  refreshHeader();

  if (shippingOrder.numeroColeta){
    $('#save').show();
  }else{
    $('#save').hide();
  }
}


function createNfsTable(holder, id, data){
  var table = $('<table>').attr('id',id).addClass('nfs-table');

  var cols = [];

  var closeIcon = $('<img>').addClass('icon-open-list')
  .data('table',id)
  .attr('title', data.title)
  .data('title', data.title)
  .attr('src','../img/arrow-up.png');

  cols.push($('<td>'));
  cols.push($('<td>').append('NF'));
  cols.push($('<td>').append('Pedido'));
  cols.push($('<td>').append('OC'));
  cols.push($('<td>').append('Data'));
  cols.push($('<td>').append('Cliente'));
  cols.push($('<td>').append('Valor'));
  cols.push($('<td>').append('Peso'));
  cols.push($('<td>').append('Volumes'));
  cols.push($('<td>').append('Destino',closeIcon));

  $('.' + holder).append(table.append($('<tr>').append(cols)));
}

function loadNfsInTableFromDataBase(){
  if (shippingOrder && shippingOrder._NotasFiscais){
    addLines(shippingOrder._NotasFiscais);
  }
}

function loadNfsInTableFromMemory(){
  if (memoryList && (memoryList.length > 0)){
    addLines(memoryList);

    onShippingOrderIsInMemory(memoryList[0]);
  }
}

function addLines(nfes){
  var highlightedLine;

  nfes.forEach(each => {
    var tr = $('<tr>').append(buildLine(each)).attr('data-nfe', each.numero);

    if (each.memory){
      tr.addClass('memory-line');
    }

    if (each.numero == nfeHighlight){
      tr.addClass('hightlight-line');
      highlightedLine = tr;
    }else{
      $('#nfs-in tr:first').after(tr);
      tr.fadeIn();
    }
  });

  if (highlightedLine){
    $('#nfs-in tr:first').after(highlightedLine);
  }

  $('.nfs-in-holder').show();
  $('#nf').focus();
}

function buildLine(each){
  var cols = [];

  cols.push(createIcon('checked'));
  cols.push(createColVal(each.numero, false, true));
  cols.push(each.numeroPedido ?  createColVal(each.numeroPedido) : createIcon('h-dots'));
  cols.push(each.numeroDaOrdemDeCompra ? createColVal(each.numeroDaOrdemDeCompra) : createIcon('h-dots'));
  cols.push(createColVal(Dat.format(new Date(each.dataEmissao))));
  cols.push(createColVal(each.contato));
  cols.push(createColVal(Num.money(each.totalFaturado)));
  cols.push(createColVal(Floa.weight(each.pesoTransportadora)));
  cols.push(createColVal(each.qtdVolumes, true));

  var lastCol = createColVal(each.uf);

  lastCol.append($('<img>').attr('src','/img/delete.png').addClass('dots-glyph nfe-remove').click(() => {
    $("tr[data-nfe='" + each.numero + "']").fadeOut(300, function(){
      $(this).remove();
    });

    removeSale(each.numero);
  }));

  cols.push(lastCol);

  return cols;
}

function createColVal(val, center, bold){
  var td = $('<td>').addClass('row-val').append($('<span>').append(val));

  if (center){
    td.css('text-align','center');
  }

  if (bold){
    td.addClass('bold');
  }

  return td;
}


function createIcon(iconPath){
  return $('<td>').append($('<img>').attr('src','/img/' + iconPath + '.png').addClass('mini-icon'));
}

function getAllNfs(){
  return memoryList.concat(shippingOrder._NotasFiscais || []);
}

function refreshHeader(){
  var vols = 0;
  var val = 0;
  var wei = 0;
  var ufs = {};

  getAllNfs().forEach((e) => {
    vols+= parseFloat(e.qtdVolumes);
    val+= parseFloat(e.totalFaturado);
    wei+= parseFloat(e.pesoTransportadora);
    ufs[e.uf] = '';
  });

  $('.total-val').text(Num.money(val));
  $('.itens-count-display').text(vols + ' Volumes');
  $('.wei-val').text(Floa.weight(wei) + ' Kg');

  var ufsStr = Object.keys(ufs).sort().join(', ');

  $('.ufs-list').text(ufsStr || 'Nenhum')
}


function handleNfeInclusion(nfNumber){
  if (Num.isInt(nfNumber)){
    $('#nf').val('');

    _get('/nfe', {number: nfNumber}, (nfe) => {
      if (onCheckNfeParameters(nfNumber, nfe)){
        onInsertNewNfeOnShippingOrder(nfe);
      }
    });
  }
}

function onCheckNfeParameters(query, nfe){
  var sound = '';
  var msg = '';

  if (!nfe){
    sound = beepError;
    msg = 'NF ' + query + ' não encontrada!';
    $('#nf').val(query).select();
  }else if ($("[data-nfe='" + nfe.numero + "']").length != 0){
    sound = beepError;
    msg = 'NF já incluida nessa ordem de coleta!';
  }else if (nfe.situacao != '7'){
    sound = beepNoisy;
    msg = 'NF ['+ nfe.numero +'] não está autorizada na Receita Federal';
  }else if ((shippingOrder.transportador != undefined) && (nfe.transportador != shippingOrder.transportador)){
    sound = beepThreeSign;
    msg = 'NF de Transportadora['+Util.transportName(nfe.transportador, '--')+'] inválida para essa Ordem de Coleta[' + Util.transportName(shippingOrder.transportador, '--') + ']';
  }else if(nfe.idOrdemColeta != 0){
    sound = beepError;
    msg = 'NF já foi incluida em uma Ordem de Coleta anteriormente.<a style="color: #5f5fda"  target="_blank" href="shipping-order?id=' + nfe.idOrdemColeta + '&nfe='+nfe.numero+'">Ver Mais.</a>';
  }else if(!checkAndAllowDifal(nfe)){
    sound = beepError;
    msg = 'NF '+nfe.numero+' é do estado ' + nfe.uf + '. Difal não permitido!';
  }

  if (msg){
    showMsg(msg, 'alert', true);

    if (sound){
      sound();
    }
  }

  return !msg;
}

function checkAndAllowDifal(nfe){
  var result = true;
  if (Params.activeDifalControlOC()){
    if (!$('#allow-difal').is(':checked')){
      var isDifal = Params.difalUfs().split(',').some((each) => {
        return each.trim().includes(nfe.uf);
      });

      result = !isDifal;
    }
  }

  return result;
}

function onInsertNewNfeOnShippingOrder(nfe){
  var object = {
    id: nfe.id,
    numero: nfe.numero,
    totalFaturado: nfe.totalFaturado,
    dataEmissao: nfe.dataEmissao,
    pesoTransportadora: nfe.pesoBruto,
    memory: true,
    qtdVolumes:  nfe.qtdVolumes,
    contato: nfe.contato,
    uf: nfe.uf,
    transportador: nfe.transportador
  };

  addOnMemory(object);
  addLines([object]);
  showMsg(null, 'checked', false);
  beepSucess();
  refreshHeader();

  if (!shippingOrder.numeroColeta){
    createNewShippingOrder(nfe);
  }
}

function saveMemory(){
  Local.put(MEM_TAG, memoryList);
}

function addOnMemory(nfe){
  memoryList.push(nfe);
  saveMemory();
}

function removeSale(nfeNumber){
  var filter = (each) => {
    return each.numero != nfeNumber;
  };

  memoryList = memoryList.filter(filter);


  if (shippingOrder._NotasFiscais){
    shippingOrder._NotasFiscais = shippingOrder._NotasFiscais.filter(filter);
  }

  saveMemory();
}

function showMsg(msg, icon, isError){
  $('#nf-icon').attr('src','/img/'+ icon +'.png').hide().show();
  showMessage(msg, isError, ()=>{
    $('#nf-icon').attr('src','/img/scan-barcode.png').show();
  });
}

function showMessage(msg, isError, onAutoHide){
  var delay = 2000 + (msg ? (msg.length * 150) : 0);

  $('.nf-msg')
  .html(msg)
  .css('color', isError ? 'red' : 'green')
  .clearQueue()
  .fadeIn()
  .delay(delay)
  .queue(function(next){
    if (onAutoHide != false) onAutoHide();

    if (onAutoHide != false){
      $(this).hide().clearQueue();
    }
    next();
  });
}

function saveShippingOrder(){
  if (shippingOrder.id){
    var idsNfes = getAllNfs().map((e) => {
      return e.id;
    }).filter(Boolean);

    _post('/shipping-order-save', {nfs: idsNfes, id: shippingOrder.id} ,() => {
      clearMemory();
      window.location = 'shipping-order?number=' + shippingOrder.numeroColeta;
    });
  }
}

function onShippingOrderIsInMemory(nfe){
  if (!shippingOrder.numeroColeta){
    var name = Util.transportName(nfe.transportador, 'none');

    $('.transport-holder .icon').attr('src', '/img/transport/' + name + '.png');
    $('.transport-holder .info').text(name);
  }
}

var isLoadingNewShippingOrder = false;

function createNewShippingOrder(firstNfe){
  if (!isLoadingNewShippingOrder){
    isLoadingNewShippingOrder = true;
    onShippingOrderIsInMemory(firstNfe);

    shippingOrder.transportador = firstNfe.transportador;
    shippingOrder._NotasFiscais = [firstNfe.numero];
    shippingOrder.data = Dat.api(new Date(), false, true);

    _post('/shipping-order-new', {data: shippingOrder}, (data) => {
      shippingOrder = data;
      isLoadingNewShippingOrder = false;
      onShippingOrderStored();
    },(err) => {
      showMsg(err.responseText, 'error', true);
    });
  }
}

function onShippingOrderStored(){
  initMemoryHandler(true);
  $('#save').show();

  $('.shipping-order-number').text('#' + shippingOrder.numeroColeta);
}
