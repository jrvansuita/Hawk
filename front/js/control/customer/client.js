
$(document).ready(() => {

  $('#search-button').click(() => {
    search();
  });

  $('#search-sale').on("keyup", function(e) {
    if (e.which == 13){
      search();
    }
  });

  $('.sale-number').dblclick(function(e) {
    e.stopPropagation();
    window.open('/packing?sale=' + $(this).text(), '_blank');
  });


  prepareAutoComplete();

  $('.sale-dots').click(buildSaleMenuOptions());

  startBindingInformations();
});

function search(){
  if ($("#search-sale").val()){
    reopenUrl('sale', $("#search-sale").val());
  }else{
    seachCurrentClient();
  }
}

function prepareAutoComplete(){
  var options = {

    url: function(phrase) {
      return "/customer-search-autocomplete?typing=" + phrase;
    },

    getValue: function(element) {
      return element.name;
    },

    template: {
      type: "custom",
      method: function(value, data) {
        return  getAutoCompleteTemplate(data);
      }
    },

    ajaxSettings: {
      dataType: "json",
      method: "GET",
      data: {
        dataType: "json"
      }
    },
    requestDelay: 400,
    list: {
      maxNumberOfElements: 50,
      match: {
        enabled: false
      },
      sort: {
        enabled: true
      },

      onChooseEvent: () => {
        seachCurrentClient();
      }
    },
  };

  $("#search-client").easyAutocomplete(options);
}

function seachCurrentClient(){
  if ($("#search-client").getSelectedItemData().id){
    reopenUrl('id', $("#search-client").getSelectedItemData().id);
  }
}

function reopenUrl(param, val){
  window.location.href = '/customer-service/client?'+ param + '=' +  val;
}


function getAutoCompleteTemplate(data){
  var name = $('<span>').addClass('auto-client-name').append(data.name);
  var socialCode = $('<span>').addClass('auto-client-social').append(data.socialCode);
  var email = $('<span>').addClass('auto-client-email').append(data.email);
  return $('<div>').append(name, socialCode, email);
}

function buildSaleMenuOptions(){
  return function(e){
    var sale = $(this).data('sale');
    new MaterialDropdown($(this), e)
    .addItem('../img/transport/default.png', 'Rastreio', ()=>{
      window.open('https://status.ondeestameupedido.com/tracking/6560/' + sale, '_blank');
    }).show();
  }
}



function showSaleDialog(sale){
  $('.sale-modal').show();

  $('.sale-modal').one('click', function (e){
    $('.sale-viewer-holder').empty();
    $('.sale-modal').hide();
    e.stopPropagation();
  });

  $('.sale-viewer-holder').click(function (e){
    e.stopPropagation();
  });


  $('.sale-viewer-holder').load('/customer-service/sale-dialog?saleNumber=' + sale, ()=>{
    bindCopiable();
  });
}

function bindClientResume(){
  $('.client-resume-sales').text(client.sales.length);

  var tm = client.sales.reduce((value, sale) => {
    return value + parseFloat(sale.grand_total);
  },0);

  $('.client-resume-ticket').text(Num.money(tm/client.sales.length));

  $('.client-sale-total-value').text(Num.money(tm));

  var tp = client.sales.reduce((value, sale) =>{
    if(sale.status != 'canceled' && sale.status != 'pending_payment'){
      value += parseFloat(sale.grand_total);
    }
    return value
  },0);

  $('.client-sale-total-paid').text(Num.money(tp));

  var im = client.sales.reduce((value, sale) => {
    return value + parseFloat(sale.total_item_count);
  },0);

  $('.client-resume-itens').text(Floa.abs(im/client.sales.length,2));
}


function setFocusOnSale(){
  var sales = $('.client-sales tr');

  var url_string = window.location.href;
  var url = new URL(url_string);
  var sale = url.searchParams.get("sale");

  if(sale != null){
    sales.each((i, el) => {
      if($(el).data('sale') == sale){
        $(el).addClass('selected');
      }
    });
  }
}
function startBindingInformations(){
  bindClientResume();
  setFocusOnSale();
}
