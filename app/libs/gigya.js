const request = require('request-promise-native');
const gigya = {
  GIGYA_HOSTNAME: 'gigya.com',
  GIGYA_APP_KEY: process.env.GIGYA_APP_KEY,
  GIGYA_USER_KEY: process.env.GIGYA_USER_KEY,
  GIGYA_SECRET: process.env.GIGYA_SECRET,
  GIGYA_PROTOCOL: 'https://',
  GIGYA_DC: 'eu1',
};

function gigyaRequest(path, payload = null) {
  return request(
    `${gigya.GIGYA_PROTOCOL}accounts.${gigya.GIGYA_DC}.${gigya.GIGYA_HOSTNAME}${path}`,
    {
      method: 'POST',
      form: payload,
      json: true,
      qs: {
        apiKey: gigya.GIGYA_APP_KEY,
        userKey: gigya.GIGYA_USER_KEY,
        secret: gigya.GIGYA_SECRET,
      },
    },
  );
}
async function searchAccount(mail) {
  const query = `select UID, profile.email from accounts where loginIDs.emails contains '${mail}'`
  const response= await gigyaRequest('/accounts.search', query);
  if (response.statusCode === 200) {
    return response;
  }

  throw new Error('User not found');
}

async function deleteGigyaAccount(params) {
  const response= await gigyaRequest('/accounts.delete', params);
  if (response.statusCode === 200) {
    return response;
  }

  throw new Error('User not found');
}

exports.delete = function (request, response) {
  try {
    const { mail } = request.body;
    const gigyaUser = searchAccount(mail);

    response.send('OK');
  } catch (err) {
    response.send(500)
  }

}
