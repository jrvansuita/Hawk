var data = window.opener.detailed

$(document).ready(() => {
    masterDetails()
    console.log(data);
    buildTableItens()
})

function masterDetails() {
    var companyManu = $('<h1>').text(data.manufacturer[0].name)
    var totalPrice = $('<span>').text(Num.money(data.total))
    var skuCount = $('<span>').text('Total:' + ' ' + Num.parse(data.items).replace(',00', ''))
    $('.manufac-details').append(companyManu, totalPrice, skuCount)

    var dayInit = $('<span>').text(data.detailed.dates.from)
    var dayEnd = $('<span>').text(data.detailed.dates.to)

    $('#from').append(dayInit)
    $('#to').append(dayEnd)

    data.brand.forEach((each) => {
     $('.brands').append($('<p>').text(each.name))
    })
}

 function buildTableItens() {
     var headTable = data.detailed.categories
     var holder = $('<table>')

     Object.keys(headTable).forEach((e) => {
        var codeName = $('<th>').text('SKU')
        var size = $('<th>').text('Tamanho').attr('colspan', '10')
        var $div = $('<div>').addClass('itens-inner')

        $div.append($('<p>').text(e), codeName, size)

        headTable[e].forEach((each) => {
            var $tr = $('<tr>')
            var sku = $('<td>').text(each.name)

            $div.append($tr.append(sku))

            sizesBuilder($tr, each.sizes);
        })

        $('.all').append(holder.append($div))

        // console.log(e);
     })
 }

 function sizesBuilder(holder, sizes) {
    Object.keys(sizes).forEach((key) => {
        var $td = $('<td>').addClass('inner-sizes')
        var tamanho = $('<label>').text(key + ': ').addClass('size')
        var quantitySold = $('<span>').text(sizes[key]).addClass('size-sold')

        holder.append($td.append(tamanho, quantitySold))

        console.log();
        // sizes[key]
    })
 }
