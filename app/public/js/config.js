(function() {

  var config = {
    baseURL:"http://data.agrisense.org/api/v1/",
    authenticateURL: "http://data.agrisense.org/api/v1/user",
    mediaURL:"http://data.agrisense.org/media/agrisense/attachments/",
    token:"yourToken",
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = config;
  }else{
    window.appConfig = config;
  }

})();
