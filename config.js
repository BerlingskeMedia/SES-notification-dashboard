var config = {};

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

config.dynamoKeyMap = {
    date_from: {
        value: "notificationTime",
        operator: '>='
    },
    date_to: {
        value: "notificationTime",
        operator: '<='
    },
    date_between: {
        value: "notificationTime",
        operator: "BETWEEN"
    },
    bounce: {
        value: "notificationType",
        operator: "="
    },
    user_mail: {
        value: "destinationAddress",
        operator: "="
    },
    sender_mail: {
        value: "mail.commonHeaders.from[0]",
        operator: "="
    }
};


config.dynamoDefinitions = {
    date_from: {
        dynamo_name: "notificationTime",
        operator: '>='
    },
    date_to: {
        dynamo_name: "notificationTime",
        operator: '<='
    },
    date_between: {
        dynamo_name: "notificationTime",
        operator: "BETWEEN",
        type: "TripleFilter"
    },
    bounce: {
        dynamo_name: "notificationType",
        operator: "="
    },
    user_mail: {
        dynamo_name: "destinationAddress",
        operator: "contains",
        type: "MethodFilter"
    },
    sender_mail: {
        dynamo_name: "mail.commonHeaders.from[0]",
        operator: "contains",
        type: "MethodFilter"
    }
};

module.exports = config;