function dynamoPrepareFilters(filters) {
    var retArray = [];
    if (filters['date_from'] && filters['date_to']) {
        filters['date_between'] = [filters['date_from'], filters['date_to']];
        delete filters['date_from'], filters['date_to'];
    }
    Object.keys(filters).forEach(function (key) {
        filters[key] =  decodeURIComponent(filters[key]);
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
        KeyConditions: {},
        QueryFilter: {}
    };

    if (request.query.lastEvalKey) {
        params["ExclusiveStartKey"] = JSON.parse(request.query.lastEvalKey);
    }

    if (request.query.appliedFilters) {
        var filters = urlDeserialize(request.query.appliedFilters);
        params['QueryFilter'] = dynamoPrepareFilters(filters);
    }

    params['KeyConditions']['notificationType'] = {
        AttributeValueList: {
            S: 'Bounce'
        },
        ComparisonOperator: 'EQ'
    };
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
        var senderEMail = data['Items'][i]['mail']['commonHeaders']['from'];
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