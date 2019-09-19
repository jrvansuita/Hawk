class StockChart {

  constructor(chartId, stockRowsGroups){
    this.chartId  = chartId;
    this.stockRowsGroups = JSON.parse(JSON.stringify(stockRowsGroups));
    this.keepOnlyBilledRows();


    this.sizes = [];
  }

  keepOnlyBilledRows(){
    Object.keys(this.stockRowsGroups).forEach((key)=>{
      this.stockRowsGroups[key] =  this.stockRowsGroups[key].filter((row)=>{
        return row.idOrigem != '' && row.es == 'S' && row.obs == '';
      });
    });
  }

  catchSizeFromSku(sku){
    var size = sku.split('-');
    size = size[size.length-1];

    this.sizes.push(size);

    return size;
  }

  load(){
    this.buildDataset();
    this.buildChart();
  }


  buildDataset(){
    this.dataset = [];
    this.allDates = {};
    this.maxValue = 0;
    var handler = {};


    Object.keys(this.stockRowsGroups).forEach((key)=>{
      var skuGroupRows = this.stockRowsGroups[key];
      var size = this.catchSizeFromSku(key);

      skuGroupRows.forEach((row)=>{
        var date = Dat.format(new Date(row.data));

        if (!this.allDates[date]){
          this.allDates[date] = new Date(row.data).getTime();
          handler[date] = {};
        }

        var value =  Math.abs(Num.def(row.quantidade));

        if (this.maxValue < value){
          this.maxValue = value;

        }
        handler[date][size] = value;
      });
    });

    this.allDates = Object.keys(this.allDates).sort((a,b)=>{
      return this.allDates[a] - this.allDates[b];
    });

    this.sizes.forEach((size, index)=>{
      var currentDates = [];

      this.allDates.forEach(date =>{
        var item = handler[date];
        currentDates.push(item[size] ? item[size] : 0);
      });

      var lineColor = this.getColor(size);

      var obj = {
        label:size,
        backgroundColor: lineColor,
        borderColor  : lineColor,
        data: currentDates,
        pointRadius: 3
      };

      this.dataset.push(obj);
    });
  }


  buildChart(){
    //Hide all grid lines
    //Chart.defaults.scale.gridLines.display = false;

    if (stockChartObject){
      stockChartObject.destroy();
    }

    var ctx = document.getElementById(this.chartId).getContext('2d');
    stockChartObject = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.allDates,
        datasets: this.dataset
      },
      options: {
        layout: {
          padding: {
            left: 25,
            right: 25,
            top: 5,
            bottom: 30
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              display: false
            },
            gridLines: {
              drawBorder: true,
              color: "rgba(0, 0, 0, 0)" // Hide vertical gridLines
            }
          }],
          yAxes: [{
            ticks: {
              //min: 1,
              display: true,
              stepSize: Math.max(Math.trunc(this.maxValue/3),1)
            },
            gridLines: {
              drawBorder: true
            }
          }]
        },
        legend:{
          //  display:false
          labels: {
            fontSize: 14,
            boxWidth: 12,
            padding: 15,
            fontStyle: 'bold',
            usePointStyle: true
          }
        },
        title:{
          display:false
        },
        tooltips:{
          cornerRadius:3,
          displayColors:false,
          backgroundColor: '#00796b'
        },
        elements: {
          /*point:{
          radius: 0
        },*/
        line: {
          fill: false,
          tension: 0.6,
        },
      }
    }
  });
}

getColor(size){
  var colors = ['#399e92', '#4dc2da', '#5cb557', '#4a5cbd', '#f47d00', '#f36422', '#826051'];

  this.lastColorIndex= this.lastColorIndex == undefined ? 0 : this.lastColorIndex +1;

  if (this.lastColorIndex >= colors.length){
    return Util.strToColor(size + this.lastColorIndex);
  }

  return colors[this.lastColorIndex];
}

}

var stockChartObject;
