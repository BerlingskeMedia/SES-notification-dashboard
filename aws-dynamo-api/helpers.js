var config = require('../config');
var factory_operators = require('./operators');

function dynamoParseExpressions(filters, indexName) {
    var returnObj = {
        KeyConditionExpression: "",
        FilterExpression: "",
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {}
    };

    var indexDefinitions = config.indices[indexName]['keyFields'];
    var keyMapping = config.dynamoDefinitions;

    var parsedFilters = {
        KeyConditionExpression: [],
        FilterExpression: []
    };

    for (var filter in filters) {
        if (filters.hasOwnProperty(filter)) {

            filters[filter] = decodeURIComponent(filters[filter]);
            var test = factory_operators.CreateOperator(keyMapping[filter]["type"], {
                attribute_name: keyMapping[filter]["dynamo_name"],
                operator: keyMapping[filter]["operator"],
                argument_name: filter,
                argument_value: filters[filter]
            });

            var returnArr = "FilterExpression";
            if (indexDefinitions.indexOf(keyMapping[filter]['dynamo_name']) !== -1) {
                returnArr = "KeyConditionExpression";
            }

            parsedFilters[returnArr].push(test);
        }
    }
    var keyConditionBuilder = factory_operators.CreateQueryConstructor(parsedFilters["KeyConditionExpression"], "AND");
    var filterBuilder = factory_operators.CreateQueryConstructor(parsedFilters["FilterExpression"], "AND");

    filterBuilder.build();
    keyConditionBuilder.build();

    console.log("filtry query: ",filterBuilder.parsedQuery);
    console.log("filtry values: ",filterBuilder.parsedAttributeValues);
    console.log("filtry names: ",filterBuilder.parsedAttributeNames);

    console.log("klucze query: ",keyConditionBuilder.parsedQuery);
    console.log("klucze values: ",keyConditionBuilder.parsedAttributeValues);
    console.log("klucze names: ",keyConditionBuilder.parsedAttributeNames);

    // returnObj["KeyConditionExpression"] = keyConditionBuilder.parsedQuery();
    // returnObj["FilterExpression"] = filterBuilder.parsedQuery();

    returnObj["KeyConditionExpression"] = keyConditionBuilder.parsedQuery;
    returnObj["FilterExpression"] = filterBuilder.parsedQuery;

    for(var filterValue in filterBuilder.parsedAttributeValues)
    {
        returnObj["ExpressionAttributeValues"][filterValue] = filterBuilder.parsedAttributeValues[filterValue];
    }
    for(var keyValue in keyConditionBuilder.parsedAttributeValues)
    {
        returnObj["ExpressionAttributeValues"][keyValue] = keyConditionBuilder.parsedAttributeValues[keyValue];
    }

    for(var filterValue in filterBuilder.parsedAttributeNames)
    {
        returnObj["ExpressionAttributeNames"][filterValue] = filterBuilder.parsedAttributeNames[filterValue];
    }
    for(var keyValue in keyConditionBuilder.parsedAttributeNames)
    {
        returnObj["ExpressionAttributeNames"][keyValue] = keyConditionBuilder.parsedAttributeNames[keyValue];
    }

    return returnObj;
}

function dynamoPrepareExpressions(filters, indexName) {
  var returnObj = {
    KeyConditionExpression: "",
    FilterExpression: "",
    ExpressionAttributeValues: {}
  };
  var indexDefinitions = config.indices[indexName]['keyFields'];
  var keyMapping = config.dynamoKeyMap;

    // Object.keys(filters).forEach(function (key) {
    //     filters[key] = decodeURIComponent(filters[key]) });

  for (var filter in filters) {
    if (filters.hasOwnProperty(filter)) {
        filters[filter] = decodeURIComponent(filters[filter]);
      var returnArr = "FilterExpression";
      if (indexDefinitions.indexOf(keyMapping[filter]['value']) !== -1) {
        returnArr = "KeyConditionExpression";
      }
      if (returnObj[returnArr].length > 0) {
        returnObj[returnArr] += " AND ";
      }

      if (typeof filters[filter] === 'object') {
        returnObj[returnArr] +=
            keyMapping[filter]['value']
            + " " +
            keyMapping[filter]['operator']
            + " " +
            ":" + filter + "0"
            + " AND " +
            ":" + filter + "1";
        returnObj['ExpressionAttributeValues'][":" + filter + "0"] = filters[filter][0];
        returnObj['ExpressionAttributeValues'][":" + filter + "1"] = filters[filter][1];
      }
      else {
        returnObj[returnArr] +=
            keyMapping[filter]['value']
            + " " +
            keyMapping[filter]['operator']
            + " " +
            ":" + filter;
        returnObj['ExpressionAttributeValues'][":" + filter] = filters[filter];
      }
    }
  }
  return returnObj;

  var retArray = [];
  if (filters['date_from'] && filters['date_to']) {
    filters['date_between'] = [filters['date_from'], filters['date_to']];
    delete filters['date_from'], filters['date_to'];
  }
  Object.keys(filters).forEach(function (key) {
    filters[key] = decodeURIComponent(filters[key]);
    switch (key) {
      case 'date_from':
        retArray['notificationTime'] = {
          AttributeValueList: {
            S: filters[key]
          },
          ComparisonOperator: 'GE'
        };
        break;
      case 'date_to':
        retArray['notificationTime'] = {
          AttributeValueList: {
            S: filters[key]
          },
          ComparisonOperator: 'LE'
        };
        break;
      case 'date_between':
        retArray['notificationTime'] = {
          AttributeValueList: [filters[key][0], filters[key][1]],
          ComparisonOperator: 'BETWEEN'
        };
        break;
      case 'user_mail':
        retArray['destinationAddress'] = {
          AttributeValueList: {
            S: filters[key]
          },
          ComparisonOperator: 'CONTAINS'
        };
        break;
      default:
        break;
    }
  });

  return retArray;
}

function urlDeserialize(unserializedString) {
  var parsedFilters = {};

  var filters = unserializedString.split("&");
  for (var i = 0, l = filters.length; i < l; i++) {
    var temp = filters[i].split('=');
    parsedFilters[temp[0]] = temp[1];
  }

  return parsedFilters;
}

exports.prepareParams = function (request, dynamoDbTableName, dynamoDbTableIndexName) {
  var params = {
    TableName: dynamoDbTableName,
    IndexName: dynamoDbTableIndexName,
    KeyConditionExpression: "notificationType = :bounce",
    ExpressionAttributeValues: {
      ':bounce': 'Bounce'
    }
  };

  if (request.query.lastEvalKey) {
    params["ExclusiveStartKey"] = JSON.parse(request.query.lastEvalKey);
  }

  if (request.query.appliedFilters) {
    var filters = urlDeserialize(request.query.appliedFilters);

    if (filters['date_from'] && filters['date_to']) {
      filters['date_between'] = [filters['date_from'], filters['date_to']];
      delete filters['date_from'];
      delete filters['date_to'];
    }
    filters['bounce'] = "Bounce";
    var expressions = dynamoParseExpressions(filters, dynamoDbTableIndexName);

    params['KeyConditionExpression'] = expressions['KeyConditionExpression'];
    if (expressions['FilterExpression'].length > 0) {
      params['FilterExpression'] = expressions['FilterExpression'];
    }
    params['ExpressionAttributeValues'] = expressions['ExpressionAttributeValues'];
    params['ExpressionAttributeNames'] = expressions['ExpressionAttributeNames'];
  }
    // params['FilterExpression'] = "contains(destinationAddress, :test)";
    // params['ExpressionAttributeValues'][':test'] = 'kris';
    // params['FilterExpression'] = "#test.#test2 = :test";
    // params['ExpressionAttributeValues'][':test'] = "noreply@business.dk";
    // params['ExpressionAttributeNames'] = {
    //     '#test': "mail",
    //     '#test2': "source"
    // };
console.log(params);
  return params;
};


exports.dataParser = function (data) {
  var dataSet = {
    data: []
  };

  for (var i = 0; i < data['Items'].length; i++) {
    var notificationTime = data['Items'][i]['notificationTime'];
    notificationTime = notificationTime.substring(0, notificationTime.lastIndexOf("."));
    notificationTime = notificationTime.replace(/T/gi, ' ');

    var destinationAddress = data['Items'][i]['destinationAddress'];
    var senderEMail = data['Items'][i]['mail']['commonHeaders']['from'][0];
    if(typeof senderEMail === "string")
    {
        senderEMail = senderEMail.replace("<","[");
        senderEMail = senderEMail.replace(">","]");
    }
    var senderLocation = data['Items'][i]['mail']['commonHeaders']['messageId'];
    senderLocation = senderLocation.substring(senderLocation.lastIndexOf("@") + 1, senderLocation.lastIndexOf(">"));
    var subject = data['Items'][i]['mail']['commonHeaders']['subject'];

    dataSet.data.push([
      notificationTime,
      destinationAddress,
      senderEMail,
      senderLocation,
      subject
    ]);
  }
  if (data["LastEvaluatedKey"]) {
    dataSet.lastEvalKey = data["LastEvaluatedKey"];
  }

  return dataSet;
};