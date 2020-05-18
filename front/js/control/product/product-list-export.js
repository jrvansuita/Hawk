$(document).ready(() => {
  allDiv();

});
/*
function itemCondition(callback){

data.forEach((item) => {
if(){
$('.all').remove();
}
});
callback(this);
}

*/

function allDiv(){
  $(".child-item").each(function(){
    var sku = $(this).data("sku");

    barcodeS(sku, $(this), );
  });
}

function barcodeS(sku, element){
  var svg = $(element).find("#barcode");
  var ean = eans[sku];

  JsBarcode(svg[0],ean , {
    lineColor: "#000",
    width: 1,
    height: 30,
    displayValue: true
  });

}
