function scanRecursive(docClient, params, callback, aggregateData) {
    docClient.scan(params, function(err, data) {

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

            scanRecursive(docClient, params, callback, aggregateData);
        }
        else {
            //console.log("GetItem succeeded:", JSON.stringify(aggregateData, null, 2));
            console.log("Finished");
            callback('',aggregateData);
        }
    });
}

var AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var docClient = new AWS.DynamoDB.DocumentClient();

var dynamoDbTable = "SESNotifications";

var params = {
    TableName: dynamoDbTable
    ,FilterExpression: 'notificationType = :valueNotificationType'
    ,ExpressionAttributeValues : {':valueNotificationType' : "Bounce"}
};

exports.scan = function(req, res) {
    scanRecursive(docClient, params, function(err, obj) {
        res.json(obj);
    });
};