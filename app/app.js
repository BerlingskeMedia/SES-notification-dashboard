var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    apiRoutes = require('./routes/api');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/api/getBounces', apiRoutes.getBounces);
app.get('/api/getComplaints', apiRoutes.getComplaints);

app.use(express.static(__dirname + '/'));
// Here's the new code:
app.use('/*', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});
