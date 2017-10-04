var express = require('express'),
    fs = require('fs'),
    app     = express(),
    router = express.Router();
    bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var AWS = require('aws-sdk'),
    router = require('express').Router();

AWS.config.loadFromPath('../config.json');

var dynamodb = new AWS.DynamoDB();

var jsonData = {};




app.get('/person/:personid', function(req, res) {
  console.log(req.params.personid);
  var personid = req.params.personid;
  var params = {
   ExpressionAttributeValues: {
    ":v1": {
      S: personid
     }
   },
   KeyConditionExpression: "ID = :v1",
   TableName: "Person"
  };

  dynamodb.query(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    // else     console.log(JSON.stringify(data));           // successful response
    // else   res.json(data);
        else   {
          app.set('json spaces', 40);
          jsonData = JSON.stringify(data, null, 40);
          // res.json(data);
          res.render('index.html', {
            json: jsonData
          })
        }

  });
});



//
// app.get('*', function(req,res) {
//   res.sendFile(__dirname + '/index.html');
// });

// app.get('/person/lastname/:lastname', function(req, res) {
//   console.log(req.params.lastname);
//   var lastname = req.params.lastname;
//   var params = {
//    ExpressionAttributeValues: {
//     ":v1": {
//       S: lastname
//      }
//    },
//    KeyConditionExpression: "LastName = :v1",
//    TableName: "Person"
//   };
//
//   dynamodb.query(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     // else     console.log(JSON.stringify(data));           // successful response
//     else   res.json(data);
//   });
// });

// app.use('/:personid', router);

app.listen(port);
console.log('Port listening on ' + port);

module.exports = app;
