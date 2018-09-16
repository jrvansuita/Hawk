$(document).ready(()=>{


  $('.inner-label').click(function(){
    $(this).parent().click();
  });

  $('.dropdown').find('li').click(function(e){
    e.preventDefault();

   var params = window.location.search;
   var query = $(this).data('query');
   var value = $(this).data('value');

   var queries = params.replace('?','').split('&');

   queries = queries.filter((q)=>{
     return (q.length > 0) && !q.includes(query);
   });

   if(value){
     queries.push(query + "=" + value);
   }

   var queryResult = '';

   queries.forEach((q, i)=>{
       queryResult+= (i == 0 ? '?' : '&') + q;
   });

   window.setTimeout(function() {
      var url = window.location.origin + window.location.pathname;
       window.location.href =  url + queryResult;
   }, 100);
  });



});
