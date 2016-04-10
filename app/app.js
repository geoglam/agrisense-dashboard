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

// Set Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
// Set Configuration
console.log(path.join(__dirname,'css'));
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
  url: 'http://52.23.108.108/api/v1/user',
  auth: {
    user: username,
    password: password,
    sendImmediately: false
    }
  }
  request(options, function (err, res, body) {
    console.log(body);
    if (err) {
      done(null)
    }
    if (res.statusCode ==200){
      done({statusCode:res.statusCode,body:body})
    }else{
      done(null)
    }
  });
}

function verifyCredentials(username, password, done) {
    makeBasicAuthRequest(username,password,function(response){
      if (response !=null){
        var userdata = JSON.parse(response.body);
        delete userdata['api_token'];
        userdata.id = userdata.username;
        done(null, userdata);
      }else{
        done(null, null);
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
  // console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // Query database or cache here!
    // console.log('deserializeUser');
    done(null, user);
});



app.get('/dashboard',ensureAuthenticated,function(req, res){
  res.render('dashboard',{
          isAuthenticated: req.isAuthenticated(),
          user: req.user
    });
});

// app.get('/login', function(req, res) {
//     res.render('login');
// });

app.get('/', function(req, res) {
    if (req.isAuthenticated()){
      res.redirect('dashboard');
    }else{
        res.render('login');
    }
});

app.post('/', passport.authenticate('local'), function(req, res) {
    res.redirect('dashboard');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
