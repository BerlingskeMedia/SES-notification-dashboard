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

function singleScan(docClient, params, callback) {
    var dataSet = {
        data: []
    };

    console.log("Sending one scan request to AWS, SES-Notification");
    docClient.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        }

        for (var i = 0; i < data['Items'].length; i++) {
            var notificationTime = data['Items'][i]['notificationTime'];
            notificationTime = notificationTime.substring(0, notificationTime.lastIndexOf("."));
            notificationTime = notificationTime.replace(/T/gi,' ');

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

        callback('0', dataSet);
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

exports.getBounces = function (req, res) {
    var params = {
        TableName: dynamoDbTable
        // ,FilterExpression: 'notificationType = :valueNotificationType'
        // ,ExpressionAttributeValues : {':valueNotificationType' : "Bounce"}
    };

    if (req.query.lastEvalKey) {
        params["ExclusiveStartKey"] = JSON.parse(req.query.lastEvalKey);
    }

    if (req.query.appliedFilters) {
        var parsedFilters = {};
        var filters = req.query.appliedFilters.split("&");
        for (i = 0, l = filters.length; i < l; i++) {
            temp = filters[i].split('=');
            parsedFilters[temp[0]] = temp[1];
        }
        params['ScanFilter'] = dynamoParamBuilder(parsedFilters);
        params['ScanFilter']['notificationType'] = {
            AttributeValueList: {
                S: 'Bounce'
            },
            ComparisonOperator: 'EQ'
        };
        console.log(parsedFilters);
        console.log(params);
    }

    singleScan(docClient, params, function (err, obj) {
        //TODO: error handling
        res.json(obj);
    });
};