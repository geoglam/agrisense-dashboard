/*eslint-disable*/
/* global window, document, location */
(function(win, doc) {
  'use strict';
   var version = '0.0.1',
      pathname = location.pathname.replace(/\/[^/]+$/, ''),
      URL = pathname + (pathname.substr(-1) !== '/' ? '/' : ''),
      dojoConfig = {
        parseOnLoad: false,
        isDebug: false,
        async: true,
        cacheBust: 'v=' + version,
        packages: [
          {name: 'js', location: URL + 'js'},
        ],
        aliases: [
        ],
        deps: [
          'dojo/domReady!'
        ],
        callback: function() { require(['js/main']);
        }
      }, // End dojoConfig
      src = [
        'http://js.arcgis.com/3.13/'
      ],
      css = [{
        src: 'http://js.arcgis.com/3.13/esri/css/esri.css',
        cdn: true
      }, {
        src: 'http://js.arcgis.com/3.13/dijit/themes/claro/claro.css',
        cdn: true
      }];

  var loadScript = function(src, async) {
    var s = doc.createElement('script'),
    h = doc.getElementsByTagName('head')[0];
    s.src = src;
    s.async = async;
    h.appendChild(s);
  };

  var loadStyle = function(src, isCDN) {
    var l = doc.createElement('link'),
    path = isCDN ? src : src + '?v=' + version,
    h = doc.getElementsByTagName('head')[0];
    l.rel = 'stylesheet';
    l.type = 'text/css';
    l.href = path;
    l.media = 'only x';
    h.appendChild(l);
    setTimeout(function() {
      l.media = 'all';
    });
  };

  var loadDependencies = function() {
    win.dojoConfig = dojoConfig;
    for (var i = 0, length = css.length; i < length; i++) {
      loadStyle(css[i].src, css[i].cdn);
    }
    for (var j = 0, size = src.length; j < size; j++) {
      loadScript(src[j], false);
    }
  };

  win.requestAnimationFrame = (function() {
    return win.requestAnimationFrame ||
    win.webkitRequestAnimationFrame ||
    win.mozRequestAnimationFrame ||
    win.oRequestAnimationFrame ||
    win.msRequestAnimationFrame;
  })();

  if (win.requestAnimationFrame) {
    win.requestAnimationFrame(function () {
      loadDependencies();
    });
  } else if (doc.readyState === 'loaded') {
    loadDependencies();
  } else {
    win.onload = function () {
      loadDependencies();
    }
  }
})(window, document);