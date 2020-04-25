$(document).ready(()=>{


  if ($('.this-month').length > 0){

    _get('/packing-days', {from: Dat.firstDayOfMonth().getTime(), to: Dat.lastDayOfMonth().getTime()}, (data)=>{
      
      new PackingChart('packing-chart-month', data, loggedUser.full).load();
    });

    _get('/packing-days', {from: Dat.firstDayOfYear().getTime(), to: Dat.today().getTime()}, (data)=>{
      new PackingChart('packing-chart-year', data, loggedUser.full, true).load();
    });


  }

});
