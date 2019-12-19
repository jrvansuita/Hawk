var MEM_TAG;


$(document).ready(()=>{
  MEM_TAG = 'shipping-order-' + shippingOrder.numeroColeta;

  onInit();

  $('#nf').on("keyup", function(e) {
    if (e.which == 13){
      addNfToOc($(this).val());
    }
  });
});

function onInit(){
  createNfsTable('nfs-in-holder', 'nfs-in', {title: 'Lista de Notas Da Ordem de Coleta'});
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
  var memory = Local.get(MEM_TAG);

  if (memory && (memory.length > 0)){
    addLines(memory);
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
  cols.push(createColVal(each.numeroPedido));
  cols.push(createColVal(each.numeroDaOrdemDeCompra));
  cols.push(createColVal(Dat.format(new Date(each.dataEmissao))));
  cols.push(createColVal(each.contato));
  cols.push(createColVal(Num.money(each.totalFaturado)));
  cols.push(createColVal(Floa.weight(each.pesoTransportadora)));
  cols.push(createColVal(each.qtdVolumes, true));
  cols.push(createColVal(each.uf, true));

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
  $('.ufs-list').text(Object.keys(ufs).sort().join(', '))
}


function addNfToOc(nfNumber){
  $('#nf').val('');

  _get('/nfe', {number: nfNumber}, (nfe) => {
    handleNfeAndAddToOc(nfe);
  });
}

function handleNfeAndAddToOc(nfe){
  if (nfe){
    var memory = Local.get(MEM_TAG) || [];

    var foundIndex = memory.findIndex((e) => {
      return e.numero == nfe.numero;
    });

    var found = memory[foundIndex];
    memory.splice(foundIndex, 1);

    var vols = found ? found.vols : 1;

    var object = {
      numero: nfe.numero,
      totalFaturado: nfe.totalFaturado,
      dataEmissao: nfe.dataEmissao,
      pesoTransportadora: nfe.pesoBruto,
      memory: true,
      vols: vols,
      qtdVolumes:  nfe.qtdVolumes > 1 ? vols + '/' + nfe.qtdVolumes : 1,
      contato: nfe.contato,
      uf: nfe.uf
    };

    memory.push(object);
    Local.put(MEM_TAG, memory);
    $("[data-nfe='" + nfe.numero + "']").remove();
    addLines([object]);
  }
}
