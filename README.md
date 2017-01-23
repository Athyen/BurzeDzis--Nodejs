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
var client = new (require('./soap.js'))(url, key, range); // nowa instancja

client.on('connect', function (err) { // wykonuję sie po próbie połączenia
    assert.ifError(err); // zwraca err jeżeli wystąpił problem z połączeniem
});

app.get('/', function (req, res) {
    client.getCoordsByName(req.query.city, function (coords) { // req.query.city miasto w formacie tekstowym
        if (coords.success) {
            var x = coords.success.x;
            var y = coords.success.y;
            client.getLightnings({
                x: x,
                y: y
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

### Każda odpowiedź serwera jest w formacie JSON i zawiera właściwości jak success i error

W razie problemów proszę pisać na mjura8420[at]gmail.com