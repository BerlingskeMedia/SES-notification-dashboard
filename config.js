let config = {};

config.apiKeys = {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
};

config.indices = {
    bouncedTimeIndex: {
        keyFields: [
            'notificationId',
            'notificationType',
            'notificationTime'
        ]
    }
};

config.dynamoDefinitions = {
    date_from: {
        attribute: "notificationTime",
        operator: '>=',
        formula: "%attribute %operator %argument"
    },
    date_to: {
        attribute: "notificationTime",
        operator: '<=',
        formula: "%attribute %operator %argument"
    },
    date_between: {
        attribute: "notificationTime",
        operator: "BETWEEN",
        formula: "%attribute %operator %argument"
    },
    bounce: {
        attribute: "notificationType",
        operator: "=",
        formula: "%attribute %operator %argument"
    },
    user_mail: {
        attribute: "destinationAddress",
        operator: "contains",
        formula: "%operator(%attribute, %argument)"
    },
    sender_mail: {
        attribute: "mail.commonHeaders.from[0]",
        operator: "contains",
        formula: "%operator(%attribute, %argument)"
    }
};

module.exports = config;