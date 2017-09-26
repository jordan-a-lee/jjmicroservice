var express = require('express'),
    app     = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// app.use('/person', require('Person.js'));

var AWS = require('aws-sdk'),
    router = require('express').Router();


AWS.config.loadFromPath('../config.json');

var dynamodb = new AWS.DynamoDB();


// dynamodb.query(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(JSON.stringify(data));           // successful response
//   /*
//   data = {
//    ConsumedCapacity: {
//    },
//    Count: 2,
//    Items: [
//       {
//      "SongTitle": {
//        S: "Call Me Today"
//       }
//     }
//    ],
//    ScannedCount: 2
//   }
//   */
// });

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
    else   res.json(data);
  });
});

app.get('/person/lastname/:lastname', function(req, res) {
  console.log(req.params.lastname);
  var lastname = req.params.lastname;
  var params = {
   ExpressionAttributeValues: {
    ":v1": {
      S: lastname
     }
   },
   KeyConditionExpression: "LastName = :v1",
   TableName: "Person"
  };

  dynamodb.query(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    // else     console.log(JSON.stringify(data));           // successful response
    else   res.json(data);
  });
});

// app.use('/:personid', router);

app.listen(port);
console.log('Port listening on ' + port);

module.exports = app;
