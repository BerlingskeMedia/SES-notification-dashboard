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
  date_from:
      {
        value: "notificationTime",
        operator: '>='
      },
  date_to:
      {
        value: "notificationTime",
        operator: '<='
      },
  date_between:
      {
        value: "notificationTime",
        operator: "BETWEEN"
      },
  bounce:
      {
        value: "notificationType",
        operator: "="
      }
};

module.exports = config;