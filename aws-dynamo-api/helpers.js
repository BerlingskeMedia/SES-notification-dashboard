var config = require('../config');
var parser = require('./operators');

function urlDeserialize(unserializedString) {
  let parsedFilters = {};

  let filters = unserializedString.split("&");
  for (let i = 0, l = filters.length; i < l; i++) {
    let temp = filters[i].split('=');
    parsedFilters[temp[0]] = temp[1];
  }

  return parsedFilters;
}

exports.prepareParams = function (request, dynamoDbTableName, dynamoDbTableIndexName) {
  let params = {
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
    let filters = urlDeserialize(request.query.appliedFilters);

    if (filters['date_from'] && filters['date_to']) {
      filters['date_between'] = [filters['date_from'], filters['date_to']];
      delete filters['date_from'];
      delete filters['date_to'];
    }
    filters['bounce'] = "Bounce";

    let parsedFilters = parser.Parse(config.dynamoDefinitions, config.indices[dynamoDbTableIndexName]["keyFields"], filters);

    let keyConditionExpression = parser.KeyConditionExpression(parsedFilters);
    let filterExpression = parser.FilterExpression(parsedFilters);
    let expressionAttributeValues = parser.ExpressionAttributeValues(parsedFilters);
    let expressionAttributeNames = parser.ExpressionAttributeNames(parsedFilters);


    params['KeyConditionExpression'] = keyConditionExpression;
    if (filterExpression.length > 0) {
      params['FilterExpression'] = filterExpression;
    }
    params['ExpressionAttributeValues'] = expressionAttributeValues;
    params['ExpressionAttributeNames'] = expressionAttributeNames;
  }

  return params;
};


exports.dataParser = function (data) {
  let dataSet = {
    data: []
  };

  for (let i = 0; i < data['Items'].length; i++) {
    let notificationTime = data['Items'][i]['notificationTime'];
    notificationTime = notificationTime.substring(0, notificationTime.lastIndexOf("."));
    notificationTime = notificationTime.replace(/T/gi, ' ');

    let destinationAddress = data['Items'][i]['destinationAddress'];
    let senderEMail = data['Items'][i]['mail']['commonHeaders']['from'][0];
    if(typeof senderEMail === "string")
    {
        senderEMail = senderEMail.replace("<","[");
        senderEMail = senderEMail.replace(">","]");
    }
    let senderLocation = data['Items'][i]['mail']['commonHeaders']['messageId'];
    senderLocation = senderLocation.substring(senderLocation.lastIndexOf("@") + 1, senderLocation.lastIndexOf(">"));
    let subject = data['Items'][i]['mail']['commonHeaders']['subject'];

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