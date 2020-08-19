const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client = new OAuth2Client();

async function verifyIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload)
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    const domain = payload['hd'];
    if (domain !== 'persgroep.net') {
      throw new Error('Unauthorized')
    }
  } catch (err) {
    console.error(err)
  }
}

exports.verifySignIn = async function (request, response) {
  const idToken = request.body.id_token;

  try {
    await verifyIdToken(idToken);
    response.send('Wygrales w zycie');
  } catch (err) {
    console.error(err)
    response.send(401, err.message)
  }
}

exports.auth = async function (request, response, next) {
  const idToken = request.headers.authorization;

  try {
    await verifyIdToken(idToken);
    next();
  } catch (err) {
    console.error(err)
    response.send(401, err.message)
  }
}
