function scanRecursive(params, aggregateData) {
    docClient.scan(params, function(err, data) {

        if(!aggregateData) {
            aggregateData = data;
        }
        else {
            aggregateData["Items"].concat(data["Items"]);
            aggregateData["Count"] += data["Count"];
            aggregateData["ScannedCount"] += data["ScannedCount"];
        }
        console.log("THIS STEP:", JSON.stringify(data["Count"], null, 2));
        console.log("ALL STEPS:", JSON.stringify(aggregateData["Count"], null, 2));

        if(data["LastEvaluatedKey"]) {
            params["ExclusiveStartKey"] = {
                "notificationId": data["LastEvaluatedKey"]["notificationId"]
                ,"notificationTime" : data["LastEvaluatedKey"]["notificationTime"]
            };

            scanRecursive(params, aggregateData);
        }
        else {
           // console.log("GetItem succeeded:", JSON.stringify(aggregateData, null, 2));
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

var table = "SESNotifications";

var params = {
    TableName: table
    ,FilterExpression: 'notificationType = :valueNotificationType'
    ,ExpressionAttributeValues : {':valueNotificationType' : "Bounce"}
};


scanRecursive(params);