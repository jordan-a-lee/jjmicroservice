var AWS = require('aws-sdk'),
    express = require('express'),
    app = express(),
    router = require('express').Router();

AWS.config.loadFromPath('../config.json');

var dynamodb = new AWS.DynamoDB();

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
          res.json(data); }

  });
});
