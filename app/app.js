var express = require('express');
var app = express();
var request = require('request');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var fetch = require('node-fetch');
var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');
var config = require('./public/js/config');


// Set Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
// Set Configuration
// console.log(path.join(__dirname,'css'));
app.use(express.static(path.join(__dirname,'/public')));
app.use(bodyParser());
app.use(cookieParser());
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal.Strategy(verifyCredentials));
// passport.use(new passportHttp.BasicStrategy(verifyCredentials));


function makeBasicAuthRequest(username,password,done){
  var options = {

  url: config.authenticateURL,
  auth: {
    user: username,
    password: password,
    sendImmediately: false
    }
  }
  request(options, function (err, res, body) {
    // console.log(body);
    if (err) {
      return done(null,false)
    }
    if (res.statusCode == 401){
      return done(null,false)
    }
    if (res.statusCode == 200){
      return done({statusCode:res.statusCode,body:body})
    }else{
      return done(null,null)
    }
  });
}

function verifyCredentials(username, password, done) {
    return makeBasicAuthRequest(username,password,function(response){
      if (response !=null){
        if (response.statusCode == 401){
          return done(null, null);
        }else{
          var userdata = JSON.parse(response.body);
          delete userdata['api_token'];
          userdata.id = userdata.username;
          return done(null, userdata);
        }
      }else{
        return done(null, null);
      }
    });
}
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');

    }
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.get('/dashboard',ensureAuthenticated,function(req, res){
  res.render('dashboard',{
          isAuthenticated: req.isAuthenticated(),
          user: req.user
    });
});

app.get('/', function(req, res) {
    if (req.isAuthenticated()){
        res.redirect('dashboard');
    }else{
        res.render('login');
    }
});

app.post('/', passport.authenticate('local',{ failureRedirect: '/', failureFlash: true }), function(req, res,next) {
    if(req.statusCode != null){
      res.redirect('dashboard');
    }else{
       res.redirect('/');
    }
    // res.redirect('dashboard');
});
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
app.get('*', function(req, res){
  res.render('404');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
