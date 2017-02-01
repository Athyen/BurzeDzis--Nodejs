var express = require('express');
var app = express();
var assert = require('assert');

var url = 'https://burze.dzis.net/soap.php?WSDL';
var key = '35fd0b78a979128f6241d457b4b12ef299a16c32';
var range = 100;
var client = new(require('./burze.js'))(url, key, range);

client.on('connect', function (err) {
    assert.ifError(err);
});

app.get('/', function (req, res) {
//    client.getCoordsByName('Katowice').then(function (coords) {
//        
//        client.getLightnings(coords).then(function (lightnings) {
//            res.json(lightnings);
//        }).catch(function (err) {
//            res.json(err);
//        });
//        
//        client.getWarnings(coords).then(function(warnings){
//            console.log(warnings)
//        }).catch(function(err){
//            console.log(err);
//        })
//        
//    }).catch(function (err) {
//        res.json(err);
//    });
//    
    client.series(['Kraków', 'Katowice', 'Kielce', 'Warszawa', 'Gdańsk']).then(function (lightnings) { // built-in method client.getLightnings()
        res.json(lightnings);
    }).catch(function (error) {
        res.json(error);
    });
});

app.listen(3000);