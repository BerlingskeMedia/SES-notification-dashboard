function scanRecursive(docClient, params, aggregateData, callback) {
    console.log("Sending one scan request to AWS, SES-Notification");
    docClient.scan(params, function(err, data) {
        if(err) {
            console.log("Error", err);
        }

        if(!aggregateData) {
            aggregateData = data;
        }
        else {
            aggregateData["Items"].concat(data["Items"]);
            aggregateData["Count"] += data["Count"];
            aggregateData["ScannedCount"] += data["ScannedCount"];
        }

        if(data["LastEvaluatedKey"]) {
            params["ExclusiveStartKey"] = {
                "notificationId": data["LastEvaluatedKey"]["notificationId"]
                ,"notificationTime" : data["LastEvaluatedKey"]["notificationTime"]
            };

            scanRecursive(docClient, params, aggregateData, callback);
        }
        else {
            //console.log("GetItem succeeded:", JSON.stringify(aggregateData, null, 2));
            console.log("Finished scan requests to AWS, SES-Notification");
            callback('',aggregateData);
        }
    });
}

function singleScan(docClient, params, callback) {
  var dataSet = {
    data : []
  };

  console.log("Sending one scan request to AWS, SES-Notification");
  docClient.scan(params, function(err, data) {
    if(err) {
      console.log("Error", err);
    }

    for(i=0; i<data['Items'].length; i++) {
        dataSet.data.push([
          data['Items'][i]['notificationTime'],
          data['Items'][i]['destinationAddress'],
          data['Items'][i]['mail']['commonHeaders']['from'],
          data['Items'][i]['mail']['commonHeaders']['messageId'],
          data['Items'][i]['mail']['commonHeaders']['subject'],
        ]);
    }
    if(data["LastEvaluatedKey"]) {
      dataSet.lastEvalKey = data["LastEvaluatedKey"];
    }

    callback('0',dataSet);
  });
}

var AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var dynamoDbTable = "SESNotifications";

var docClient = new AWS.DynamoDB.DocumentClient();

exports.scan = function(req, res) {
    var params = {
        TableName: dynamoDbTable
        ,FilterExpression: 'notificationType = :valueNotificationType'
        ,ExpressionAttributeValues : {':valueNotificationType' : "Bounce"}
    };

    scanRecursive(docClient, params, undefined, function(err, obj) {
        res.json(obj);
    });
};

exports.getBounces = function(req, res) {
  var params = {
    TableName: dynamoDbTable
    ,FilterExpression: 'notificationType = :valueNotificationType'
    ,ExpressionAttributeValues : {':valueNotificationType' : "Bounce"}
  };

  if(req.query.lastEvalKey) {
    params["ExclusiveStartKey"] = JSON.parse(req.query.lastEvalKey);
  }

  singleScan(docClient, params, function(err, obj) {
    //TODO: error handling
    res.json(obj);
  });
};