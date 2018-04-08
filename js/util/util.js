module.exports = {


  getSubtitles: function(charts) {

    var subtitles = charts.filter((chart) => {
      return chart.getItems().filter((item) => {
        return item.getBars().length > 0;
      }).length > 0;
    });


    return subtitles.length > 0 ? subtitles[0].getItems()[0].getBars() : [];
  }


};