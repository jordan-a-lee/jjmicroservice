const Person = require('./models/person.js');
const ApiHelper = require('./models/apihelper.js');
const tableName = "Person";
const indexName = "None";
var express = require('express'),
    fs = require('fs'),
    app     = express(),
    router = express.Router();
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var AWS = require('aws-sdk'),
    router = require('express').Router();

AWS.config.loadFromPath('../config.json');

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
const apiHelper = new ApiHelper(docClient, tableName, indexName);

var jsonData = {};
var params = {
    TableName: "Person",
    Key:{
      "ID": "1"
    }
};
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// turn into JSON
function dbToResponseObject(person) {

  // TODO: Form URL for personId field.
  if(!person){
    return null;
  } else if (Array.isArray(person)) {

    // Handle if the given list is an array.
    var res = [];
    person.forEach(function(element){
      res.push(dbToResponseObject(element));
    });

    return res;
  } else {
    console.log(person);
    return {
      "ID": person.ID,
      "Email": person.Email,
      "FirstName": person.FirstName,
      "HomePhone": person.HomePhone,
      "LastName": person.LastName,
      "Notes": person.Notes,
      "Photo": person.Photo,
      "PostalCode": person.PostalCode,
      "Title": person.Title,
      "TitleOfCourtesy": person.TitleOfCourtesy
    }
  }
}

function toDynamoDbObject(person) {
  if(!person){
    return null;
  }
      console.log("hereherhehr");

  console.log(person);
  return {
    "ID": person.ID,
    "Email": person.Email,
    "FirstName": person.FirstName,
    "HomePhone": person.HomePhone,
    "LastName": person.LastName,
    "Notes": person.Notes,
    "Photo": person.Photo,
    "PostalCode": person.PostalCode,
    "Title": person.Title,
    "TitleOfCourtesy": person.TitleOfCourtesy
  }
}


router.route('/person')
  .post(function (req, res) {
    // Validate.
    if (!req.body.person) {
      // Bad request.
      res.status(code = 400).json({ "error": "missing person object.", code: 400 });
      return;
    }

    var person = new Person(req.body.person);
    if (!person.validate()) {

      // Bad request.
      res.status(code = 400).json({ "error": "invalid person object.", code: 400 });
      return;
    }

    // Write to DB.
    var key = person.id;
    var obj = toDynamoDbObject(person);

    apiHelper.persist(key, obj, function (err, data) {

      // Oh no! DB Write failed.
      if (err) {
        if(err == "Item Already Exists"){
          res.status(409).json({ "error": err });
        }else{
          res.status(500).json({ "error": err });
        }

        req.app.locals.log.error(err);
        return;
      }

      // Return response.
      var responseObj = dbToResponseObject(data);
      res.status(200).json(responseObj);
    });
  })
  .get(function (req, res) {
    // fetch all
    apiHelper.fetch(null, function (err, data) {

      // If the fetch failed.
      if (err) {
        req.app.locals.log.error(err);
        res.status(500).json({ "error": "cannot retrieve items", code: 310 });
      }

      // Return the response.
      responseObj = dbToResponseObject(data);
      res.status(200).json(data);
    });
  });

router.route('/person/:personid')
    .put(function (req, res) {
      // Get personid from URL.
      var personid = req.params.personid;

      // Validate
      if (!personid || !req.body.person) {
        res.status(400).json({ "error": "personid missing", code: 400 });
        return;
      }

      var person = new Person(req.body.person);
      if (!person.validate()) {

        // Bad request.
        res.status(code = 400).json({ "error": "invalid person object.", code: 400 });
        return;
      }

      // Update database.
      var key = personid;
      var obj = toDynamoDbObject(person);
      apiHelper.update(key, obj, function (err, data) {

        // Handle update failure.
        if (err) {
          req.app.locals.log.error(err);
          res.status(code = 500).json({ "error": err.toString() });
          return;
        }

        var responseObj = dbToResponseObject(data);
        res.status(200).json(responseObj);
      });
    })

    .get(function (req, res) {
      // Get personid from URL.
      var personid = req.params.personid;
      if (!personid) {
        res.status(400).json({ "error": "personid missing", code: 400 });
        return;
      }

      // Get data from DB.
      apiHelper.fetch(personid, function (err, data) {

        // Error while getting data from database.
        if (err) {
          req.app.locals.log.error(err);
          res.status(500).json({ "error": err });
          return;
        }

        // If there is no data then return 404 not found.
        if(!data){
          res.status(404).json({"error": "Person with ID: " + personid + " missing."});
          return;
        }

        // Convert to response and return.
        responseObj = dbToResponseObject(data);
        res.status(200).json(responseObj);
      });
    })


    .delete(function (req, res) {
      // Get personid from URL.
      var personid = req.params.personid;
      if (!personid) {
        res.status(400).json({ "error": "personid missing", code: 400 });
        return;
      }

      // Delete from database.
      apiHelper.delete(personid, function (err, data) {
        if (err) {
          req.app.locals.log.error(err);
          res.status(code = 500).json({ "error": err.toString() });
          return;
        }

        // Return success.
        console.log('Object with key' + personid + ' deleted.');

        // Convert to response and return.
        responseObj = dbToResponseObject(data);
        res.status(200).json(responseObj);

        // res.status(204).json();
        // return;
      });
    });


router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});
app.use('/api', router);



//
// app.get('/person/:personid', function(req, res) {
//   console.log(req.params.personid);
//   var personid = req.params.personid;
//   var params = {
//    ExpressionAttributeValues: {
//     ":v1": {
//       S: personid
//      }
//    },
//    KeyConditionExpression: "ID = :v1",
//    TableName: "Person"
//   };
//
//   dynamodb.query(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     // else     console.log(JSON.stringify(data));           // successful response
//     // else   res.json(data);
//         else   {
//           app.set('json spaces', 40);
//           jsonData = JSON.stringify(data, null, 40);
//           // res.json(data);
//           res.json(data);
//         }
//
//   });
// });

app.listen(port);
console.log('Port listening on ' + port);

module.exports = app;
