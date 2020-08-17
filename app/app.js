var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    apiRoutes = require('./routes/api');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/api/getBounces', apiRoutes.getBounces);
app.get('/api/getComplaints', apiRoutes.getComplaints);

app.use(express.static(path.join(__dirname, '../dist/')));
// Here's the new code:
app.use('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.listen(3000, function () {
    console.log('Listening on port %d', server.address().port);
});
