(function() {

  var config = {
    baseURL:"http://data.agrisense.org/api/v1/",
    authenticateURL: "http://data.agrisense.org/api/v1/user",
    mediaURL:"http://data.agrisense.org/media/agrisense/attachments/",
    token:"yourToken",
    chartFields:{
      chart0:"management",
      chart1:"agricultur",
      chart2:"select_med",
      chart3:"crop_condi",
      chart4:"food_pri_1",
      chart5:"manageme_1",
      chart6:"farmer_ass",
      chart7:"food_price",
      chart8:"food_pri_2",
      chart9:"food_pri_3",

    }
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = config;
  }else{
    window.appConfig = config;
  }

})();
