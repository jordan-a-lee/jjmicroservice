const _ = require('underscore');
const sprintf = require('sprintf-js').sprintf;
/***
 * DAO class which handles all data access related operations.
 * Expects a DynamoDB client object and a table name to be injected.
 ***/
module.exports = class ApiHelper {

  constructor(dynamoDocClient, tableName, indexName) {
    this._tableName = tableName;
    this._dynamoDocClient = dynamoDocClient;
    this._indexName = indexName;
  }

  /**
  * Persists object into DB
  * @item - Record to be persisted into DB
  * @callback - Callback function to which either error or data is passed back.
  * Argument to callback expected of the form(error, data)
  **/
  persist(key, item, callback) {

    var params = {
      TableName: this._tableName,
      Key: key
    };

    this.fetch(key, (err, data) => {
      if (err) {
        console.error("Dynamo failed to persist data " + typeof err);
        return callback(err, null);
      }

      if (_.isEmpty(data)) {
        params = _.omit(params, 'Key');
        params.Item = item;

        this._dynamoDocClient.put(params, (err, persistedData) => {
          if (err) {
            console.error("Dynamo failed to persist data " + err);
            return callback(err, null);
          } else {
            console.log("Successfully persited record into dynamo: " + JSON.stringify(item));
            callback(null, item);
          }
        });
      } else {

        var areEqual = true;
        for(var prop in item){
          if(data[prop] != null && !(data[prop] === item[prop])){
            areEqual = false;
            break;
          }
        }

        if(areEqual){
          console.log('Same object already exists in DB.');
          return callback(null, item);
        }else{
        var err = "Item Already Exists";
        return callback(err, null);
        }
      }
    });
  }

  /**
     * Fetches object from DB
     * @key - Key on which record needs to be fetched from DB
     * @callback - Callback function to which either error or data is passed back.
     * Argument to callback expected of the form(error, data)
     **/
  fetch(key, callback) {

    var params = {
      TableName: this._tableName
    };

    if (_.isObject(key)) {
      // Get by index.
      var existingValueKeys = _.keys(key);
      params.KeyConditionExpression = existingValueKeys[0] + '= :id'
      params.ExpressionAttributeValues = {
        ':id': key[existingValueKeys],
        ':value': false
      }
      params.FilterExpression = "deleted = :value";
      params.IndexName = this._indexName

      console.log("Sending for fetch:" + JSON.stringify(params));

      this._dynamoDocClient.query(params, (err, data) => {
        if (err) {
          console.error("Dynamo failed to fetch data " + err);
          return callback(err, null);
        } else {
          console.log("[key is obj] Successfully fetched record[s] from dynamo: " + JSON.stringify(data));
          var item = data.Items;

          // TODO: Decide whether we want to throw error when a query returns nothing.
          // // This is necessary because we dont have a GSI on deleted field.
          // // So we have to manually filter out the result
          // if (!item || (item && item.deleted == true)) {
          //   item = {}
          //   /* Raising Object Not found exception here */
          //   return callback(new Error("Object not found"), null);
          // }

          callback(null, item);
        }
      });
    } else if (key) {
      // Get by id.
      params.Key = { ID: key };

      console.error("Sending for fetch:" + JSON.stringify(params));
      this._dynamoDocClient.get(params, (err, data) => {
        if (err) {
          console.error("Dynamo failed to fetch data " + err);
          return callback(err, null);
        } else {
          console.log("[key only] Successfully fetched record from dynamo: " + JSON.stringify(data));
          var item = data.Item;
          if (item && item.deleted == true) {
            console.log("[key only] But the item is deleted");
            callback(null, null);
          } else {
            callback(null, item);
          }

          // TODO: Decide whether we want to throw error when a query returns nothing.
          // // This is necessary because we dont have a GSI on deleted field.
          // // So we have to manually filter out the result
          // if (!item || (item && item.deleted == true)) {
          //   item = {}
          //   /* Raising Object Not found exception here */
          //   return callback(new Error('Object not found'));
          // }
        }
      });
    } else {
      // Get all.
      params.FilterExpression = "deleted = :value";
      params.ExpressionAttributeValues = { ":value": false };
      console.error("Sending for fetch:" + JSON.stringify(params));

      this._dynamoDocClient.scan(params, (err, data) => {

        if (err) {
          console.error("Dynamo failed to fetch data " + err);
          return callback(err, null);
        } else {
          console.log("[no key specified] Successfully fetched record[s] from dynamo: " + JSON.stringify(data));
          callback(null, data.Items);
        }
      });
    }
  }

  /**
     * Deletes object from DB
     * @key - Key on which record needs to be deleted from DB
     * @callback - Callback function to which either error or data is passed back.
     * Argument to callback expected of the form(error, data)
     **/
  delete(key, callback) {

    var params = {
      TableName: this._tableName,
      Key: { ID: key }
    };

    this._dynamoDocClient.get(params, (err, data) => {

      if (err) {
        console.error("Dynamo failed to fetch data " + err);
        return callback(err, null);
      } else {

        // TODO: Decide whether we need this. This is directly hurting idem potency of delete API.
        // Making it return deleted object for now.
        // Checking if there is such an object that exists
        if (_.isEmpty(data) || data.Item.deleted == true) {
          /*--This means that such an object doesn't exist (or has already been deleted)*/
          //err = "Object does not exist."
          if (!_.isEmpty(data)) {
            return callback(null, data.Item);
          } else {
            return callback(null, null);
          }
        }

        console.log("Successfully fetched record from dynamo: " + JSON.stringify(data));

        var item = data.Item;
        item.deleted = true;
        params.Item = item;


        this._dynamoDocClient.put(params, (err, data) => {

          if (err) {
            console.error("Dynamo failed to persist data " + err);
            return callback(err, null);
          } else {
            console.log("Successfully deleted record from dynamo: " + JSON.stringify(item));
            callback(null, item);
          }
        });
      }
    });
  }

  /**
   * Updates object from DB
   * @key - Key on which record needs to be updated in DB
   * @newItem - Information to be updated in DB - contains list of key-value pairs that need to be updated - has to include PrimaryID
   * @callback - Callback function to which either error or data is passed back.
   * Argument to callback expected of the form(error, data)
   **/
  update(key, newItem, callback) {
    // Get object from Dynamo to compare first.
    this.fetch(key, (err, currentItem) => {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        if (currentItem && _.isEmpty(currentItem)) {
          var errorMessage = "Unable to update a non-existing item.";
          console.error(errorMessage);
          return callback(new MethodNotAllowedException(errorMessage));
        } else {
          var i = 0;
          var updateRequired = false;
          var expressionAttributeValues = {};
          var updateAssignments = [];

          _.each(_.keys(newItem), (key) => {
            if (currentItem[key] !== newItem[key]) {
              var attributeId = ":val" + i;
              updateAssignments.push(sprintf("%s = %s", key, attributeId));
              expressionAttributeValues[attributeId] = newItem[key];
              updateRequired = true;
              i++;
            }
          });

          var updateExpression = sprintf("SET %s", updateAssignments.join(', '));

          if (!updateRequired) {
            console.log("No new value given to any field. Nothing to update.");
            callback(null, currentItem);
            return;
          }

          console.log(sprintf("Using update expression: %s.", updateExpression));
          var params = {
            TableName: this._tableName,
            Key: { ID: key },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
          };

          this._dynamoDocClient.update(params, (err, data) => {
            if (err) {
              console.error("Dynamo failed to Update data " + err);
              return callback(new DataObjectErrorException(err), null);
            } else {
              console.log("Successfully updated record from dynamo: " + JSON.stringify(data));
              callback(null, data.Attributes);
            }
          });
        }
      }
    });
  }
};

