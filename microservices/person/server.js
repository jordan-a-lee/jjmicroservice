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

var params = {
 ExpressionAttributeValues: {
  ":v1": {
    S: "1"
   }
 },
 KeyConditionExpression: "ID = :v1",
 TableName: "Person"
};
dynamodb.query(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(JSON.stringify(data));           // successful response
  /*
  data = {
   ConsumedCapacity: {
   },
   Count: 2,
   Items: [
      {
     "SongTitle": {
       S: "Call Me Today"
      }
    }
   ],
   ScannedCount: 2
  }
  */
});


app.use('/api', router);

app.listen(port);
console.log('Port listening on ' + port);

module.exports = app;
