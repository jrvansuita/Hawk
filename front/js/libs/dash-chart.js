class StockDashChart {

  constructor(holder, data){
    this.holder  = holder;
    this.data = data;
  }

  load(){
    this.buildDataset();
    this.buildChart();
  }

  processDays(){
    this.labels = [];
    this.totals = [];
    this.quantities = [];
    this.costs = [];

    this.data.forEach((each)=>{
      this.labels.push(each._id.day);
      this.totals.push(each.sum_total);
      this.quantities.push(each.sum_quantity);
      this.costs.push(each.sum_cost);
    });
  }

  handleDatasets(){
    this.datasets = [];


    this.datasets.push({
      backgroundColor: '#03c1844a',
      borderColor: '#03c184',
      pointRadius: 3,
      label: 'Faturado',
      data: this.totals,
    });


    this.datasets.push({
      backgroundColor: '#14b5a64a',
      borderColor: '#14b5a6',
      pointRadius: 3,
      label: 'Custo',
      data: this.costs
    });

    this.datasets.push({
      backgroundColor: '#3e55ff4a',
      borderColor: '#3e55ff',
      pointRadius: 3,
      label: 'Quantidade',
      data: this.quantities
    });
  }


  buildDataset(){
    //if (this.data.length > 30 || this.isMonthView){
    //      this.processMonths();
    //  }else{
    this.processDays();
    //}

    this.handleDatasets();
  }


  buildChart(){


    var canvas = $('<canvas>').addClass('stock-dash-chart');

    this.holder.append(canvas);


    var ctx = canvas[0].getContext('2d');

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
            var chartInstance = this.chart,
            ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';


            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];

                var val = data > 50000 ?  Num.format(data) :  Num.points(data);

                ctx.fillStyle = '#666666';
                ctx.fillText(val, bar._model.x, bar._model.y - 5);
              });
            });
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

        legend:{
          display:true,
          labels: {
            fontSize: 11,
            boxWidth: 1,
            padding: 12,
            fontStyle: 'bold',
            usePointStyle: true
          }
        },




        tooltips:{
          enabled:true,
          cornerRadius:3,
          displayColors:false,
          backgroundColor: '#00796b',
          callbacks: {
            label: function(tooltipItem, data) {
              var val = tooltipItem.yLabel;
              return val > 50000 ?  Num.format(val) :  Num.points(val);
            }
          }
        },


        scales: {
          xAxes: [{
            gridLines: {
              drawBorder: false,
            }
          }],
          yAxes: [{
            ticks: {
              min: 1,
              display: false,
              callback: function(value, index, values) {
                return Num.format(value, false, true);
              }
            },
            gridLines: {
              color: "rgba(0, 0, 0, 0)",
              drawBorder: false
            }
          }]
        },


        elements: {
          line: {
            fill: false,
            tension: 0.5,
          },
        }


      }
    });
  }
}
