
$(document).ready(() => {

  $('#search-button').click(() => {
    search();
  });

  prepareAutoComplete();

  $('.sale-dots').click(function (e){
    var sale = $(this).data('sale');

    new MaterialDropdown($(this), e)
    .addItem('../img/transport/default.png', 'Rastreio', ()=>{
      //window.open('https://status.ondeestameupedido.com/tracking/6560/' + sale, '_blank');
         window.open('http://www.example.com?ReportID=1', '_blank');
    }).show();
  });


});

function search(){
  if ($("#search-sale").val()){
    open('sale', $("#search-sale").val());
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
    open('id', $("#search-client").getSelectedItemData().id);
  }
}

function open(param, val){
  window.location.href = '/customer-service/client?'+ param + '=' +  val;
}


function getAutoCompleteTemplate(data){
  var name = $('<span>').addClass('auto-client-name').append(data.name);
  var socialCode = $('<span>').addClass('auto-client-social').append(data.socialCode);
  var email = $('<span>').addClass('auto-client-email').append(data.email);
  var city = $('<span>').addClass('auto-client-city').append(data.city + '/' + data.state);
  return $('<div>').append(name, socialCode, email, city);
}
