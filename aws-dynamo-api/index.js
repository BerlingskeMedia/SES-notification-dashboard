var helpers = require("./helpers");
var AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var dynamoDbClient = new AWS.DynamoDB.DocumentClient();

function singleScan(awsClientConnection, params, callback) {
    console.log("Sending one scan request to AWS, SES-Notification");

    var singleScanRequest = awsClientConnection.scan(params);

    singleScanRequest.
    on('success', function(response) {
        console.log("Success!");
        callback(null, response.data);
    }).
    on('error', function(response) {
        console.log("Error!",response);
        callback(response.error, null);
    }).
    send();
}

function awsRecursiveFetch (connection, params, fetchOperation, finishCallback, expectedHits, aggregatedData) {
    fetchOperation(connection, params, function (err, data) {
        expectedHits = (typeof expectedHits !== 'undefined') ?  expectedHits : 50;

        if(typeof aggregatedData === 'undefined') {
            aggregatedData = data;
        }
        else {
            aggregatedData["Items"] = aggregatedData["Items"].concat(data["Items"]);
            aggregatedData["Count"] += data["Count"];
            aggregatedData["LastEvaluatedKey"] = data["LastEvaluatedKey"];
        }

        console.log(aggregatedData["Items"].length);
        console.log(data["Items"].length);

        if(aggregatedData["Count"] < expectedHits)
        {
            if(!aggregatedData["LastEvaluatedKey"]) {
                finishCallback(0, aggregatedData);
            }
            else {
                params["ExclusiveStartKey"] = aggregatedData["LastEvaluatedKey"];
                awsRecursiveFetch(connection, params, fetchOperation, finishCallback, expectedHits, aggregatedData);
            }
        }
        else
        {
            aggregatedData["Items"] = aggregatedData["Items"].slice(0,expectedHits);

            if(aggregatedData["Count"] !== expectedHits){
                aggregatedData["LastEvaluatedKey"] = {
                    "notificationId": aggregatedData["Items"][aggregatedData["Items"].length-1]["notificationId"]
                    ,"notificationTime" : aggregatedData["Items"][aggregatedData["Items"].length-1]["notificationTime"]
                };
            }

            finishCallback(0, aggregatedData);
        }
    });
}

exports.getBounces = function (request, response){
    var params = helpers.prepareParams(request, "SESNotifications");

    awsRecursiveFetch(dynamoDbClient, params,
        function (connection, params, callback) {
            singleScan(connection, params, callback);
        },
        function (err, data) {
            response.json(helpers.dataParser(data));
        }
    );
};