var dynamoAPI = require("../aws-dynamo-api/index.js");

exports.getBounces = function (request, response) {
    dynamoAPI.getBounces(request, response);
};