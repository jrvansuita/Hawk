var data = window.opener.detailed

$(document).ready(() => {
    data.ordenedSizes = orderByLetters(orderSizes(data.size))
    masterDetails()
    buildTableItens()
    footerDetails()
})

function masterDetails() {
    var companyManu = $('<h1>').text(data.manufacturer[0].name)
    var totalPrice = $('<span>').text(Num.money(data.cost))
    var skuCount = $('<span>').text('Peças:' + ' ' + Num.parse(data.items).replace(',00', ''))

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
     var itemDetail = data.detailed.categories

     Object.keys(itemDetail).forEach((e) => {
        var $div = $('<div>').addClass('itens-inner')
        var holder = $('<table>').addClass('tb-holder')
        var thead = $('<thead>')
        var codeName = $('<th>').text('SKU')

        holder.append(thead.append(codeName))

        buildHeadTable(thead)

        var costTotal = 0
        var sizeTotal = 0

        itemDetail[e].forEach((each) => {
            var $tr = $('<tr>').addClass('line-itens')
            var $img = $('<img>').addClass('image-product')
            var sku = $('<td>').append($('<div>').append($img, $('<p>').text(each.name).addClass('sku')).addClass('col-name'))
            var soldSizes = $('<td>').text(each.items).addClass('total-itens')
            var itemCost = $('<td>').text(Num.money(each.itemCost)).addClass('item-cost')
            var value = each.items * each.itemCost
            var valueSold = $('<td>').text(Num.money(parseInt(each.items) * Number(each.itemCost))).addClass('value-sold')

            costTotal += value
            sizeTotal += each.items

            showPictures($img, each.name)
            $tr.append(sku)

            data.ordenedSizes.forEach((s) => {
                var columS = $('<td>').attr('size', s)

                holder.append($tr.append(columS, soldSizes, itemCost, valueSold))
            })

            sizesBuilder($tr, each.sizes);
        })
        var subSize = $('<p>').text('Total Tamanho: ' + sizeTotal).addClass('subtotal')
        var subVal = $('<p>').text('Total Custo: ' + Num.money(costTotal)).addClass('subtotal')

        $('.master-itens').append($div.append($('<h2>').text(e), holder, subSize, subVal))
     })
 }

 function buildHeadTable(holder) {
     var sold = $('<th>').text('Total Vendido')
     var costItem = $('<th>').text('Custo Produto')
     var value = $('<th>').text('Valor Total')

    data.ordenedSizes.forEach((each) => {
        var size = $('<th>').text(each)
     holder.append(size, sold, costItem, value)
    })
}

 function sizesBuilder(holder, sizes) {
    Object.keys(sizes).forEach((key) => {
        holder.find('td').each((index, each) => {
            // console.log($(each).attr('size'))
            if (key.toUpperCase() == $(each).attr('size')) {
                $(each).text(sizes[key])
            } else if ($(each).text().length === 0) { $(each).text('-') }
        })
    })
 }

 function orderSizes(sizes) {
    sizes.sort(function (a, b) {
        if (parseInt(a.name) > parseInt(b.name)) {
          return 1;
        }
        if (parseInt(a.name) < parseInt(b.name)) {
          return -1;
        }
        return 0;
      });

      return sizes
 }

 function orderByLetters(sizes) {
    var sizes = sizes.map((e) => { return e.name.toUpperCase() })

    var s = ['RN', 'P', 'M', 'G', 'GG']
    var result = []

    s.filter((x) => {
        if (sizes.includes(x)) {
            result.push(x)
        }
    })

    return [...new Set(result.concat(sizes))];
 }

 function footerDetails() {
    var finalPrice = $('<p>').text('Total de Venda:' + ' ' + Num.money(data.cost))
    var finalCount = $('<p>').text('Total de Peças:' + ' ' + Num.parse(data.items).replace(',00', ''))

    $('.footer-details').append(finalPrice, finalCount)
 }

 function showPictures($img, sku) {
    $('#pic-show').click(() => {
        $img.attr('src', '/product/image-redirect?sku=' + sku).toggleClass('visible')
        if ($img.css('display') !== 'none') {
            $('#pic-show').empty().text('Ocultar Fotos')
        } else {
            $('#pic-show').empty().text('Mostrar Fotos')
        }
    })
 }
