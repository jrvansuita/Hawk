$(document).ready(() => {

  JsBarcode("#barcode", sale.number, {
    lineColor: "#000",
    width: 3,
    height: 60,
    displayValue: false
  });
});
