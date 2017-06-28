/*eslint-env node*/
// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var Cloudant = require('cloudant');
var fs = require('fs');
var cons = require('consolidate');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname , 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.engine('html', cons.swig);
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//To Store URL of Cloudant VCAP Services as found under environment variables on from App Overview page
var cloudant_url = 'https://a3b44601-c194-47ba-b9cd-1d8cb594b690-bluemix:d78a61c5df28e8d314e1af0ee998d7768e7b777aa4964fc369a1570299477fde@a3b44601-c194-47ba-b9cd-1d8cb594b690-bluemix.cloudant.com';
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// Check if services are bound to your project
if (process.env.VCAP_SERVICES) {
    services = JSON.parse(process.env.VCAP_SERVICES);
    if (services.cloudantNoSQLDB) //Check if cloudantNoSQLDB service is bound to your project
    {
        cloudant_url = services.cloudantNoSQLDB[0].credentials.url; //Get URL and other paramters
        console.log("Name = " + services.cloudantNoSQLDB[0].name);
        console.log("URL = " + services.cloudantNoSQLDB[0].credentials.url);
        console.log("username = " + services.cloudantNoSQLDB[0].credentials.username);
        console.log("password = " + services.cloudantNoSQLDB[0].credentials.password);
    }
}

//Connect using cloudant npm and URL obtained from previous step
var cloudant = Cloudant({
    url: cloudant_url
});
//Edit this variable value to change name of database.
var dbname = 'players_db';
var db;

//Create database
cloudant.db.create(dbname, function(err, data) {
    db = cloudant.db.use(dbname);
    if (err) //If database already exists
        console.log("Database exists."); //NOTE: A Database can be created through the GUI interface as well
    else {
        console.log("Created database.");
        db.insert({
                _id: "_design/players_db",
                views: {
                    "players_db": {
                        "map": "function (doc) {\n  emit(doc._id, [doc._rev, doc.userid]);\n}"
                    }
                }
            },
            function(err, data) {
                if (err)
                    console.log("View already exists. Error: ", err); //NOTE: A View can be created through the GUI interface as well
                else
                    console.log("players_db view has been created");
            });
    }
});

app.post('/submitplayer', function(req, res) {
    console.log(req.body);
    db.find({
        selector: {
            userid: req.body.playerName
        }
    }, function(er, result) {
        if (er) {
            throw er;
        }
        eventNames = result.docs;
        console.log(eventNames);

        if (result.docs.length > 0) {
            console.log('Found %d documents with name ' + eventNames[0].userid, result.docs.length);
            score1 = eventNames[0].score1;
            score2 = eventNames[0].score2;
            score3 = eventNames[0].score3;
            //updatedPlayer = eventNames[0].scores;
            //console.log(updatedPlayer);
            score1.push(req.body.game1);
            score2.push(req.body.game2);
            score3.push(req.body.game3);


            var user = {
                'userid': eventNames[0].userid,
                '_id': eventNames[0]._id,
                '_rev': eventNames[0]._rev,
                'score1': score1,
                'score2': score2,
                'score3': score3
            };

            db.insert(user, function(err, body) {});
        } else {
            console.log('Unable to find '+ eventNames[0].userid);
            db.insert({
                    'userid': req.body.playerName,
                    'score1': [req.body.game1],
                    'score2': [req.body.game2],
                    'score3': [req.body.game3]
                },
                function(err, data) {
                    if (err)
                        console.log("Player already exists. Error: ", err); //NOTE: A View can be created through the GUI interface as well
                    else
                        console.log("Player has been created");
                });
        }
        //console.log("res: " + res);
        //res.send('Player Saved');
        //console.log("req: " + req);

    });
    res.send('player saved');
});

app.post('/getplayer', function(req, res) {
    var updatedPlayer = "";
    db.find({
        selector: {
            userid: req.body.userid
        }
    }, function(er, result) {
        if (er) {
            throw er;
        }
        eventNames = result.docs;
        console.log('Found %d documents with name ' + req.query.msg, result.docs.length);

        if (result.docs.length > 0) {
            updatedPlayer = eventNames[0].player;
        }
        res.json({
            player: updatedPlayer
        });
    });

})

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.get('/', function(req, res, next) {
  res.render('index.html', { title: '' });
});

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//have to make a post request to send data into Cloudant
/*app.post('/submit_player', function(req, res){
    console.log('POST /submit_player');
    console.log("req: " + req.body);
    console.log("res: " + res)
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end('thanks');
});*/

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