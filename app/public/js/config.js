(function() {

  var config = {
    baseURL:"http://52.23.108.108/api/v1/",
    authenticateURL: "http://52.23.108.108/api/v1/user",
    mediaURL:"http://52.23.108.108/media/agrisense/attachments/",
    token:"yourToken",
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = config;
  }else{
    window.appConfig = config;
  }

})();
