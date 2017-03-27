var key = 'Your key API';
var url = 'https://burze.dzis.net/soap.php?WSDL';
var range = 100;
var lightnings = require('./burze.js');

lightnings(url, key, range, function (client) {

    client.lightning('Katowice').then(function (lightning) {
        console.log(lightning);
    }).catch(function (err) {
        console.log(err)
    });


    client.lightningSeries(['Katowice', 'Warszawa', 'Kraków', 'Poznań']).then(function (lightnings) {
        console.log(lightnings)
    }).catch(function (err) {
        console.log(err)
    })


    client.warnings('Katowice').then(function (warnings) {
        console.log(warnings)
    })
});
