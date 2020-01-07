var MEM_TAG;
var memoryList;



$(document).ready(()=>{


  MEM_TAG = 'shipping-order-' + (shippingOrder.numeroColeta || 'new');
  memoryList = Local.get(MEM_TAG) || [];

  onInit();

  $('#nf').on("keyup", function(e) {
    if ((e.which == 13) && ($(this).val().length > 5)){
      handleNfeInclusion($(this).val().trim());
    }
  });

  $('.icon-open-list').click(function(e){
    var tableId = $(this).data('table');

    if (!$(this).hasClass('closed')){
      $(this).addClass('closed').attr('src','/img/open-down.png').hide().fadeIn();
      $('#' + tableId + ' > tbody > tr').not(':first').hide();

      var title = $('<span>').addClass('title-closed ' + tableId).text($(this).data('title')).click(()=>{
        $(this).click();
      });

      $('#' + tableId).parent().append(title);
    }else{
      $('.title-closed.' + tableId).remove();
      $(this).removeClass('closed').attr('src','/img/open-up.png').hide().fadeIn();
      $('#' + tableId + ' > tbody  > tr').not(':first').show();
    }

    e.stopPropagation();
    e.preventDefault();
  });

  $('#save').click(() => {
    saveShippingOrder();
  });

});

function onInit(){
  createNfsTable('nfs-in-holder', 'nfs-in', {title: 'Lista de Notas da Ordem de Coleta'});
  loadNfsInTableFromDataBase();
  loadNfsInTableFromMemory();
}


function createNfsTable(holder, id, data){
  var table = $('<table>').attr('id',id).addClass('nfs-table');

  var cols = [];

  var closeIcon = $('<img>').addClass('icon-open-list')
  .data('table',id)
  .attr('title', data.title)
  .data('title', data.title)
  .attr('src','../img/open-up.png');

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
  }
}

function addLines(nfes){
  nfes.forEach(each => {
    var tr = $('<tr>').append(buildLine(each)).attr('data-nfe', each.numero);

    if (each.memory){
      tr.addClass('memory-line');
    }

    tr.fadeIn();

    $('#nfs-in tr:first').after(tr);
  });

  refreshHeader(nfes);
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

  if (each.memory){
    lastCol.append($('<img>').attr('src','/img/delete.png').addClass('dots-glyph nfe-remove').click(() => {
      $("tr[data-nfe='" + each.numero + "']").fadeOut(300, function(){
        $(this).remove();
      });
      removeFromMemory(each.numero);
    }));
  }

  cols.push(lastCol);

  return cols;
}

function createColVal(val, center, bold){
  var td = $('<td>').addClass('product-val').append($('<span>').append(val));

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

function refreshHeader(nfs){
  var vols = 0;
  var val = 0;
  var wei = 0;
  var ufs = {};

  nfs.forEach((e) => {
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
  console.log(nfe);

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
    msg = 'NF já foi incluida em uma Ordem de Coleta anteriormente.<a style="color: #5f5fda"  target="_blank" href="shipping-order?id=' + nfe.idOrdemColeta + '">Ver Mais.</a>';
  }

  if (msg){
    showMsg(msg, 'alert', true);

    if (sound){
      sound();
    }
  }

  return !msg;
}

function onInsertNewNfeOnShippingOrder(nfe){
  var object = {
    numero: nfe.numero,
    totalFaturado: nfe.totalFaturado,
    dataEmissao: nfe.dataEmissao,
    pesoTransportadora: nfe.pesoBruto,
    memory: true,
    qtdVolumes:  nfe.qtdVolumes,
    contato: nfe.contato,
    uf: nfe.uf
  };

  addOnMemory(object);
  addLines([object]);
  showMsg(null, 'checked', false);
  beepSucess();

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

function removeFromMemory(nfeNumber){
  memoryList = memoryList.filter((e) => {
    return e.numero != nfeNumber;
  });

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
  _post('/shipping-order-save', )
}

function createNewShippingOrder(firstNfe){
  shippingOrder.transportador = firstNfe.transportador;
  shippingOrder._NotasFiscais = [firstNfe.numero];

  console.log(shippingOrder);
  
  _post('/shipping-order-new', {data: shippingOrder}, (data) => {
    console.log(data);
  });
}
