var data = window.opener.detailed

$(document).ready(() => {
    masterDetails()
    console.log(data);
})

function masterDetails() {
    var companyManu = $('<h1>').text(data.manufacturer[0].name)
    var totalPrice = $('<span>').text(Num.money(data.total))
    var skuCount = $('<span>').text('Total:' + ' ' + Num.parse(data.items).replace(',00', ''))
    $('.manufac-details').append(companyManu, totalPrice, skuCount)

    var dayInit = $('<span>').text(data.dates.from)
    var dayEnd = $('<span>').text(data.dates.to)

    $('#from').append(dayInit)
    $('#to').append(dayEnd)
}
