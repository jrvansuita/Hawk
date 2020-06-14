$(document).ready(() => {
  allDiv()
})

function allDiv () {
  $('.child-item').each(function () {
    var sku = $(this).data('sku')

    barcodeS(sku, $(this))
  })
}

function barcodeS (sku, element) {
  var svg = $(element).find('#barcode')
  var ean = eans[sku]

  JsBarcode(svg[0], ean, {
    lineColor: '#000',
    width: 1,
    height: 30,
    displayValue: true
  })
}
