var config = {};

config.apiKeys = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
};

config.indices = {
  bouncedTimeIndex: {
    LastEvaluatedKeyFields: [
        'notificationId',
        'notificationType',
        'notificationTime'
    ]
  }
};

module.exports = config;