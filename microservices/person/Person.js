var aws = require('aws-sdk'),
    router = require('express').Router(),
    config = require('../config.js');

var dynamodb = new AWS.DynamoDB();
var params = {
 ExpressionAttributeValues: {
  ":v1": {
    ID: "1"
   }
 }, 
 KeyConditionExpression: "ID = :v1",
 TableName: "Person"
};
dynamodb.query(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
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
