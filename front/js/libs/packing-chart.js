class PackingChart {

  constructor(chartId, data, isFull, monthView){
    this.chartId  = chartId;
    this.data = data;
    this.isMonthView = monthView;
    this.isFull = isFull;
  }




  load(){
    this.buildDataset();
    this.buildChart();
  }

  processDays(){
    this.labels = [];
    this.values = [];
    this.counts = [];
    this.tkms = [];

    this.data.forEach((each)=>{
      this.labels.push(each._id.day);
      this.values.push(each.sum_total);
      this.counts.push(each.sum_count);
      this.tkms.push(each.sum_total/each.sum_count);
    });
  }

  processMonths(){
    var handler = {};

    this.data.forEach((each)=>{

      var item = handler[each._id.month];

      if (item){
        item.value +=each.sum_total;
        item.count +=each.sum_count;
      }else{
        item = { label : each._id.month,
          value : each.sum_total,
          count : each.sum_count
        };
        handler[each._id.month] = item;
      }
    });


    this.labels = [];
    this.values = [];
    this.counts = [];
    this.tkms = [];

    Object.values(handler).forEach((each)=>{
      this.labels.push(Dat.brevMonthDesc(each.label-1));
      this.values.push(each.value);
      this.counts.push(each.count);
      this.tkms.push(each.value/each.count);
    });
  }

  handleDatasets(){
    this.datasets = [];

    if (this.isFull){
      this.datasets.push({
        backgroundColor: '#03c1844a',
        borderColor: '#03c184',
        pointRadius: 3,
        label: 'Valor',
        data: this.values,
      });
    }

    this.datasets.push({
      backgroundColor: '#14b5a64a',
      borderColor: '#14b5a6',
      pointRadius: 3,
      label: 'Pedidos',
      data: this.counts
    });

    this.datasets.push({
      backgroundColor: '#3e55ff4a',
      borderColor: '#3e55ff',
      pointRadius: 3,
      label: 'Ticket',
      data: this.tkms
    });
  }


  buildDataset(){
    if (this.data.length > 30 || this.isMonthView){
      this.processMonths();
    }else{
      this.processDays();
    }

    this.handleDatasets();
  }


  buildChart(){
    var ctx = document.getElementById(this.chartId).getContext('2d');

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
            left: 25,
            right: 25,
            top: 25,
            bottom: 25
          }
        },

        legend:{
          display:true,
          labels: {
            fontSize: 14,
            boxWidth: 12,
            padding: 15,
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
                return Num.format(value, false);
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
            fill: true,
            tension: 0.5,
          },
        }


      }
    });
  }
}
