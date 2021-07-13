var helpers = require("./helpers");
var AWS = require("aws-sdk");
var config = require('../config');

AWS.config.update(config.apiKeys);

var dynamoDbClient = new AWS.DynamoDB.DocumentClient();

function singleQuery(awsClientConnection, params, callback) {
    console.log("Sending one query request to AWS, SES-Notification");
    var singleQueryRequest = awsClientConnection.query(params);

    singleQueryRequest.on('success', function (response) {
        console.log("Success!");
        callback(null, response.data);
    }).on('error', function (response) {
        console.log("Error!", response);
        callback(response.error, null);
    }).send();
}

function awsRecursiveFetch(connection, params, fetchOperation, finishCallback, expectedHits, aggregatedData) {
    fetchOperation(connection, params, function (err, data) {
        expectedHits = (typeof expectedHits !== 'undefined') ? expectedHits : 50;

        if (typeof aggregatedData === 'undefined') {
            aggregatedData = data;
        }
        else {
            aggregatedData["Items"] = aggregatedData["Items"].concat(data["Items"]);
            aggregatedData["Count"] += data["Count"];
            aggregatedData["LastEvaluatedKey"] = data["LastEvaluatedKey"];
        }

        console.log("Current items: ", data["Items"].length);
        console.log("All items: ", aggregatedData["Items"].length);

        aggregatedData['stats'] = {}
        aggregatedData['stats']['sender_location'] = {}
        aggregatedData['stats']['subject'] = {}
        data["Items"].map((item) => {
          const subject = item['mail']['commonHeaders']['subject'];
          let senderLocation = item['mail']['commonHeaders']['messageId'] || '';
          senderLocation = senderLocation.substring(senderLocation.lastIndexOf("@") + 1, senderLocation.lastIndexOf(">"));
          if (aggregatedData['stats']['subject'][subject]) {
            aggregatedData['stats']['subject'][subject] +=1;
          } else {
            aggregatedData['stats']['subject'][subject] =1;
          }
          if (aggregatedData['stats']['sender_location'][senderLocation]) {
            aggregatedData['stats']['sender_location'][senderLocation] += 1;
          } else {
            aggregatedData['stats']['sender_location'][senderLocation] = 1;
          }
        });

        if (aggregatedData["Count"] < expectedHits) {
            if (!aggregatedData["LastEvaluatedKey"]) {
                finishCallback(0, aggregatedData);
            }
            else {
                params["ExclusiveStartKey"] = aggregatedData["LastEvaluatedKey"];
                awsRecursiveFetch(connection, params, fetchOperation, finishCallback, expectedHits, aggregatedData);
            }
        }
        else {
            aggregatedData["Items"] = aggregatedData["Items"].slice(0, expectedHits);

            if (aggregatedData["Count"] !== expectedHits) {
                aggregatedData["LastEvaluatedKey"] = {};
                var indexConfig = config.indices[params["IndexName"]]["keyFields"];
                var lastItem = aggregatedData["Items"][aggregatedData["Items"].length - 1];
                for (var i = 0; i < indexConfig.length; i++) {
                    aggregatedData['LastEvaluatedKey'][indexConfig[i]] = lastItem[indexConfig[i]];
                }
            }
            finishCallback(0, aggregatedData);
        }
    });
}

function getData(request, response, type) {
    var params = helpers.prepareParams(request, config.connectionData.tableName, config.connectionData.indexName, type);
    awsRecursiveFetch(dynamoDbClient, params,
      function (connection, params, callback) {
          singleQuery(connection, params, callback);
      },
      function (err, data) {
          response.json(helpers.dataParser(data));
      }
    );
}

exports.getBounces = function (request, response) {
    getData(request, response, 'Bounce');
};

exports.getComplaints = function (request, response) {
    getData(request, response, 'Complaint');
};
