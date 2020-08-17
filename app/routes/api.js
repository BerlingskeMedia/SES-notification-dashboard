var dynamoAPI = require("../aws-dynamo-api/index.js");

exports.getBounces = function (request, response) {
    dynamoAPI.getBounces(request, response);
};

exports.getComplaints = function (request, response) {
    dynamoAPI.getComplaints(request, response);
};

exports.updateTable = function (request, response) {
    dynamoAPI.updateTable(request, response);
};
