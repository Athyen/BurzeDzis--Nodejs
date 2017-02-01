# burze.dzis.net
## jak używać?
#### w pliku app.js
```javascript
var express = require('express');
var app = express();
var assert = require('assert');

var url = 'https://burze.dzis.net/soap.php?WSDL';
var key = 'KEY';
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
```

### Każda odpowiedź serwera jest w formacie JSON i zawiera właściwości jak success i error

W razie problemów proszę pisać na mjura8420[at]gmail.com