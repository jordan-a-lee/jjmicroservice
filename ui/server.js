

var express = require('express');
var app = express();
var bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3030;



app.use('/static', express.static(__dirname + '/static'));

app.get('*', function (req, res) {
    // res.sendFile(path.resolve('../../ui/index.html'));
    res.sendFile(__dirname + '/static/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    // res.sendFile(__dirname + '/../../ui/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});



app.listen(port);
console.log('Port listening on ' + port);
