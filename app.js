var express = require('express');
var app = express();
var assert = require('assert');

var url = 'https://burze.dzis.net/soap.php?WSDL';
var key = '';
var range = 100;
var client = new (require('./burze.js'))(url, key, range);

client.on('connect', function (err) {
    assert.ifError(err);
});

app.get('/', function (req, res) {
//    client.getCoordsByName(req.query.city, function (coords) {
//        if (coords.success) {
//            var x = coords.success.x;
//            var y = coords.success.y;
//            client.getLightnings({
//                x: x,
//                y: y
//            }, function (data) {
//                res.json(data);
//            });
//        };
//        if (coords.error) {
//            res.json(coords);
//        };
//    });
    
    client.series(['Kraków', 'Katowice', 'Kielce']).then(function(response){
        res.json(response);
    }).catch(function(error){
        res.json(error);
    });
});

app.listen(3000);