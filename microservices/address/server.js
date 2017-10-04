const Address = require('./models/address.js');
const ApiHelper = require('./models/apihelper.js');
const tableName = "Address";
const indexName = "None";
var express = require('express'),
    fs = require('fs'),
    app     = express(),
    router = express.Router();
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;

var AWS = require('aws-sdk'),
    router = require('express').Router();

AWS.config.loadFromPath('../config.json');

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();
const apiHelper = new ApiHelper(docClient, tableName, indexName);

var jsonData = {};
var params = {
    TableName: "Address",
    Key:{
      "ID": "1"
    }
};

// turn into JSON
function dbToResponseObject(address) {

  // TODO: Form URL for addressId field.
  if(!address){
    return null;
  } else if (Array.isArray(address)) {
    
    // Handle if the given list is an array.
    var res = [];
    address.forEach(function(element){
      res.push(dbToResponseObject(element));
    });

    return res;
  } else {
    console.log(address);
    return {
      "ID": address.ID,
      "City": address.City,
      "Country": address.Country,
      "PostalCode": address.PostalCode,
      "Street1": address.Street1,
      "Street2": address.Street2,
      "StreetNo": address.StreetNo
    }
  }
}

function toDynamoDbObject(address) {
  if(!address){
    return null;
  }
      console.log("hereherhehr");

  console.log(address);
  return {
    "ID": address.Item.ID,
    "City": address.Item.City,
    "Country": address.Item.Country,
    "PostalCode": address.Item.PostalCode,
    "Street1": address.Item.Street1,
    "Street2": address.Item.Street2,
    "StreetNo": address.Item.StreetNo
  }
}


router.route('/address')
// post on resources
    // .post(function(req, res) {
    //         console.log(req);

    //   var address = new Address(req.body.address);
    //   if (!address.validate()) {

    //     // Bad request.
    //     res.status(code = 400).json({ "error": "invalid address object.", code: 400 });
    //     return;
    //   }
      
    //   console.log("inrouter");
    //   console.log(address);
    //   // var key = address.id;
    //   var key = "1";
    //   var obj = toDynamoDbObject(address);

    //   params.Item = obj;

    //   // Write to DB.
    //   docClient.put(params, function(err, data) {
    //     if (err) {
    //       console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    //       res.status(500).json({ "error": err });
    //     } else {
    //       console.log("Added item:", JSON.stringify(data, null, 2));
    //       // Return response.
    //       var responseObj = dbToResponseObject(data);
    //       res.status(200).json(responseObj);
    //     }
    //   });
    // })

    // // get on resources
    // .get(function(req, res) {
    //   docClient.get(params, function(err, data) {
    //     if (err) {
    //       console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    //       res.status(500).json({ "error": "cannot retrieve items", code: 310 });

    //     } else {
    //       console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    //       // Convert to response and return.
    //       var responseObj = dbToResponseObject(data);
    //       res.status(200).json(responseObj);
    //     }
    //   });
    // });
  .post(function (req, res) {
    // Validate.
    if (!req.body.address) {
      // Bad request.
      res.status(code = 400).json({ "error": "missing address object.", code: 400 });
      return;
    }

    var address = new Address(req.body.person);
    if (!person.validate()) {

      // Bad request.
      res.status(code = 400).json({ "error": "invalid address object.", code: 400 });
      return;
    }

    // Write to DB.
    var key = address.id;
    var obj = toDynamoDbObject(address);
      
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
    // Fetch data from DB.
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
    
router.route('/address/:addressid')
    .put(function (req, res) {
      // Get addressid from URL.
      var addressid = req.params.addressid;

      // Validate
      if (!addressid || !req.body.address) {
        res.status(400).json({ "error": "addressid missing", code: 400 });
        return;
      }

      var address = new Address(req.body.address);
      if (!person.validate()) {

        // Bad request.
        res.status(code = 400).json({ "error": "invalid address object.", code: 400 });
        return;
      }

      // Update database.
      var key = addressid;
      var obj = toDynamoDbObject(address);
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
      // Get addressid from URL.
      var addressid = req.params.addressid;
      if (!addressid) {
        res.status(400).json({ "error": "addressid missing", code: 400 });
        return;
      }

      // Get data from DB.
      apiHelper.fetch(addressid, function (err, data) {

        // Error while getting data from database.
        if (err) {
          req.app.locals.log.error(err);
          res.status(500).json({ "error": err });
          return;
        }

        // If there is no data then return 404 not found.
        if(!data){
          res.status(404).json({"error": "Address with ID: " + addressid + " missing."});
          return;
        }

        // Convert to response and return.
        responseObj = dbToResponseObject(data);
        res.status(200).json(responseObj);
      });
    })


    .delete(function (req, res) {
      // Get personid from URL.
      var addressid = req.params.addressid;
      if (!addressid) {
        res.status(400).json({ "error": "addressid missing", code: 400 });
        return;
      }

      // Delete from database.
      apiHelper.delete(addressid, function (err, data) {
        if (err) {
          req.app.locals.log.error(err);
          res.status(code = 500).json({ "error": err.toString() });
          return;
        }

        // Return success.
        console.log('Object with key' + addressid + ' deleted.');

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




app.get('/address/:addressid', function(req, res) {
  console.log(req.params.addressid);
  var personid = req.params.addressid;
  var params = {
   ExpressionAttributeValues: {
    ":v1": {
      S: personid
     }
   },
   KeyConditionExpression: "ID = :v1",
   TableName: "Address"
  };

  dynamodb.query(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    // else     console.log(JSON.stringify(data));           // successful response
    // else   res.json(data);
        else   {
          app.set('json spaces', 40);
          jsonData = JSON.stringify(data, null, 40);
          // res.json(data);
          res.json(data);
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
