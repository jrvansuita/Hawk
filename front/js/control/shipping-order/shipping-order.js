$(document).ready(()=>{

  onInit();

});




function onInit(){

  createNfsTable('nfs-in-holder', 'nfs-in', {title: 'Lista de Notas Da Ordem de Coleta'});
  loadNfsInTable();
}



function createNfsTable(holder, id, data){
  var table = $('<table>').attr('id',id).addClass('nfs-table');

  var cols = [];

  var closeIcon = $('<img>').addClass('icon-open-list')
  .data('table',id)
  .attr('title', data.title)
  .data('title', data.title)
  .attr('src','../img/open-up.png');

  cols.push($('<td>').append('NF'));
  cols.push($('<td>').append('Data'));
  cols.push($('<td>').append('Cliente'));
  cols.push($('<td>').append('Destino'));
  cols.push($('<td>').append('Valor'));
  cols.push($('<td>').append('Volumes', closeIcon));

  $('.' + holder).append(table.append($('<tr>').append(cols)));
}

function loadNfsInTable(){
  if (shippingOrder && shippingOrder._NotasFiscais){

    shippingOrder._NotasFiscais.forEach(each => {
      $('#nfs-in tr:last').after(buildProductLine(each, {icon:false, table: 'out'}));
    });

  }
}
