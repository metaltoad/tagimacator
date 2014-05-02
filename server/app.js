var express = require('express'),
    mongo = require('mongodb'),
    ObjectID = require('mongodb').ObjectID,
    Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    Connection = require('mongodb').Connection,
    dbURL = 'mongodb://127.0.0.1/angular-data';

var host = 'localhost';
var port = Connection.DEFAULT_PORT;
var db = new Db('tagimacator', new Server(host, port, {}), {native_parser:false, w:1});
var BSON = mongo.BSONPure;

var app = express()

// all access control origin for development
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  if ('OPTIONS' == req.method) {
       res.send(200);
   } else {
       next();
   }
});

app.get('/users', function(req, res, next) {
  var collection  = db.collection('users');

  collection.count(function(err, count) {
    if(err) res.send(400, 'ERROR '+ err);

    if(count == 0) {
      insertUsers(function(data) {
        console.log(data);
        res.send(200, data);
      });
    } else {
      console.log('users found');
      collection.find({}).toArray(function(err, items) {
        if(err) res.send(400, err);

        res.send(200, items);
      });
    }
  })
});

// Open the DB
db.open(function(err, db) {
  if(err) {
    console.log('Could not connect to DB, Aborting: ', err);
  } else {
    app.listen(3000,  function() {
      console.log('server started on port 3000');
    })
  }
});

var numUsers = 5000;

var users = [];

var names = ['Bob', 'Sarah', 'James', 'Mark', 'Elizabeth', 'Ted', 'Jenny', 'Hank', 'Barbara', 'Susan', 'George', 'Fred', 'Margaret'];

var user = {
  name: {min:0, max: names.length-1},
  age: {min: 0, max: 110}
};

function insertUsers(fn) {
  var collection = db.collection('users');

  for(var i=0; i<numUsers; i++) {
    var tmp = {};

    tmp["age"] = Math.floor(Math.random() * (user["age"].max - user["age"].min));
    tmp["name"] = names[Math.floor(Math.random() * (user["name"].max - user["name"].min))];

    collection.insert(tmp, {w:1, safe: true}, function(err, object) {
      users.push(object)

      if(users.length === numUsers) {
        fn(users);
      }
    });
  }
}