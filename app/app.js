var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    apiRoutes = require('./routes/api'),
    google = require('./libs/google');
var path = require('path');
var cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(function(req, res, next) {
  console.log(
    req.originalUrl,
    req.headers,
  );
  next();
});
app.use(cors());
app.post('/api/tokensignin', google.verifySignIn);
app.get('/api/getBounces', google.auth, apiRoutes.getBounces);
app.get('/api/getComplaints', google.auth, apiRoutes.getComplaints);

app.use(express.static(path.join(__dirname, '../dist/')));
// Here's the new code:
app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});
