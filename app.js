/*eslint-env node*/
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var cfenv = require('cfenv');
var Cloudant = require('cloudant');
var fs = require('fs');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
//var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname , 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.get('/', function(req, res, next) {
	res.render('index.html', { title: '' });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT || 3001);

console.log('Listening on port: ' + (process.env.PORT || 3001));

// get the app environment from Cloud Foundry
//var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
/*app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
*/

module.exports = app;