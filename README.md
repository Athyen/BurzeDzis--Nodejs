```javascript


var express = require('express');
var app = express();
var assert = require('assert');

var url = 'https://burze.dzis.net/soap.php?WSDL';
var key = 'your key api';
var range = 100
var client = new (require('./lib/soap.js'))(url, key, range);

client.on('connect', function (err) {
    assert.ifError(err);
});

app.get('/', function (req, res) {
    client.getCoordsByName(req.query.city, function (coords) {
        if (coords.success) {
            client.getLightnings({
                x: coords.success.x,
                y: coords.success.y
            }, function (data) {
                res.json(data);
            });
        };
        if (coords.error) {
            res.json(coords);
        };
    });
});

app.listen(3000);
```