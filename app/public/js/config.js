(function() {

  var config = {
    baseURL:"YOUR_BASE_URL",
    authenticateURL: "YOUR_authenticateURL",
    mediaURL:"YOUR_mediaURL",
    token:"YOUR_yourToken",
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = config;
  }else{
    window.appConfig = config;
  }

})();
