
class CostsBoxBuilder extends BoxBuilder {
  constructor (costs, total) {
    super()
    this.data = costs
    this.total = total

    this.box.css('grid-column', '3 / 5')
  }

  inputGroup (title, editable = false, num = '', clazz = '') {
    var group = $('<div>').addClass('row ' + clazz)
    this.box.append(group)

    this.currentGroup = group
    this.currentEditable = editable

    group.append($('<span>').addClass('title').append(title, $('<label>').addClass('right sum red-val min-val').text(num)))

    return this
  }

  _getValue (id) {
    var val = 0
    if (this.data) {
      this.data.forEach((each) => {
        val += parseFloat(each.data[id]) || 0
      })
    }

    return val
  }

  _format (input, val) {
    var value = parseFloat(val)
    input.val(Num.money(value)).data('val', val)

    this._refreshTotalInfos()

    var label = input.parent().find('label')
    if (label.length) {
      label.text(label.data('label') + ' (' + Num.percent((value * 100) / this.total) + ')')
    }
  }

  field (label, id) {
    var val = this._getValue(id)

    var $inputHolder = $('<div>').addClass('material-input-holder')

    var $input = $('<input>').attr('type', 'text').attr('id', id).attr('required', '').attr('disabled', !this.currentEditable)
    var $bar = $('<span>').addClass('bar')
    var $label = $('<label>').text(label).data('label', label)
    $inputHolder.append($input, $bar, $label)

    this.currentGroup.append($('<div>').addClass('col').append($inputHolder))

    if (val) {
      this._format($input, val)
    }

    $input.change(() => {
      var val = Num.moneyVal($input.val())

      _post('/performance/sales-dashboard-cost', { tag: $input.attr('id'), val: val }, (e) => {
        this._format($input, val)
      })
    })

    return this
  }

  _refreshTotalInfos () {
    var totalCost = parseFloat($('input').toArray().reduce((acun, each) => {
      return acun + (parseFloat($(each).data('val')) || 0)
    }, 0))

    var sumCosts = Num.money(totalCost)

    this.currentGroup.find('.sum').text(sumCosts)
    $('#costs-sum').text(sumCosts)

    var liqProfit = this.total - totalCost
    var color = liqProfit > 0 ? '#08ab08' : '#e60000'

    $('#liq-profit').text(Num.money(liqProfit)).css('color', color)
    $('#liq-perc').text(Num.percent((liqProfit * 100 / this.total))).css('color', color)
  }

  showPerformance () {
    this.group('Performance', 0, 'gray min-col')
      .info('Faturamento', Num.money(this.total))
      .info('Custos Totais', 0, null, 'costs-sum')
      .info('Lucro Líquido', 0, null, 'liq-profit')
      .info('Margem Líquida', 0, null, 'liq-perc')
      .build()

    this._refreshTotalInfos()
  }
}
