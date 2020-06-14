class StockDashChart {
  constructor (holder, data) {
    this.holder = holder
    this.data = data
    this.fields = []
  }

  field (data) {
    this.fields.push(data)
    return this
  }

  load () {
    this.buildDataset()
    this.buildChart()
  }

  processDays () {
    this.labels = []

    this.data.forEach((eachRow) => {
      this.labels.push(eachRow._id.day)

      this.fields.forEach((eachField) => {
        if (!eachField.data) eachField.data = []
        eachField.data.push(eachRow[eachField.tag])
      })
    })
  }

  handleDatasets () {
    this.datasets = []

    this.fields.forEach((eachField) => {
      this.datasets.push({
        borderColor: eachField.color || Util.strToColor(eachField.label),
        // pointRadius: 4,
        label: eachField.label,
        data: eachField.data
      })
    })
  }

  buildDataset () {
    this.processDays()
    this.handleDatasets()
  }

  buildChart () {
    var canvas = $('<canvas>').addClass('stock-dash-chart')

    this.holder.append(canvas)

    var ctx = canvas[0].getContext('2d')

    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.datasets
      },
      options: {
        hover: {
          animationDuration: 0
        },
        animation: {
          duration: 1,
          onComplete: function () {
            var chartInstance = this.chart
            var ctx = chartInstance.ctx
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'

            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i)
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index]

                var val = data > 50000 ? Num.format(data) : Num.points(data)

                ctx.fillStyle = '#666666'
                ctx.fillText(val, bar._model.x, bar._model.y - 5)
              })
            })
          }
        },

        responsive: true,
        layout: {
          padding: {
            left: 7,
            right: 15,
            top: 0,
            bottom: 0
          }
        },

        legend: {
          display: true,
          labels: {
            fontSize: 11,
            boxWidth: 1,
            padding: 12,
            fontStyle: 'bold',
            usePointStyle: true
          }
        },

        tooltips: {
          enabled: true,
          cornerRadius: 3,
          displayColors: false,
          backgroundColor: '#00796b',
          callbacks: {
            label: function (tooltipItem, data) {
              var val = tooltipItem.yLabel
              return val > 50000 ? Num.format(val) : Num.points(val)
            }
          }
        },

        scales: {
          xAxes: [{
            gridLines: {
              drawBorder: false
            }
          }],
          yAxes: [{
            ticks: {
              min: 1,
              display: false,
              callback: function (value, index, values) {
                return Num.format(value, false, true)
              }
            },
            gridLines: {
              color: 'rgba(0, 0, 0, 0)',
              drawBorder: false
            }
          }]
        },

        elements: {
          line: {
            fill: false,
            tension: 0.5
          }
        }

      }
    })
  }
}
