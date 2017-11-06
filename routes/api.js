function dynamoParamBuilder(filters) {
    var retArray = [];
    if (filters['date_from'] && filters['date_to']) {
        filters['date_between'] = [filters['date_from'], filters['date_to']];
        delete filters['date_from'], filters['date_to'];
    }
    Object.keys(filters).forEach(function (key) {
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
            default:
                break;
        }
    });

    return retArray;
}

function scanRecursive(docClient, params, aggregateData, callback) {
    console.log("Sending one scan request to AWS, SES-Notification");
    docClient.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        }

        if (!aggregateData) {
            aggregateData = data;
        }
        else {
            aggregateData["Items"].concat(data["Items"]);
            aggregateData["Count"] += data["Count"];
            aggregateData["ScannedCount"] += data["ScannedCount"];
        }

        if (data["LastEvaluatedKey"]) {
            params["ExclusiveStartKey"] = {
                "notificationId": data["LastEvaluatedKey"]["notificationId"]
                , "notificationTime": data["LastEvaluatedKey"]["notificationTime"]
            };

            scanRecursive(docClient, params, aggregateData, callback);
        }
        else {
            //console.log("GetItem succeeded:", JSON.stringify(aggregateData, null, 2));
            console.log("Finished scan requests to AWS, SES-Notification");
            callback('', aggregateData);
        }
    });
}

function dataParser(data) {
    var dataSet = {
        data: []
    };

    for (var i = 0; i < data['Items'].length; i++) {
        var notificationTime = data['Items'][i]['notificationTime'];
        notificationTime = notificationTime.substring(0, notificationTime.lastIndexOf("."));
        notificationTime = notificationTime.replace(/T/gi, ' ');

        var destinationAddress = data['Items'][i]['destinationAddress'];
        var senderEMail = data['Items'][i]['mail']['commonHeaders']['from'];
        var senderLocation = data['Items'][i]['mail']['commonHeaders']['messageId'];
        senderLocation = senderLocation.substring(senderLocation.lastIndexOf("@") + 1, senderLocation.lastIndexOf(">"));
        var subject = data['Items'][i]['mail']['commonHeaders']['subject'];

        dataSet.data.push([
            notificationTime,
            destinationAddress,
            senderEMail,
            senderLocation,
            subject,
        ]);
    }
    if (data["LastEvaluatedKey"]) {
        dataSet.lastEvalKey = data["LastEvaluatedKey"];
    }

    return dataSet;
}

// awsClientConnection.scan(params, function (err, data) {
//     if (err) {
//         console.log("Error", err);
//     }
//
//     for (var i = 0; i < data['Items'].length; i++) {
//         var notificationTime = data['Items'][i]['notificationTime'];
//         notificationTime = notificationTime.substring(0, notificationTime.lastIndexOf("."));
//         notificationTime = notificationTime.replace(/T/gi,' ');
//
//         var destinationAddress = data['Items'][i]['destinationAddress'];
//         var senderEMail = data['Items'][i]['mail']['commonHeaders']['from'];
//         var senderLocation = data['Items'][i]['mail']['commonHeaders']['messageId'];
//         senderLocation = senderLocation.substring(senderLocation.lastIndexOf("@") + 1, senderLocation.lastIndexOf(">"));
//         var subject = data['Items'][i]['mail']['commonHeaders']['subject'];
//
//         dataSet.data.push([
//             notificationTime,
//             destinationAddress,
//             senderEMail,
//             senderLocation,
//             subject,
//         ]);
//     }
//     if (data["LastEvaluatedKey"]) {
//         dataSet.lastEvalKey = data["LastEvaluatedKey"];
//     }
//
//     callback('0', dataSet);
// });

function singleScan(awsClientConnection, params, callback) {
    console.log("Sending one scan request to AWS, SES-Notification");

    var singleScanRequest = awsClientConnection.scan(params);

    singleScanRequest.
        on('success', function(response) {
            console.log("Success!");
            callback(null, response.data);
        }).
        on('error', function(response) {
            console.log("Error!",response.error);
            callback(response.error, null);
        }).
        send();
}

var AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var dynamoDbTable = "SESNotifications";

var docClient = new AWS.DynamoDB.DocumentClient();

exports.scan = function (req, res) {
    var params = {
        TableName: dynamoDbTable
        , FilterExpression: 'notificationType = :valueNotificationType'
        , ExpressionAttributeValues: {':valueNotificationType': "Bounce"}
    };

    scanRecursive(docClient, params, undefined, function (err, obj) {
        res.json(obj);
    });
};

function recursiveScanForward(resultsAmount, connection, params, callback, aggregatedData) {
    singleScan(connection, params, function (err, obj) {
        if(!aggregatedData) {
            aggregatedData = obj;
        }
        else {
            aggregatedData["Items"] = aggregatedData["Items"].concat(obj["Items"]);
            aggregatedData["Count"] += obj["Count"];
            aggregatedData["LastEvaluatedKey"] = obj["LastEvaluatedKey"];
        }

        console.log(aggregatedData["Items"].length);
        console.log(obj["Items"].length);

        if(aggregatedData["Count"] < resultsAmount)
        {
            if(!aggregatedData["LastEvaluatedKey"]) {
                callback(0, aggregatedData);
            }
            else {
                params["ExclusiveStartKey"] = aggregatedData["LastEvaluatedKey"];
                recursiveScanForward(resultsAmount, connection, params, callback, aggregatedData);
            }
        }
        else
        {
            aggregatedData["Items"] = aggregatedData["Items"].slice(0,resultsAmount);

            if(aggregatedData["Count"] !== resultsAmount){
                aggregatedData["LastEvaluatedKey"] = {
                    "notificationId": aggregatedData["Items"][aggregatedData["Items"].length-1]["notificationId"]
                    ,"notificationTime" : aggregatedData["Items"][aggregatedData["Items"].length-1]["notificationTime"]
                };
            }

            callback(0, aggregatedData);
        }
    });
};

exports.getBounces = function (req, res) {
    var resultsAmount = 50;

    var params = {
        TableName: dynamoDbTable
    };

    if (req.query.lastEvalKey) {
        params["ExclusiveStartKey"] = JSON.parse(req.query.lastEvalKey);
    }

    if (req.query.appliedFilters) {
        var parsedFilters = {};
        var filters = req.query.appliedFilters.split("&");
        for (var i = 0, l = filters.length; i < l; i++) {
            var temp = filters[i].split('=');
            parsedFilters[temp[0]] = temp[1];
        }
        params['ScanFilter'] = dynamoParamBuilder(parsedFilters);
        params['ScanFilter']['notificationType'] = {
            AttributeValueList: {
                S: 'Bounce'
            },
            ComparisonOperator: 'EQ'
        };
    }

    recursiveScanForward(resultsAmount, docClient, params, function (err, obj) {
        // console.log(obj);
        res.json(dataParser(obj));
    });
};