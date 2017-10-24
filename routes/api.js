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